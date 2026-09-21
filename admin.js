/**
 * Admin Dashboard JavaScript
 * Authenticated administration, message management, analytics, and Chart.js integration
 */

let currentMessages = [];
let activeFilter = 'all';
let reasonChart = null;

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  checkExistingSession();
});

/* ==========================================================================
   Admin Authentication
   ========================================================================== */
function initAdminAuth() {
  const loginForm = document.getElementById('adminLoginForm');
  const loginError = document.getElementById('adminLoginError');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const passwordInput = document.getElementById('adminPassword');
      const password = passwordInput ? passwordInput.value : '';

      if (!password) {
        showLoginError('Please enter the administrator password.');
        return;
      }

      const submitBtn = document.getElementById('adminLoginSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';
      }

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        });

        const data = await res.json();

        if (res.ok && data.token) {
          sessionStorage.setItem('admin_token', data.token);
          if (loginError) loginError.style.display = 'none';
          showDashboardView();
          await loadMessages();
        } else {
          showLoginError(data.error || 'Authentication failed. Please check your password.');
        }
      } catch (err) {
        console.error('Login error:', err);
        showLoginError('Connection error. Unable to reach authentication server.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Access Dashboard';
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('admin_token');
      showAuthView();
    });
  }

  // Filter chips
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-filter') || 'all';
      renderMessages();
    });
  });
}

function showLoginError(msg) {
  const loginError = document.getElementById('adminLoginError');
  if (loginError) {
    loginError.textContent = msg;
    loginError.style.display = 'block';
  }
}

function checkExistingSession() {
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    showDashboardView();
    loadMessages();
  } else {
    showAuthView();
  }
}

function showAuthView() {
  const authView = document.getElementById('adminAuthView');
  const dashView = document.getElementById('adminDashboardView');
  if (authView) authView.style.display = 'block';
  if (dashView) {
    dashView.style.display = 'none';
    dashView.classList.remove('active');
  }
  const passwordInput = document.getElementById('adminPassword');
  if (passwordInput) passwordInput.value = '';
}

function showDashboardView() {
  const authView = document.getElementById('adminAuthView');
  const dashView = document.getElementById('adminDashboardView');
  if (authView) authView.style.display = 'none';
  if (dashView) {
    dashView.style.display = 'block';
    dashView.classList.add('active');
  }
}

/* ==========================================================================
   Messages Retrieval & Management
   ========================================================================== */
async function loadMessages() {
  const token = sessionStorage.getItem('admin_token');
  if (!token) {
    showAuthView();
    return;
  }

  try {
    const res = await fetch('/api/admin/messages', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      sessionStorage.removeItem('admin_token');
      showAuthView();
      showLoginError('Session expired. Please log in again.');
      return;
    }

    if (!res.ok) {
      throw new Error(`Failed to load messages (${res.status})`);
    }

    const messages = await res.json();
    currentMessages = Array.isArray(messages) ? messages : [];

    updateSummaryMetrics(currentMessages);
    updateReasonChart(currentMessages);
    renderMessages();
  } catch (err) {
    console.error('Error loading admin messages:', err);
  }
}

/* ==========================================================================
   Summary Metrics Calculation
   ========================================================================== */
function updateSummaryMetrics(messages) {
  const total = messages.length;
  const newCount = messages.filter((m) => !m.replied).length;
  const repliedCount = messages.filter((m) => m.replied).length;
  const replyRate = total > 0 ? Math.round((repliedCount / total) * 100) : 0;

  const elTotal = document.getElementById('metricTotal');
  const elNew = document.getElementById('metricNew');
  const elReplied = document.getElementById('metricReplied');
  const elRate = document.getElementById('metricRate');

  if (elTotal) elTotal.textContent = total;
  if (elNew) elNew.textContent = newCount;
  if (elReplied) elReplied.textContent = repliedCount;
  if (elRate) elRate.textContent = `${replyRate}%`;
}

/* ==========================================================================
   Messages Rendering & Filtering
   ========================================================================== */
