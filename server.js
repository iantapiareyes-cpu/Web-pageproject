import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE_PATH = path.join(__dirname, 'data', 'contactReceived.json');
const SAVED_MEDIA_PATH = path.join(__dirname, 'data', 'savedMedia.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data directory and data/contactReceived.json exist
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE_PATH)) {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
  }
}

// Read contacts from App Storage (data/contactReceived.json)
function readContacts() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading contact file, resetting to []', err);
    return [];
  }
}

// Write contacts to App Storage (data/contactReceived.json)
function writeContacts(contacts) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(contacts, null, 2), 'utf8');
}

// Admin Sessions
const activeAdminTokens = new Map(); // token -> expiresAt
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, expiresAt] of activeAdminTokens.entries()) {
    if (expiresAt < now) {
      activeAdminTokens.delete(token);
    }
  }
}

// Admin Auth Middleware
function requireAdminAuth(req, res, next) {
  cleanupExpiredTokens();
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : req.headers['x-admin-token'];

  if (!token || !activeAdminTokens.has(token)) {
    return res.status(401).json({
      error: 'Unauthorized: Admin authentication required to access this resource.'
    });
  }

  next();
}

// --- Contact Endpoints ---

// POST /api/contact - Public contact submission
app.post('/api/contact', (req, res) => {
  try {
    const { firstName, lastName, email, reason, message } = req.body;

    // Validate required fields
    if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
      return res.status(400).json({ error: 'First Name is required.' });
    }
    if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
      return res.status(400).json({ error: 'Last Name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const validReasons = ['Comment', 'Question', 'Partnership', 'Opportunity', 'Other'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({
        error: `Reason for Contact must be one of: ${validReasons.join(', ')}.`
      });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // Read current data
    const contacts = readContacts();

    // Create new record
    const newRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      reason: reason,
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      replied: false,
      repliedAt: null
    };

    contacts.push(newRecord);
    writeContacts(contacts);

    return res.status(201).json(newRecord);
  } catch (err) {
    console.error('Failed to save contact submission:', err);
    return res.status(500).json({ error: 'Storage failure: could not process contact submission.' });
  }
});

// --- Admin Endpoints ---

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required.' });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect Admin password.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  activeAdminTokens.set(token, expiresAt);

  return res.status(200).json({
    success: true,
    token,
    message: 'Admin authenticated successfully.'
  });
});

// GET /api/admin/messages - Protected
app.get('/api/admin/messages', requireAdminAuth, (req, res) => {
  try {
    const contacts = readContacts();
    // Sort newest first
    const sorted = [...contacts].sort((a, b) => {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
    return res.status(200).json(sorted);
  } catch (err) {
    console.error('Error fetching admin messages:', err);
    return res.status(500).json({ error: 'Failed to retrieve message records.' });
  }
});

// PATCH /api/admin/messages/:id/replied - Protected
app.patch('/api/admin/messages/:id/replied', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const contacts = readContacts();
    const index = contacts.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Message not found with id: ' + id });
    }

    contacts[index].replied = true;
    contacts[index].repliedAt = new Date().toISOString();

    writeContacts(contacts);

    return res.status(200).json({
      success: true,
      message: contacts[index]
    });
  } catch (err) {
    console.error('Error updating replied status:', err);
    return res.status(500).json({ error: 'Failed to update message reply status.' });
  }
});

