import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE_PATH = path.join(__dirname, 'data', 'contactReceived.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

      return res.status(200).json({
        success: true,
        filename: 'West-Hills-High-School.MP4',
        url: './assets/videos/west-hills-high-school.mp4?v=' + Date.now(),
        message: 'Football O-Line video (West-Hills-High-School.MP4) successfully updated!'
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
        message: 'Football O-Line photo successfully updated!'
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

      return res.status(200).json({
        success: true,
        filename: 'construction-worker.mp4',
        url: './assets/videos/construction-worker.mp4?v=' + Date.now(),
        message: 'Construction worker video successfully updated!'
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

// Initialize data file on startup
ensureDataFile();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
