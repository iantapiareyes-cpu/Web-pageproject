/**
 * Client-Side JavaScript for Web Page Project
 * Ian Tapia Reyes Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundAnimation();
  initNavigation();
  initPhotoUpload();
  initSlidePhotoUploads();
  initFunFactsShuffle();
  initContactForm();
  initGalleryLightbox();
  initBackToTop();
  initMediaVideoManager();
  initFeaturedFootballVideo();
  initConstructionWorkerVideo();
  initSavedMediaVault();
});

/* ==========================================================================
   Cool Interactive Dark Blue Background Animation (Constellation & Energy Nodes)
   ========================================================================== */
function initBackgroundAnimation() {
  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  let canvas = document.getElementById('bgAnimationCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'bgAnimationCanvas';
    canvas.className = 'bg-animation-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;
  let animationFrameId = null;
  let isTabVisible = true;

  // Mouse interaction state
  const mouse = {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    radius: 160,
    isActive: false,
    leaveTimeout: null
  };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', () => {
    resize();
  }, { passive: true });

  resize();

  // Particle Node System
  const particleCount = Math.min(55, Math.floor((width * height) / 22000) + 20);
  const particles = [];
  const colorPalette = [
    { r: 56, g: 189, b: 248 },  // Electric Cyan (#38bdf8)
    { r: 96, g: 165, b: 250 },  // Sky Blue (#60a5fa)
    { r: 37, g: 99, b: 235 },   // Deep Royal Blue (#2563eb)
    { r: 147, g: 197, b: 253 }, // Crisp Ice Blue (#93c5fd)
    { r: 14, g: 165, b: 233 }   // Ocean Azure (#0ea5e9)
  ];

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
      this.y = initial ? Math.random() * height : Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.75;
      this.vy = (Math.random() - 0.5) * 0.75;
      this.radius = Math.random() * 2.2 + 1.2;
      this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      this.baseAlpha = Math.random() * 0.45 + 0.25;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.03;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Soft boundary bouncing with margin
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;

      // Pulse alpha
      this.pulsePhase += this.pulseSpeed;
      this.currentAlpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.15;

      // Mouse proximity interaction (smooth magnetic attraction & repulsion)
      if (mouse.isActive) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          // Subtle gentle nudge
          this.x += Math.cos(angle) * force * 0.6;
          this.y += Math.sin(angle) * force * 0.6;
          this.currentAlpha = Math.min(0.9, this.currentAlpha + 0.3);
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentAlpha})`;
      ctx.fill();

      // Outer soft glow for larger particles
      if (this.radius > 2.0) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentAlpha * 0.25})`;
        ctx.fill();
      }
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Mouse move tracking
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.isActive = true;

    clearTimeout(mouse.leaveTimeout);
    mouse.leaveTimeout = setTimeout(() => {
      mouse.isActive = false;
    }, 3000);
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.isActive = false;
  });

  // Track window focus/visibility to preserve CPU/battery
  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible && !animationFrameId) {
      animate();
    }
  });

  // Main Animation Loop
  const maxDistance = 125;

  function animate() {
    if (!isTabVisible) {
      animationFrameId = null;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // Draw constellation lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const lineAlpha = (1 - dist / maxDistance) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      // Draw interactive constellation line to mouse
      if (mouse.isActive) {
        const dx = mouse.x - particles[i].x;
        const dy = mouse.y - particles[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const mouseLineAlpha = (1 - dist / mouse.radius) * 0.38;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(125, 211, 252, ${mouseLineAlpha})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   Personal Photo Upload & Persistence
   ========================================================================== */
function initPhotoUpload() {
  const photoInput = document.getElementById('photoFileInput');
  const studentPhoto = document.getElementById('studentPhoto');
  const uploadLabel = document.getElementById('photoUploadLabel');
  const storageKey = 'ian_portfolio_photo';

  // Load saved custom photo from localStorage if available
  try {
    const savedPhoto = localStorage.getItem(storageKey);
    if (savedPhoto && studentPhoto) {
      studentPhoto.src = savedPhoto;
    }
    // Also sync to Fun Facts author and card photos
    const authorPhoto = document.getElementById('funFactsAuthorPhoto');
    if (savedPhoto && authorPhoto) authorPhoto.src = savedPhoto;
    const ianFactPhoto = document.getElementById('ianFactPhoto');
    if (savedPhoto && ianFactPhoto) ianFactPhoto.src = savedPhoto;

    // Also apply to any gallery cards on the page
    const galleryCard1Img = document.querySelector('#galleryCard1 img');
    if (savedPhoto && galleryCard1Img) {
      galleryCard1Img.src = savedPhoto;
      const galleryCard1 = document.getElementById('galleryCard1');
      if (galleryCard1) galleryCard1.setAttribute('data-src', savedPhoto);
    }
  } catch (e) {
    // Local storage access error handled gracefully
  }

  if (photoInput && studentPhoto) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPEG, PNG, WEBP).');
        return;
      }

      // Max size limit of 4MB for localStorage
      if (file.size > 4 * 1024 * 1024) {
        alert('Please choose an image under 4MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        studentPhoto.src = dataUrl;
        const authorPhoto = document.getElementById('funFactsAuthorPhoto');
        if (authorPhoto) authorPhoto.src = dataUrl;
        const ianFactPhoto = document.getElementById('ianFactPhoto');
        if (ianFactPhoto) ianFactPhoto.src = dataUrl;
        try {
          localStorage.setItem(storageKey, dataUrl);
        } catch (err) {
          console.warn('Could not cache photo to local storage', err);
        }

        // Upload directly to server to permanently save to assets/images/ian-photo.jpg
        fetch('/api/upload-photo?targetId=portrait&filename=' + encodeURIComponent(file.name), {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'image/jpeg',
            'x-target-id': 'portrait',
            'x-filename': file.name
          },
          body: file
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              showMediaToast('Portrait photo permanently saved to server disk!');
              const heroDl = document.getElementById('downloadHeroPhoto');
              if (heroDl) heroDl.href = data.url;
            }
          })
          .catch((err) => console.warn('Server photo sync:', err));

        // Visual feedback
        if (uploadLabel) {
          const originalText = uploadLabel.innerHTML;
          uploadLabel.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Photo Saved!</span>`;
          setTimeout(() => {
            uploadLabel.innerHTML = originalText;
          }, 2500);
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

/* ==========================================================================
   Navigation
   ========================================================================== */
function initNavigation() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navList = document.getElementById('navList');

  if (toggleBtn && navList) {
    toggleBtn.addEventListener('click', () => {
      navList.classList.toggle('open');
      const isExpanded = navList.classList.contains('open');
      toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (!toggleBtn.contains(e.target) && !navList.contains(e.target) && navList.classList.contains('open')) {
        navList.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* ==========================================================================
   Contact Form Validation & Submission
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const alertBox = document.getElementById('formStatusAlert');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(message, type) {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `form-status-alert ${type === 'success' ? 'alert-success' : 'alert-error'}`;
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.className = 'form-status-alert';
    alertBox.textContent = '';
  }

  function shakeField(inputElement) {
    if (!inputElement) return;
    inputElement.classList.remove('input-error-shake');
    // Force DOM reflow to allow re-triggering the CSS keyframe animation
    void inputElement.offsetWidth;
    inputElement.classList.add('input-error-shake');
    inputElement.focus();
    setTimeout(() => {
      inputElement.classList.remove('input-error-shake');
    }, 450);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const reasonInput = document.getElementById('reason');
    const messageInput = document.getElementById('message');

    const firstName = firstNameInput ? firstNameInput.value.trim() : '';
    const lastName = lastNameInput ? lastNameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const reason = reasonInput ? reasonInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    // Client-side Validation with shake animation
    if (!firstName) {
      showAlert('Please provide your First Name.', 'error');
      shakeField(firstNameInput);
      return;
    }
    if (!lastName) {
      showAlert('Please provide your Last Name.', 'error');
      shakeField(lastNameInput);
      return;
    }
    if (!email) {
      showAlert('Please provide your Email Address.', 'error');
      shakeField(emailInput);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showAlert('Please enter a valid email address (e.g., name@example.com).', 'error');
      shakeField(emailInput);
      return;
    }

    if (!reason) {
      showAlert('Please select a Reason for Contact.', 'error');
      shakeField(reasonInput);
      return;
    }

    if (!message) {
      showAlert('Please write a message before submitting.', 'error');
      shakeField(messageInput);
      return;
    }

    // Set loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending Message...';
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          reason,
          message
        })
      });

      const result = await response.json();

      if (response.ok && (response.status === 200 || response.status === 201)) {
        showAlert('Thank you! Your message has been sent successfully. Ian will be in touch soon.', 'success');
        form.reset();
      } else {
        const errorMsg = result && result.error ? result.error : 'Failed to deliver message. Please try again.';
        showAlert(errorMsg, 'error');
        if (errorMsg.includes('First Name')) shakeField(firstNameInput);
        else if (errorMsg.includes('Last Name')) shakeField(lastNameInput);
        else if (errorMsg.includes('Email')) shakeField(emailInput);
        else if (errorMsg.includes('Reason')) shakeField(reasonInput);
        else if (errorMsg.includes('Message')) shakeField(messageInput);
        else {
          [firstNameInput, lastNameInput, emailInput, reasonInput, messageInput].forEach(shakeField);
        }
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      showAlert('Network error: Unable to connect to server. Please try again shortly.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    }
  });
}

/* ==========================================================================
   Media Page: Lightbox & Filter
   ========================================================================== */
function initGalleryLightbox() {
  const cards = document.querySelectorAll('.gallery-card');
  const modal = document.getElementById('lightboxModal');
  const modalClose = document.getElementById('lightboxClose');
  const modalMediaHolder = document.getElementById('lightboxMediaHolder');
  const modalTitle = document.getElementById('lightboxTitle');
  const modalCaption = document.getElementById('lightboxCaption');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Filtering
  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        cards.forEach((card) => {
          const type = card.getAttribute('data-type');
          if (filter === 'all' || type === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  if (!modal || !cards.length) return;

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (modalMediaHolder) modalMediaHolder.innerHTML = '';
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-type');
      const src = card.getAttribute('data-src');
      const title = card.getAttribute('data-title');
      const caption = card.getAttribute('data-caption');
      const externalLink = card.getAttribute('data-link');

      // If social card clicked on direct link icon, or has externalLink
      if (externalLink && window.event && window.event.target.closest('.external-link-btn')) {
        window.open(externalLink, '_blank', 'noopener,noreferrer');
        return;
      }

      if (modalMediaHolder) {
        modalMediaHolder.innerHTML = '';
        if (type === 'video') {
          const video = document.createElement('video');
          video.src = src;
          video.controls = true;
          video.autoplay = true;
          video.className = 'lightbox-video';
          modalMediaHolder.appendChild(video);
        } else {
          const img = document.createElement('img');
          img.src = src;
          img.alt = title || 'Expanded Media Preview';
          img.className = 'lightbox-img';
          modalMediaHolder.appendChild(img);
        }
      }

      if (modalTitle) modalTitle.textContent = title || '';
      if (modalCaption) modalCaption.textContent = caption || '';

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   Back To Top Button
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   Interactive Fun Facts Shuffle & Highlighting
   ========================================================================== */
function initFunFactsShuffle() {
  const shuffleBtn = document.getElementById('shuffleFactBtn');
  const banner = document.getElementById('surpriseFactBanner');
  const bannerIcon = document.getElementById('surpriseFactIcon');
  const bannerTag = document.getElementById('surpriseFactTag');
  const bannerText = document.getElementById('surpriseFactText');
  const factCards = document.querySelectorAll('.fun-fact-card');

  if (!shuffleBtn && factCards.length === 0) return;

  const factsData = [
    {
      emoji: '🏈',
      tag: 'Football & Positions',
      title: 'I Play Football (O-Line Tackle & Center)',
      text: 'I play football on the offensive line! I play both tackle and center—making line calls and snapping the ball under pressure at center, and locking down outside edge rushers at tackle to protect the quarterback.'
    },
    {
      emoji: '🏖️',
      tag: 'Summer Travel',
      title: 'I Went to Cancun Over the Summer',
      text: 'I went to Cancun over the summer! Had an awesome time hanging out by the beaches, swimming in the warm ocean, relaxing in the tropical sun, and enjoying great food.'
    },
    {
      emoji: '⛰️',
      tag: 'Land & Mountains',
      title: 'I Own a Ranch — A Ranch Is a Mountain!',
      text: 'Here\'s a cool fact: I own a ranch, and a ranch is a mountain! It\'s incredible land surrounded by high mountain scenery, wide-open views, fresh air, and peaceful nature.'
    },
    {
      emoji: '🔧',
      tag: 'Mechanic',
      title: 'Mechanic',
      text: 'If construction doesn\'t work for me, I want to be a mechanic. Why I want this job is they get paid a lot.'
    }
  ];

  let lastIndex = -1;

  function pickRandomFact() {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * factsData.length);
    } while (nextIndex === lastIndex && factsData.length > 1);
    lastIndex = nextIndex;

    const chosen = factsData[nextIndex];

    if (banner && bannerIcon && bannerTag && bannerText) {
      banner.classList.remove('active');
      void banner.offsetWidth; // Trigger reflow for animation restart
      bannerIcon.textContent = chosen.emoji;
      bannerTag.textContent = `${chosen.tag} • ${chosen.title}`;
      bannerText.textContent = chosen.text;
      banner.classList.add('active');
    }

    // Highlight corresponding card if index matches 0..5
    factCards.forEach((card, idx) => {
      if (idx === nextIndex) {
        card.classList.add('fact-highlighted');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        card.classList.remove('fact-highlighted');
      }
    });
  }

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', pickRandomFact);
  }

  // Allow clicking on any fact card to highlight and display it in the banner
  factCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      factCards.forEach(c => c.classList.remove('fact-highlighted'));
      card.classList.add('fact-highlighted');

      if (factsData[idx] && banner && bannerIcon && bannerTag && bannerText) {
        const item = factsData[idx];
        bannerIcon.textContent = item.emoji;
        bannerTag.textContent = `${item.tag} • ${item.title}`;
        bannerText.textContent = item.text;
        banner.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   Media Page: Video Manager & Dynamic Video Addition
   ========================================================================== */
function initMediaVideoManager() {
  const openBtn = document.getElementById('openAddVideoBtn');
  const closeBtn = document.getElementById('closeAddVideoBtn');
  const cancelBtn = document.getElementById('cancelAddVideoBtn');
  const formCard = document.getElementById('addVideoCard');
  const form = document.getElementById('addVideoForm');
  const customContainer = document.getElementById('customVideosContainer');

  if (!customContainer) return; // Only runs on pages with video container (media.html)

  // Toggle form
  function openForm() {
    if (formCard) {
      formCard.classList.add('active');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
      const titleInput = document.getElementById('newVideoTitle');
      if (titleInput) titleInput.focus();
    }
  }

  function closeForm() {
    if (formCard) {
      formCard.classList.remove('active');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (openBtn) openBtn.addEventListener('click', openForm);
  if (closeBtn) closeBtn.addEventListener('click', closeForm);
  if (cancelBtn) cancelBtn.addEventListener('click', closeForm);

  // Extract YouTube ID if valid
  function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
    const match = url.trim().match(regExp);
    return match ? match[1] : null;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message) {
    let toast = document.getElementById('videoToastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'videoToastNotification';
      toast.className = 'video-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>✓</span> <span>${escapeHtml(message)}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // Load saved custom videos
  function loadSavedVideos() {
    try {
      const saved = localStorage.getItem('ian_saved_media_videos');
      if (!saved) return;
      const videos = JSON.parse(saved);
      if (Array.isArray(videos)) {
        customContainer.innerHTML = '';
        videos.forEach(v => renderVideoCard(v, false));
      }
    } catch (e) {
      console.warn('Could not load custom videos', e);
    }
  }

  function saveVideosToStorage(videos) {
    try {
      localStorage.setItem('ian_saved_media_videos', JSON.stringify(videos));
    } catch (e) {
      console.warn('Could not save videos to localStorage', e);
    }
  }

  function getStoredVideos() {
    try {
      const saved = localStorage.getItem('ian_saved_media_videos');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  function renderVideoCard(videoData, prepend = true) {
    const card = document.createElement('div');
    card.className = 'media-video-card';
    card.id = `videoCard_${videoData.id}`;

    let playerHtml = '';
    const youtubeId = getYouTubeId(videoData.url);

    if (youtubeId) {
      playerHtml = `
        <div class="video-iframe-wrapper">
          <iframe 
            src="https://www.youtube.com/embed/${youtubeId}?rel=0" 
            title="${escapeHtml(videoData.title)}" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
      `;
    } else {
      playerHtml = `
        <div class="video-player-wrapper">
          <video controls preload="metadata" class="featured-video" aria-label="${escapeHtml(videoData.title)}">
            <source src="${videoData.url}" type="video/mp4">
            Your browser does not support HTML5 video playback.
          </video>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="video-card-header">
        <span class="video-pill" style="background-color: rgba(56, 189, 248, 0.15); color: #38bdf8; border-color: rgba(56, 189, 248, 0.35);">
          <span class="pulse-dot" style="background-color: #38bdf8; box-shadow: 0 0 8px #38bdf8;"></span> ${escapeHtml(videoData.category || 'Featured Video')}
        </span>
        <span class="video-duration">${escapeHtml(videoData.duration || 'User Video')}</span>
      </div>
      ${playerHtml}
      <div class="video-card-info">
        <h3 class="video-card-title">${escapeHtml(videoData.title)}</h3>
        <p class="video-card-desc">${escapeHtml(videoData.description || 'Custom video added to personal portfolio.')}</p>
        <div class="video-meta-tags">
          <span class="meta-tag">${escapeHtml(videoData.category || 'Media')}</span>
          <span class="meta-tag">Custom Video</span>
        </div>
        <button type="button" class="delete-video-btn" data-video-id="${videoData.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Remove Video
        </button>
      </div>
    `;

    // Delete handler
    const deleteBtn = card.querySelector('.delete-video-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        const idToDelete = deleteBtn.getAttribute('data-video-id');
        const currentList = getStoredVideos().filter(item => item.id !== idToDelete);
        saveVideosToStorage(currentList);
        card.remove();
        showToast('Video removed from page.');
      });
    }

    if (prepend && customContainer.firstChild) {
      customContainer.insertBefore(card, customContainer.firstChild);
    } else {
      customContainer.appendChild(card);
    }
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const titleInput = document.getElementById('newVideoTitle');
      const categoryInput = document.getElementById('newVideoCategory');
      const urlInput = document.getElementById('newVideoUrl');
      const fileInput = document.getElementById('newVideoFile');
      const descInput = document.getElementById('newVideoDesc');

      const title = titleInput ? titleInput.value.trim() : '';
      const category = categoryInput ? categoryInput.value.trim() || 'Media' : 'Media';
      const desc = descInput ? descInput.value.trim() : '';
      let videoUrl = urlInput ? urlInput.value.trim() : '';
      const file = fileInput && fileInput.files ? fileInput.files[0] : null;

      if (!title) {
        alert('Please enter a video title.');
        return;
      }

      if (!videoUrl && !file) {
        alert('Please provide a YouTube video URL or select a video file.');
        return;
      }

      if (file) {
        // Create an Object URL for immediate local playback
        videoUrl = URL.createObjectURL(file);
      }

      const newVideo = {
        id: 'vid_' + Date.now(),
        title: title,
        category: category,
        description: desc || 'Video uploaded by Ian Tapia Reyes.',
        url: videoUrl,
        duration: file ? 'Local File' : (getYouTubeId(videoUrl) ? 'YouTube Embed' : 'Web Video'),
        date: new Date().toLocaleDateString()
      };

      // Only save to localStorage if it's a URL (blob URLs expire on browser close)
      if (!file) {
        const list = getStoredVideos();
        list.unshift(newVideo);
        saveVideosToStorage(list);
      }

      renderVideoCard(newVideo, true);
      form.reset();
      closeForm();
      showToast(`"${title}" added to Media page!`);

      // Scroll to new video
      const newCard = document.getElementById(`videoCard_${newVideo.id}`);
      if (newCard) {
        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Load initially saved videos
  loadSavedVideos();
}

/* ==========================================================================
   Slide / Card Photo Upload Manager (Upload photo in each slide/card)
   ========================================================================== */
function initSlidePhotoUploads() {
  // Clear any previously saved football pictures that the user requested to take out
  try {
    localStorage.removeItem('slide_photo_sport_banner');
    localStorage.removeItem('slide_photo_fact1');
  } catch (e) {}

  const uploadInputs = document.querySelectorAll('.slide-upload-input');
  if (!uploadInputs.length) return;

  uploadInputs.forEach(input => {
    const cardId = input.getAttribute('data-card-id');
    const targetSelector = input.getAttribute('data-target-img');
    const imgEl = document.querySelector(targetSelector);
    if (!cardId || !imgEl) return;

    const storageKey = `slide_photo_${cardId}`;

    // Load saved image from localStorage on page load
    try {
      const savedData = localStorage.getItem(storageKey);
      // If card is fact3, prioritize the newly updated URL unless user uploaded a newer file in this session
      if (savedData && cardId !== 'fact3') {
        imgEl.src = savedData;
      }
    } catch (e) {
      // LocalStorage access handled
    }

    input.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file (JPEG, PNG, GIF, WEBP).');
        return;
      }

      // Max 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        imgEl.src = dataUrl;

        try {
          localStorage.setItem(storageKey, dataUrl);
        } catch (err) {
          console.warn('Could not save photo to localStorage', err);
        }

        // Upload and permanently save picture to server disk
        fetch(`/api/upload-photo?targetId=${encodeURIComponent(cardId)}&filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'image/jpeg',
            'x-target-id': cardId,
            'x-filename': file.name
          },
          body: file
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              showMediaToast(`Photo for ${cardId} permanently saved to server disk!`);
              // Update any matching download buttons on the page
              const dlButtons = document.querySelectorAll(`[data-download-card="${cardId}"]`);
              dlButtons.forEach((btn) => {
                btn.href = data.url;
              });
            }
          })
          .catch((e) => console.warn('Server photo sync notice:', e));

        const label = input.closest('.slide-upload-label');
        if (label) {
          const originalText = label.innerHTML;
          label.innerHTML = '<span>✓ Saved to Server!</span>';
          setTimeout(() => {
            label.innerHTML = originalText;
          }, 2000);
        }
      };
      reader.readAsDataURL(file);
    });
  });

  // Support pasting image from clipboard (e.g. Copy image in Gmail, then press Ctrl+V on page)
  window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          const ranchImg = document.querySelector('#ranchPhotoWrap img');
          if (ranchImg) {
            ranchImg.src = dataUrl;
            try {
              localStorage.setItem('slide_photo_fact3', dataUrl);
            } catch (err) {}
            // Save pasted ranch photo to server disk as well
            fetch('/api/upload-photo?targetId=fact3&filename=ranch-pasted.jpg', {
              method: 'POST',
              headers: { 'Content-Type': file.type || 'image/jpeg' },
              body: file
            })
              .then((res) => res.json())
              .then((data) => {
                showMediaToast('Ranch photo saved permanently to server disk!');
              })
              .catch(() => {});
          }
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  });
}