function renderMessages() {
  const container = document.getElementById('adminMessagesList');
  if (!container) return;

  container.innerHTML = '';

  let filtered = currentMessages;
  if (activeFilter === 'new') {
    filtered = currentMessages.filter((m) => !m.replied);
  } else if (activeFilter === 'replied') {
    filtered = currentMessages.filter((m) => m.replied);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No messages found in this category.</p>
      </div>
    `;
    return;
  }

  filtered.forEach((msg) => {
    const card = document.createElement('div');
    card.className = `message-card ${msg.replied ? 'is-replied' : 'is-new'}`;

    const dateFormatted = msg.submittedAt
      ? new Date(msg.submittedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Date unavailable';

    const repliedDateFormatted = msg.repliedAt
      ? new Date(msg.repliedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    card.innerHTML = `
      <div class="message-card-top">
        <div>
          <h4 class="message-sender-name">${escapeHtml(msg.firstName)} ${escapeHtml(msg.lastName)}</h4>
          <a href="mailto:${escapeHtml(msg.email)}" class="message-sender-email">${escapeHtml(msg.email)}</a>
        </div>
        <div class="message-badges">
          <span class="reason-badge">${escapeHtml(msg.reason || 'General')}</span>
          <span class="status-badge ${msg.replied ? 'badge-replied' : 'badge-new'}">
            ${msg.replied ? '✓ Replied' : '● New'}
          </span>
        </div>
      </div>
      <div class="message-body-text">${escapeHtml(msg.message)}</div>
      <div class="message-card-bottom">
        <span>Received: <strong>${dateFormatted}</strong></span>
        ${
          msg.replied
            ? `<span style="color: var(--color-success)">Replied: ${repliedDateFormatted}</span>`
            : `<button class="btn btn-secondary btn-sm mark-replied-btn" data-id="${msg.id}">Mark as Replied</button>`
        }
      </div>
    `;

    container.appendChild(card);
  });

  // Attach click listeners to "Mark as Replied" buttons
  const replyButtons = container.querySelectorAll('.mark-replied-btn');
  replyButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const msgId = e.currentTarget.getAttribute('data-id');
      await markMessageReplied(msgId, e.currentTarget);
    });
  });
}

/* ==========================================================================
   Mark as Replied Handler
   ========================================================================== */
async function markMessageReplied(messageId, btnElement) {
  const token = sessionStorage.getItem('admin_token');
  if (!token) return;

  if (btnElement) {
    btnElement.disabled = true;
    btnElement.textContent = 'Updating...';
  }

  try {
    const res = await fetch(`/api/admin/messages/${encodeURIComponent(messageId)}/replied`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      // Reload messages to update metrics and UI
      await loadMessages();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to update message reply status.');
      if (btnElement) {
        btnElement.disabled = false;
        btnElement.textContent = 'Mark as Replied';
      }
    }
  } catch (err) {
    console.error('Error marking replied:', err);
    alert('Network error while marking message as replied.');
    if (btnElement) {
      btnElement.disabled = false;
      btnElement.textContent = 'Mark as Replied';
    }
  }
}

/* ==========================================================================
   Chart.js: Messages by Reason for Contact
   ========================================================================== */
function updateReasonChart(messages) {
  const canvas = document.getElementById('reasonsChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const categories = ['Comment', 'Question', 'Partnership', 'Opportunity', 'Other'];
  const counts = categories.map((cat) => {
    return messages.filter((m) => m.reason === cat).length;
  });

  const ctx = canvas.getContext('2d');

  if (reasonChart) {
    reasonChart.data.datasets[0].data = counts;
    reasonChart.update();
    return;
  }

  reasonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [
        {
          label: 'Number of Messages',
          data: counts,
          backgroundColor: [
            'rgba(37, 99, 235, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(139, 92, 246, 0.85)',
            'rgba(100, 116, 139, 0.85)'
          ],
          borderColor: [
            '#2563eb',
            '#10b981',
            '#f59e0b',
            '#8b5cf6',
            '#64748b'
          ],
          borderWidth: 1.5,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 6
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: '#64748b',
            font: { size: 11 }
          },
          grid: {
            color: '#e2e8f0'
          }
        },
        x: {
          ticks: {
            color: '#475569',
            font: { size: 12, weight: '600' }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