// --- Media Persistence & Saved Media System ---
function ensureSavedMedia() {
  const dir = path.dirname(SAVED_MEDIA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const defaultMedia = {
    photos: {
      portrait: {
        id: 'portrait',
        title: 'Ian Tapia Reyes Portrait',
        label: 'Hero Profile & About Photo',
        fileName: 'ian-photo.jpg',
        url: './assets/images/ian-photo.jpg',
        relativeDiskPath: 'assets/images/ian-photo.jpg'
      },
      fact2: {
        id: 'fact2',
        title: 'Cancun Summer Vacation',
        label: 'Fun Fact: Cancun Summer Travel',
        fileName: 'cancun-summer.jpg',
        url: './assets/images/cancun-summer.jpg',
        relativeDiskPath: 'assets/images/cancun-summer.jpg'
      },
      fact3: {
        id: 'fact3',
        title: 'Mountain Ranch',
        label: 'Fun Fact: I Own a Ranch (A Ranch Is a Mountain)',
        fileName: 'ranch_mountain_view.jpg',
        url: './assets/images/ranch_mountain_view.jpg',
        relativeDiskPath: 'assets/images/ranch_mountain_view.jpg'
      },
      fact4: {
        id: 'fact4',
        title: 'Mechanic Career',
        label: 'Fun Fact: Future Career as a Mechanic',
        fileName: 'mechanic-career.jpg',
        url: './assets/images/mechanic-career.jpg',
        relativeDiskPath: 'assets/images/mechanic-career.jpg'
      },
      future_mechanic: {
        id: 'future_mechanic',
        title: 'Mechanic Career (Future Page)',
        label: 'Future Careers: High-Earning Mechanic',
        fileName: 'mechanic-career.jpg',
        url: './assets/images/mechanic-career.jpg',
        relativeDiskPath: 'assets/images/mechanic-career.jpg'
      },
      why_instagram: {
        id: 'why_instagram',
        title: 'Why I Use Instagram Photo',
        label: 'Videos Page: Instagram Spotlight',
        fileName: 'ian-photo.jpg',
        url: './assets/images/ian-photo.jpg',
        relativeDiskPath: 'assets/images/ian-photo.jpg'
      }
    },
    videos: {
      football: {
        id: 'football',
        title: 'Football Offensive Line Video',
        label: 'West Hills High School • Tackle & Center',
        fileName: 'West-Hills-High-School.MP4',
        url: './assets/videos/west-hills-high-school.mp4',
        relativeDiskPath: 'assets/videos/west-hills-high-school.mp4'
      },
      construction: {
        id: 'construction',
        title: 'Future Construction Worker Video',
        label: 'Construction Career Inspired by Grandpa',
        fileName: 'VID_20260829_165756814.MP4',
        url: './assets/videos/construction-worker.mp4',
        relativeDiskPath: 'assets/videos/construction-worker.mp4'
      }
    }
  };

  if (!fs.existsSync(SAVED_MEDIA_PATH)) {
    fs.writeFileSync(SAVED_MEDIA_PATH, JSON.stringify(defaultMedia, null, 2), 'utf8');
    return defaultMedia;
  }

  try {
    const raw = fs.readFileSync(SAVED_MEDIA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    fs.writeFileSync(SAVED_MEDIA_PATH, JSON.stringify(defaultMedia, null, 2), 'utf8');
    return defaultMedia;
  }
}

function readSavedMedia() {
  return ensureSavedMedia();
}

function writeSavedMedia(data) {
  ensureSavedMedia();
  fs.writeFileSync(SAVED_MEDIA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// GET /api/saved-media - Retrieve all saved pictures and videos
app.get('/api/saved-media', (req, res) => {
  try {
    const media = readSavedMedia();
    const photosList = [];
    const videosList = [];

    // Process Photos
    for (const [key, item] of Object.entries(media.photos || {})) {
      const diskPath = path.join(__dirname, item.relativeDiskPath || `assets/images/${item.fileName}`);
      let size = 0;
      let lastModified = new Date().toISOString();
      let exists = false;

      if (fs.existsSync(diskPath)) {
        const stat = fs.statSync(diskPath);
        size = stat.size;
        lastModified = stat.mtime.toISOString();
        exists = true;
      }

      photosList.push({
        ...item,
        key,
        size,
        sizeFormatted: formatBytes(size),
        lastModified,
        exists,
        storageStatus: exists ? 'Permanently Saved on Server' : 'Missing File'
      });
    }

    // Process Videos
    for (const [key, item] of Object.entries(media.videos || {})) {
      const diskPath = path.join(__dirname, item.relativeDiskPath || `assets/videos/${item.fileName}`);
      let size = 0;
      let lastModified = new Date().toISOString();
      let exists = false;

      if (fs.existsSync(diskPath)) {
        const stat = fs.statSync(diskPath);
        size = stat.size;
        lastModified = stat.mtime.toISOString();
        exists = true;
      }

      videosList.push({
        ...item,
        key,
        size,
        sizeFormatted: formatBytes(size),
        lastModified,
        exists,
        storageStatus: exists ? 'Permanently Saved on Server' : 'Missing File'
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalPhotos: photosList.length,
        totalVideos: videosList.length,
        totalMedia: photosList.length + videosList.length,
        serverStorage: 'Server-side permanent disk storage at /assets (images & videos)'
      },
      photos: photosList,
      videos: videosList
    });
  } catch (err) {
    console.error('Error fetching saved media:', err);
    return res.status(500).json({ error: 'Failed to retrieve saved media data.' });
  }
});

// POST /api/upload-photo - Upload and permanently save ANY picture
app.post(
  '/api/upload-photo',
  express.raw({ type: ['image/*', 'application/octet-stream'], limit: '50mb' }),
  (req, res) => {
    try {
      const targetId = (req.query.targetId || req.headers['x-target-id'] || 'portrait').toString().trim();
      let fileBuffer = null;
      let mimeType = req.headers['content-type'] || 'image/jpeg';
      let originalFilename = (req.query.filename || req.headers['x-filename'] || '').toString().trim();

      // Check if sent as raw binary
      if (Buffer.isBuffer(req.body) && req.body.length > 0) {
        fileBuffer = req.body;
      } else if (req.body && typeof req.body === 'object') {
        // Base64 JSON fallback
        if (req.body.dataUrl) {
          const matches = req.body.dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          if (matches) {
            mimeType = matches[1];
            fileBuffer = Buffer.from(matches[2], 'base64');
          }
        }
      }

      if (!fileBuffer || fileBuffer.length === 0) {
        return res.status(400).json({ error: 'No image data payload received.' });
      }

      const imagesDir = path.join(__dirname, 'assets', 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      // Determine appropriate filename based on target slot
      let targetFileName = 'ian-photo.jpg';
      let mediaTitle = 'Ian Tapia Reyes Photo';

      if (targetId === 'portrait' || targetId === 'hero') {
        targetFileName = 'ian-photo.jpg';
        mediaTitle = 'Ian Tapia Reyes Portrait';
      } else if (targetId === 'fact2' || targetId === 'cancun') {
        targetFileName = 'cancun-summer.jpg';
        mediaTitle = 'Cancun Summer Vacation';
      } else if (targetId === 'fact3' || targetId === 'ranch') {
        targetFileName = 'ranch_mountain_view.jpg';
        mediaTitle = 'Mountain Ranch';
      } else if (targetId === 'fact4' || targetId === 'mechanic' || targetId === 'future_mechanic') {
        targetFileName = 'mechanic-career.jpg';
        mediaTitle = 'Mechanic Career';
      } else if (targetId === 'why_instagram') {
        targetFileName = 'ian-photo.jpg';
        mediaTitle = 'Why I Use Instagram Photo';
      } else {
        const ext = mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg';
        targetFileName = `saved-${targetId.replace(/[^a-zA-Z0-9_-]/g, '_')}${ext}`;
        mediaTitle = originalFilename || `Saved Photo (${targetId})`;
      }

      const filePath = path.join(imagesDir, targetFileName);
      fs.writeFileSync(filePath, fileBuffer);
      console.log(`Saved image for ${targetId} (${fileBuffer.length} bytes) to ${filePath}`);

      // Also update savedMedia.json registry
      const media = readSavedMedia();
      if (!media.photos) media.photos = {};
      media.photos[targetId] = {
        id: targetId,
        title: mediaTitle,
        label: originalFilename || mediaTitle,
        fileName: targetFileName,
        url: `./assets/images/${targetFileName}?v=${Date.now()}`,
        relativeDiskPath: `assets/images/${targetFileName}`,
        savedAt: new Date().toISOString()
      };
      writeSavedMedia(media);

      return res.status(200).json({
        success: true,
        targetId,
        filename: targetFileName,
        url: `./assets/images/${targetFileName}?v=${Date.now()}`,
        size: fileBuffer.length,
        sizeFormatted: formatBytes(fileBuffer.length),
        message: `Photo for "${mediaTitle}" was successfully saved permanently to the server disk!`
      });
    } catch (err) {
      console.error('Failed to save uploaded photo:', err);
      return res.status(500).json({ error: 'Failed to write image file to server storage.' });
    }
  }
);

// GET /api/download-all-media - Download all saved pictures and videos in a ZIP archive
app.get('/api/download-all-media', (req, res) => {
  try {
    const zip = new AdmZip();
    const imagesDir = path.join(__dirname, 'assets', 'images');
    const videosDir = path.join(__dirname, 'assets', 'videos');

    // Add Readme manifest
    const readmeContent = `=====================================================
IAN TAPIA REYES - SAVED PICTURES & VIDEOS ARCHIVE
=====================================================
Created: ${new Date().toLocaleString()}

This archive contains all your high-resolution pictures and videos
saved directly from your website.

SAVED PICTURES:
- ian-photo.jpg : Profile & Portrait Photo
- cancun-summer.jpg : Summer Vacation in Cancun
- ranch_mountain_view.jpg : Mountain Ranch Photo ("A Ranch is a Mountain")
- mountain-ranch.jpg : Mountain Ranch Daylight Landscape
- mechanic-career.jpg : High-Earning Mechanic Career Photo
- construction-worker.jpg : Future Construction Worker Photo

SAVED VIDEOS:
- West-Hills-High-School.MP4 : Football Offensive Line (Tackle & Center)
- VID_20260829_165756814.MP4 : Future Construction Worker Video
- football-trench.mp4 : Football Line Trench Battles

All media assets are permanently stored in your website repository!
=====================================================`;
    zip.addFile('README_MEDIA_ARCHIVE.txt', Buffer.from(readmeContent, 'utf8'));

    // Add Key Photos
    const keyPhotos = [
      { disk: 'ian-photo.jpg', zipName: 'Pictures/ian-photo.jpg' },
      { disk: 'cancun-summer.jpg', zipName: 'Pictures/cancun-summer.jpg' },
      { disk: 'ranch_mountain_view.jpg', zipName: 'Pictures/ranch_mountain_view.jpg' },
      { disk: 'mountain-ranch.jpg', zipName: 'Pictures/mountain-ranch.jpg' },
      { disk: 'mechanic-career.jpg', zipName: 'Pictures/mechanic-career.jpg' },
      { disk: 'construction-worker.jpg', zipName: 'Pictures/construction-worker.jpg' },
      { disk: 'west-hills-football.jpg', zipName: 'Pictures/west-hills-football.jpg' }
    ];

    keyPhotos.forEach((item) => {
      const fullPath = path.join(imagesDir, item.disk);
      if (fs.existsSync(fullPath)) {
        zip.addLocalFile(fullPath, 'Pictures');
      }
    });

    // Add Key Videos
    const keyVideos = [
      { disk: 'west-hills-high-school.mp4', zipName: 'West-Hills-High-School.MP4' },
      { disk: 'construction-worker.mp4', zipName: 'VID_20260829_165756814.MP4' },
      { disk: 'football-trench.mp4', zipName: 'football-trench.mp4' }
    ];

    keyVideos.forEach((item) => {
      const fullPath = path.join(videosDir, item.disk);
      if (fs.existsSync(fullPath)) {
        zip.addLocalFile(fullPath, 'Videos', item.zipName);
      }
    });

    const zipBuffer = zip.toBuffer();
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="Ian-Tapia-Reyes-Pictures-and-Videos.zip"',
      'Content-Length': zipBuffer.length
    });

    console.log(`Generated media archive (${zipBuffer.length} bytes) for download`);
    return res.send(zipBuffer);
  } catch (err) {
    console.error('Error generating media download ZIP:', err);
    return res.status(500).json({ error: 'Failed to create media ZIP package.' });
  }
});

// GET /api/download-media - Download individual file with proper attachment headers
app.get('/api/download-media', (req, res) => {
  try {
    const { type, file, name } = req.query;
    if (!file) {
      return res.status(400).json({ error: 'File name is required.' });
    }

    const safeFile = path.basename(file.toString());
    const folder = type === 'video' ? 'videos' : 'images';
    const filePath = path.join(__dirname, 'assets', folder, safeFile);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server.' });
    }

    const downloadName = (name || safeFile).toString().replace(/[^a-zA-Z0-9_.-]/g, '_');
    return res.download(filePath, downloadName);
  } catch (err) {
    console.error('Error downloading individual media file:', err);
    return res.status(500).json({ error: 'Failed to download file.' });
  }
});

// POST /api/upload-featured-video - Upload/replace football O-Line video
app.post(
  '/api/upload-featured-video',
  express.raw({ type: ['video/*', 'application/octet-stream'], limit: '250mb' }),
  (req, res) => {
    try {
      if (!req.body || req.body.length === 0) {
        return res.status(400).json({ error: 'No video payload received.' });
      }
      const videosDir = path.join(__dirname, 'assets', 'videos');
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }
      const filePath = path.join(videosDir, 'football-trench.mp4');
      fs.writeFileSync(filePath, req.body);
      const filePath2 = path.join(videosDir, 'west-hills-high-school.mp4');
      fs.writeFileSync(filePath2, req.body);
      console.log(`Saved football video (${req.body.length} bytes) to ${filePath} and ${filePath2}`);

      // Update registry
      const media = readSavedMedia();
      if (!media.videos) media.videos = {};
      media.videos.football = {
        id: 'football',
        title: 'Football Offensive Line Video',
        label: 'West Hills High School • Tackle & Center',
        fileName: 'West-Hills-High-School.MP4',
        url: './assets/videos/west-hills-high-school.mp4?v=' + Date.now(),
        relativeDiskPath: 'assets/videos/west-hills-high-school.mp4',
        savedAt: new Date().toISOString()
      };
      writeSavedMedia(media);

      return res.status(200).json({
        success: true,
        filename: 'West-Hills-High-School.MP4',
        url: './assets/videos/west-hills-high-school.mp4?v=' + Date.now(),
        message: 'Football O-Line video (West-Hills-High-School.MP4) successfully saved permanently to server disk!'
      });
    } catch (err) {
      console.error('Failed to save featured video:', err);
      return res.status(500).json({ error: 'Failed to write video file on server.' });
    }
  }
);

// POST /api/upload-football-photo - Upload/replace football O-Line photo
app.post(
  '/api/upload-football-photo',
  express.raw({ type: ['image/*', 'application/octet-stream'], limit: '50mb' }),
  (req, res) => {
    try {
      if (!req.body || req.body.length === 0) {
        return res.status(400).json({ error: 'No image payload received.' });
      }
      const imagesDir = path.join(__dirname, 'assets', 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      const filePath = path.join(imagesDir, 'west-hills-football.jpg');
      fs.writeFileSync(filePath, req.body);
      console.log(`Saved football image (${req.body.length} bytes) to ${filePath}`);

      return res.status(200).json({
        success: true,
        filename: 'west-hills-football.jpg',
        url: './assets/images/west-hills-football.jpg?v=' + Date.now(),
        message: 'Football O-Line photo successfully saved permanently to server disk!'
      });
    } catch (err) {
      console.error('Failed to save football image:', err);
      return res.status(500).json({ error: 'Failed to write image file on server.' });
    }
  }
);

// POST /api/upload-construction-video - Upload/replace Future Construction Worker video
app.post(
  '/api/upload-construction-video',
  express.raw({ type: ['video/*', 'application/octet-stream'], limit: '250mb' }),
  (req, res) => {
    try {
      if (!req.body || req.body.length === 0) {
        return res.status(400).json({ error: 'No video payload received.' });
      }
      const videosDir = path.join(__dirname, 'assets', 'videos');
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }
      const filePath = path.join(videosDir, 'construction-worker.mp4');
      fs.writeFileSync(filePath, req.body);
      console.log(`Saved construction worker video (${req.body.length} bytes) to ${filePath}`);

      // Update registry
      const media = readSavedMedia();
      if (!media.videos) media.videos = {};
      media.videos.construction = {
        id: 'construction',
        title: 'Future Construction Worker Video',
        label: 'Construction Career Inspired by Grandpa',
        fileName: 'VID_20260829_165756814.MP4',
        url: './assets/videos/construction-worker.mp4?v=' + Date.now(),
        relativeDiskPath: 'assets/videos/construction-worker.mp4',
        savedAt: new Date().toISOString()
      };
      writeSavedMedia(media);

      return res.status(200).json({
        success: true,
        filename: 'VID_20260829_165756814.MP4',
        url: './assets/videos/construction-worker.mp4?v=' + Date.now(),
        message: 'Construction worker video (VID_20260829_165756814.MP4) successfully saved permanently to server disk!'
      });
    } catch (err) {
      console.error('Failed to save construction video:', err);
      return res.status(500).json({ error: 'Failed to write video file on server.' });
    }
  }
);

// Serve static assets and project files
app.use(express.static(__dirname));

// Route handlers for clean navigation if requested without .html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/media', (req, res) => {
  res.sendFile(path.join(__dirname, 'media.html'));
});

app.get('/future', (req, res) => {
  res.sendFile(path.join(__dirname, 'future.html'));
});

// Initialize data and media files on startup
ensureDataFile();
ensureSavedMedia();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