/* ==========================================================================
   Featured Football O-Line Video Handler & Persistent Storage
   ========================================================================== */
/* ==========================================================================
   FEATURED VIDEO CONTROLLER: FOOTBALL AND TRENCH BATTLES
   Supports media.html (#featuredVideoCard) and index.html (#homeFeaturedVideoCard)
   ========================================================================== */
function initFeaturedFootballVideo() {
  const cards = [
    {
      card: document.getElementById('featuredVideoCard'),
      video: document.getElementById('mainFeaturedVideo'),
      fileInput: document.getElementById('featuredVideoFileInput'),
      statusEl: document.getElementById('featuredVideoUploadStatus'),
      fileNameTag: document.getElementById('videoFileNameTag')
    },
    {
      card: document.getElementById('homeFeaturedVideoCard'),
      video: document.getElementById('homeFeaturedVideo'),
      fileInput: document.getElementById('homeFeaturedVideoFileInput'),
      statusEl: document.getElementById('homeFeaturedVideoUploadStatus'),
      fileNameTag: document.getElementById('homeVideoFileNameTag')
    }
  ].filter(c => c.card && c.video);

  if (cards.length === 0) return;

  function safeEscape(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // IndexedDB setup to persist large video blobs across browser reloads
  const DB_NAME = 'IanPortfolioVideoDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'videos';

  function openVideoDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async function loadPersistedVideo() {
    try {
      const db = await openVideoDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get('football_featured_blob');
      getReq.onsuccess = () => {
        const result = getReq.result;
        if (result && result.blob) {
          const blobUrl = URL.createObjectURL(result.blob);
          cards.forEach(({ video, statusEl, fileNameTag }) => {
            video.src = blobUrl;
            video.load();
            if (statusEl) {
              statusEl.style.display = 'inline-flex';
              statusEl.innerHTML = `✓ Active Video: <strong>${safeEscape(result.name || 'West-Hills-High-School.MP4')}</strong>`;
            }
            if (fileNameTag && result.name) {
              fileNameTag.textContent = result.name;
            }
          });
        }
      };
    } catch (err) {
      console.warn('Could not retrieve video from IndexedDB:', err);
    }
  }

  async function savePersistedVideo(file) {
    try {
      const db = await openVideoDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ blob: file, name: file.name, type: file.type, updated: Date.now() }, 'football_featured_blob');
    } catch (err) {
      console.warn('Could not save video to IndexedDB:', err);
    }
  }

  // Load any previously saved video on startup
  loadPersistedVideo();

  // Function to process and apply the chosen video
  function handleVideoFile(file) {
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|webm|m4v|ogg)$/i)) {
      alert('Please select a valid video file (MP4, MOV, WebM, etc.).');
      return;
    }

    cards.forEach(({ statusEl }) => {
      if (statusEl) {
        statusEl.style.display = 'inline-flex';
        statusEl.innerHTML = `⏳ Loading <strong>${safeEscape(file.name)}</strong>...`;
      }
    });

    // Immediately play the chosen video on all active cards
    const objectUrl = URL.createObjectURL(file);
    cards.forEach(({ video, fileNameTag }) => {
      video.src = objectUrl;
      video.load();
      video.play().catch(() => {});
      if (fileNameTag) {
        fileNameTag.textContent = file.name;
      }
    });

    // Persist in client IndexedDB
    savePersistedVideo(file);

    // Also upload to server so it is saved to disk
    fetch('/api/upload-featured-video', {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'video/mp4'
      },
      body: file
    })
      .then((res) => res.json())
      .then((data) => {
        cards.forEach(({ statusEl }) => {
          if (!statusEl) return;
          if (data.success) {
            statusEl.innerHTML = `✓ Saved &amp; Active: <strong>${safeEscape(file.name)}</strong>`;
            showMediaToast('Football video permanently saved to server disk!');
            const dlHome = document.getElementById('downloadFootballVideoHome');
            if (dlHome) dlHome.href = data.url;
            const dlMedia = document.getElementById('downloadFootballVideoMedia');
            if (dlMedia) dlMedia.href = data.url;
          } else {
            statusEl.innerHTML = `✓ Playing: <strong>${safeEscape(file.name)}</strong>`;
          }
        });
      })
      .catch((err) => {
        console.warn('Server upload notice:', err);
        cards.forEach(({ statusEl }) => {
          if (statusEl) {
            statusEl.innerHTML = `✓ Playing: <strong>${safeEscape(file.name)}</strong> (Saved locally)`;
          }
        });
      });
  }

  cards.forEach(({ card, fileInput }) => {
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          handleVideoFile(file);
        }
      });
    }

    // Drag and Drop onto video card
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      card.style.borderColor = '#10b981';
      card.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';
    });

    card.addEventListener('dragleave', (e) => {
      if (!card.contains(e.relatedTarget)) {
        card.style.borderColor = '';
        card.style.boxShadow = '';
      }
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.style.borderColor = '';
      card.style.boxShadow = '';
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        handleVideoFile(droppedFile);
      }
    });
  });
}

