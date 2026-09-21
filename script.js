/**
 * Client-Side JavaScript for Web Page Project
 * Ian Tapia Reyes Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initContactForm();
  initGalleryLightbox();
  initBackToTop();
});

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

    // Client-side Validation
    if (!firstName) {
      showAlert('Please provide your First Name.', 'error');
      firstNameInput && firstNameInput.focus();
      return;
    }
    if (!lastName) {
      showAlert('Please provide your Last Name.', 'error');
      lastNameInput && lastNameInput.focus();
      return;
    }
    if (!email) {
      showAlert('Please provide your Email Address.', 'error');
      emailInput && emailInput.focus();
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showAlert('Please enter a valid email address (e.g., name@example.com).', 'error');
      emailInput && emailInput.focus();
      return;
    }

    if (!reason) {
      showAlert('Please select a Reason for Contact.', 'error');
      reasonInput && reasonInput.focus();
      return;
    }

    if (!message) {
      showAlert('Please write a message before submitting.', 'error');
      messageInput && messageInput.focus();
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