/* ==========================================================================
   FUTURE CAREER: CONSTRUCTION WORKER VIDEO CONTROLLER
   Supports future.html (#photoCardConstruction & #constructionVideo)
   Handles VID_20260829_165756814.MP4, IndexedDB persistence, drag-and-drop & server sync
   ========================================================================== */
function initConstructionWorkerVideo() {
  const card = document.getElementById('photoCardConstruction');
  const video = document.getElementById('constructionVideo');
  const fileInput = document.getElementById('constructionVideoUploadInput');
  const statusEl = document.getElementById('constructionVideoStatus');

  if (!card || !video) return;

  function safeEscape(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const DB_NAME = 'IanPortfolioVideoDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'videos';
  const STORAGE_KEY = 'construction_worker_video_blob';

  function openVideoDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async function loadPersistedVideo() {
    try {
      const db = await openVideoDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(STORAGE_KEY);
      getReq.onsuccess = () => {
        const result = getReq.result;
        if (result && result.blob) {
          const blobUrl = URL.createObjectURL(result.blob);
          video.src = blobUrl;
          video.load();
          video.play().catch(() => {});
          if (statusEl) {
            statusEl.innerHTML = `<span>📹 Active Video: <strong>${safeEscape(result.name || 'VID_20260829_165756814.MP4')}</strong></span>`;
          }
        }
      };
    } catch (err) {
      console.warn('Could not retrieve construction video from IndexedDB:', err);
    }
  }

  async function savePersistedVideo(file) {
    try {
      const db = await openVideoDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ blob: file, name: file.name, type: file.type, updated: Date.now() }, STORAGE_KEY);
    } catch (err) {
      console.warn('Could not save construction video to IndexedDB:', err);
    }
  }

  // Load any previously persisted video
  loadPersistedVideo();

  function handleVideoFile(file) {
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|webm|m4v|ogg)$/i)) {
      alert('Please select a valid video file (MP4, MOV, WebM).');
      return;
    }

    if (statusEl) {
      statusEl.innerHTML = `<span>⏳ Loading <strong>${safeEscape(file.name)}</strong>...</span>`;
    }

    // Immediately play the chosen video
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.load();
    video.play().catch(() => {});

    // Save in client IndexedDB
    savePersistedVideo(file);

    // Upload to server endpoint to write to assets/videos/construction-worker.mp4
    fetch('/api/upload-construction-video', {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'video/mp4'
      },
      body: file
    })
      .then((res) => res.json())
      .then((data) => {
        if (statusEl) {
          if (data.success) {
            statusEl.innerHTML = `<span>✓ Saved &amp; Active: <strong>${safeEscape(file.name)}</strong></span>`;
            showMediaToast('Construction worker video permanently saved to server disk!');
            const dlConst = document.getElementById('downloadConstructionVideo');
            if (dlConst) dlConst.href = data.url;
          } else {
            statusEl.innerHTML = `<span>✓ Playing: <strong>${safeEscape(file.name)}</strong></span>`;
          }
        }
      })
      .catch((err) => {
        console.warn('Server upload notice:', err);
        if (statusEl) {
          statusEl.innerHTML = `<span>✓ Playing: <strong>${safeEscape(file.name)}</strong> (Saved locally)</span>`;
        }
      });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleVideoFile(file);
      }
    });
  }

  // Drag and drop onto card
  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    card.style.borderColor = '#fbbf24';
    card.style.boxShadow = '0 0 25px rgba(251, 191, 36, 0.4)';
  });

  card.addEventListener('dragleave', (e) => {
    if (!card.contains(e.relatedTarget)) {
      card.style.borderColor = '';
      card.style.boxShadow = '';
    }
  });

  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.style.borderColor = '';
    card.style.boxShadow = '';
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleVideoFile(droppedFile);
    }
  });
}

/* ==========================================================================
   Media Toast Notifications
   ========================================================================== */
function showMediaToast(message) {
  let toast = document.getElementById('mediaToastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mediaToastNotification';
    toast.className = 'media-toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span style="font-size:1.2rem;">💾</span> <span>${message}</span>`;
  toast.classList.add('show');

  if (window.__mediaToastTimer) clearTimeout(window.__mediaToastTimer);
  window.__mediaToastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ==========================================================================
   Media Vault: My Saved Pictures & Videos
   Central controller for viewing, downloading, syncing & managing all media
   ========================================================================== */
function initSavedMediaVault() {
  let vaultModal = document.getElementById('mediaVaultModal');

  // Inject vault modal if not present in the static HTML
  if (!vaultModal) {
    vaultModal = document.createElement('div');
    vaultModal.id = 'mediaVaultModal';
    vaultModal.className = 'media-vault-modal';
    vaultModal.setAttribute('role', 'dialog');
    vaultModal.setAttribute('aria-modal', 'true');
    vaultModal.setAttribute('aria-labelledby', 'mediaVaultTitle');
    vaultModal.innerHTML = `
      <div class="media-vault-panel">
        <div class="media-vault-header">
          <div class="media-vault-header-info">
            <div class="media-vault-title-wrap">
              <span style="font-size: 1.5rem;">💾</span>
              <h2 class="media-vault-title" id="mediaVaultTitle">My Saved Pictures &amp; Videos</h2>
              <span class="media-vault-badge-header" id="vaultTotalBadge">7 Media Items Saved</span>
            </div>
            <p class="media-vault-subtitle">
              All your pictures and videos are stored permanently on the server disk. You can download and save them to your device anytime, or save replacements.
            </p>
          </div>
          <button class="media-vault-close-btn" id="closeMediaVaultBtn" aria-label="Close saved media vault">&times;</button>
        </div>

        <div class="media-vault-toolbar">
          <div class="media-vault-stats">
            <span class="media-stat-item">📷 <strong id="vaultPhotoCount">5</strong> Pictures</span>
            <span>&bull;</span>
            <span class="media-stat-item">🎬 <strong id="vaultVideoCount">2</strong> Videos</span>
            <span>&bull;</span>
            <span class="media-saved-indicator"><span class="saved-dot"></span> Permanent Server Disk Active</span>
          </div>

          <div class="media-vault-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <a href="/api/download-all-media" class="btn-zip-download" id="downloadAllZipBtn" download="Ian-Tapia-Reyes-Pictures-and-Videos.zip" title="Download all pictures and videos in one ZIP archive">
              <span>📦 Save Media (ZIP)</span>
            </a>
            <a href="/api/download-project-zip" class="btn-zip-download" style="background: rgba(37, 99, 235, 0.25); border-color: #3b82f6;" id="downloadProjectZipBtn" download="ian-tapia-reyes-web-pageproject.zip" title="Download entire web page presentation project code and assets in one ZIP archive">
              <span>📁 Export Presentation (ZIP)</span>
            </a>
          </div>
        </div>

        <div class="media-vault-body" id="mediaVaultBody">
          <!-- Pictures Section -->
          <div>
            <h3 class="media-vault-section-title">
              <span>📷</span> My Saved Pictures
            </h3>
            <div class="media-vault-grid" id="vaultPhotosGrid">
              <!-- Dynamically rendered -->
            </div>
          </div>

          <!-- Videos Section -->
          <div>
            <h3 class="media-vault-section-title">
              <span>🎬</span> My Saved Videos
            </h3>
            <div class="media-vault-grid" id="vaultVideosGrid">
              <!-- Dynamically rendered -->
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(vaultModal);
  }

  // Setup Open and Close buttons
  function openVault() {
    vaultModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadAndRenderVaultMedia();
  }

  function closeVault() {
    vaultModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  const openBtns = document.querySelectorAll('#openMediaVaultBtn, .open-vault-btn');
  openBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openVault();
    });
  });

  const closeBtn = document.getElementById('closeMediaVaultBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeVault);

  vaultModal.addEventListener('click', (e) => {
    if (e.target === vaultModal) closeVault();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && vaultModal.classList.contains('active')) {
      closeVault();
    }
  });

  // Fetch saved media from server and render inside vault and sync on-page elements
  async function loadAndRenderVaultMedia() {
    try {
      const res = await fetch('/api/saved-media');
      if (!res.ok) return;
      const data = await res.json();

      const photosGrid = document.getElementById('vaultPhotosGrid');
      const videosGrid = document.getElementById('vaultVideosGrid');
      const totalBadge = document.getElementById('vaultTotalBadge');
      const photoCountEl = document.getElementById('vaultPhotoCount');
      const videoCountEl = document.getElementById('vaultVideoCount');

      if (totalBadge && data.stats) {
        totalBadge.textContent = `${data.stats.totalMedia || 7} Media Items Saved`;
      }
      if (photoCountEl && data.stats) {
        photoCountEl.textContent = data.stats.totalPhotos || 5;
      }
      if (videoCountEl && data.stats) {
        videoCountEl.textContent = data.stats.totalVideos || 2;
      }

      // Render Photos in Vault
      if (photosGrid && Array.isArray(data.photos)) {
        photosGrid.innerHTML = data.photos
          .map((photo) => {
            return `
              <div class="vault-item-card" id="vaultCard_${photo.id}">
                <div class="vault-thumb-wrap">
                  <img src="${photo.url}" alt="${photo.title}" loading="lazy">
                  <span class="vault-item-badge">📷 ${photo.sizeFormatted || 'Photo'}</span>
                </div>
                <div class="vault-item-body">
                  <h4 class="vault-item-title">${photo.title}</h4>
                  <div class="vault-item-meta">
                    <span>${photo.fileName}</span>
                    <span class="media-saved-indicator"><span class="saved-dot"></span> Saved</span>
                  </div>
                  <div class="vault-item-actions">
                    <a href="${photo.url}" download="${photo.fileName}" class="btn-vault-download" title="Save this picture to your computer or phone">
                      ⬇️ Save Photo
                    </a>
                    <label class="btn-vault-replace" title="Upload a new picture to replace and save permanently">
                      <span>🔄 Replace</span>
                      <input type="file" accept="image/*" class="sr-only vault-photo-replacer" data-target-id="${photo.id}" style="display:none;">
                    </label>
                  </div>
                </div>
              </div>
            `;
          })
          .join('');

        // Attach replace event listeners
        photosGrid.querySelectorAll('.vault-photo-replacer').forEach((input) => {
          input.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            const targetId = input.getAttribute('data-target-id');
            if (!file || !targetId) return;

            showMediaToast(`Saving ${file.name} to server...`);
            try {
              const uploadRes = await fetch(`/api/upload-photo?targetId=${encodeURIComponent(targetId)}&filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                headers: { 'Content-Type': file.type || 'image/jpeg' },
                body: file
              });
              const uploadData = await uploadRes.json();
              if (uploadData.success) {
                showMediaToast(`✓ Photo saved permanently to server!`);
                loadAndRenderVaultMedia();
                syncPageMediaElements();
              }
            } catch (err) {
              console.warn('Replace photo error:', err);
            }
          });
        });
      }

      // Render Videos in Vault
      if (videosGrid && Array.isArray(data.videos)) {
        videosGrid.innerHTML = data.videos
          .map((video) => {
            return `
              <div class="vault-item-card" id="vaultCard_${video.id}">
                <div class="vault-thumb-wrap">
                  <video src="${video.url}" controls playsinline preload="metadata" style="background:#000;"></video>
                  <span class="vault-item-badge">🎬 ${video.sizeFormatted || 'Video'}</span>
                </div>
                <div class="vault-item-body">
                  <h4 class="vault-item-title">${video.title}</h4>
                  <div class="vault-item-meta">
                    <span>${video.fileName}</span>
                    <span class="media-saved-indicator"><span class="saved-dot"></span> Saved</span>
                  </div>
                  <div class="vault-item-actions">
                    <a href="${video.url}" download="${video.fileName}" class="btn-vault-download" title="Save this video to your computer or phone">
                      ⬇️ Save Video
                    </a>
                    <label class="btn-vault-replace" title="Upload a new video to replace and save permanently">
                      <span>🔄 Replace</span>
                      <input type="file" accept="video/*" class="sr-only vault-video-replacer" data-target-id="${video.id}" style="display:none;">
                    </label>
                  </div>
                </div>
              </div>
            `;
          })
          .join('');

        // Attach video replace listeners
        videosGrid.querySelectorAll('.vault-video-replacer').forEach((input) => {
          input.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            const targetId = input.getAttribute('data-target-id');
            if (!file || !targetId) return;

            const endpoint = targetId === 'construction' ? '/api/upload-construction-video' : '/api/upload-featured-video';
            showMediaToast(`Saving ${file.name} to server...`);
            try {
              const uploadRes = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': file.type || 'video/mp4' },
                body: file
              });
              const uploadData = await uploadRes.json();
              if (uploadData.success) {
                showMediaToast(`✓ Video saved permanently to server!`);
                loadAndRenderVaultMedia();
                syncPageMediaElements();
              }
            } catch (err) {
              console.warn('Replace video error:', err);
            }
          });
        });
      }
    } catch (e) {
      console.warn('Could not load saved media:', e);
    }
  }

  // Sync on-page elements with server data on initial load
  async function syncPageMediaElements() {
    try {
      const res = await fetch('/api/saved-media');
      if (!res.ok) return;
      const data = await res.json();

      // Update badge counts in navigation
      const navBadges = document.querySelectorAll('.media-vault-badge');
      navBadges.forEach((badge) => {
        if (data.stats && data.stats.totalMedia) {
          badge.textContent = `${data.stats.totalMedia} Saved`;
        }
      });

      // Update download links on current page
      if (Array.isArray(data.photos)) {
        data.photos.forEach((p) => {
          const dlBtn = document.querySelector(`[data-download-card="${p.id}"]`);
          if (dlBtn) dlBtn.href = p.url;
        });
      }

      if (Array.isArray(data.videos)) {
        data.videos.forEach((v) => {
          if (v.id === 'football') {
            const dlHome = document.getElementById('downloadFootballVideoHome');
            if (dlHome) dlHome.href = v.url;
            const dlMedia = document.getElementById('downloadFootballVideoMedia');
            if (dlMedia) dlMedia.href = v.url;
          } else if (v.id === 'construction') {
            const dlConst = document.getElementById('downloadConstructionVideo');
            if (dlConst) dlConst.href = v.url;
          }
        });
      }
    } catch (err) {
      // Offline fallback
    }
  }

  // Run initial sync
  syncPageMediaElements();
}
