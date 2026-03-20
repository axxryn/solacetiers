// ── Config ──────────────────────────────────────────────────────────────────
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1484499620137533563/rYCIy-SY88iYySRZIU_YuvQ66HUPjT_rnka2cyVEpJGc2Ie62NZ47lKqdVCvbluP7IhF';
const DISCORD_INVITE = 'https://discord.gg/yug6NCvrCY';
const SERVER_IP = 'east.catpvp.xyz';
const STORAGE_KEY = 'solacetiers_results';
const SUBMISSIONS_KEY = 'solacetiers_submissions';

const MODES = [
  { id: 'smp',   label: 'SMP',   icon: '🏡' },
  { id: 'sword', label: 'Sword', icon: '⚔️' },
  { id: 'axe',   label: 'Axe',   icon: '🪓' },
  { id: 'mace',  label: 'Mace',  icon: '🔨' },
];

const TIERS = [
  { id: 'S', label: 'S Tier', color: '#f0b429' },
  { id: 'A', label: 'A Tier', color: '#ef4444' },
  { id: 'B', label: 'B Tier', color: '#a855f7' },
  { id: 'C', label: 'C Tier', color: '#3b82f6' },
  { id: 'D', label: 'D Tier', color: '#22c55e' },
  { id: 'F', label: 'F Tier', color: '#6b7280' },
];

const TIER_ORDER = ['S','A','B','C','D','F'];

// ── Storage helpers ──────────────────────────────────────────────────────────
function getResults() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveResults(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSubmissions() {
  try { return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]'); } catch { return []; }
}

function saveSubmissions(data) {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(data));
}

// ── Webhook helpers ──────────────────────────────────────────────────────────
async function sendWebhook(payload) {
  const form = new FormData();
  form.append('payload_json', JSON.stringify(payload));
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: form,
  });
  return true;
}

function buildSubmissionEmbed(username, tier, mode) {
  const modeObj = MODES.find(m => m.id === mode) || { label: mode, icon: '🎮' };
  const tierObj = TIERS.find(t => t.id === tier) || { label: tier + ' Tier', color: '#ffffff' };
  return {
    embeds: [{
      title: `📋 Tier Test Submission`,
      color: parseInt(tierObj.color.replace('#',''), 16),
      fields: [
        { name: '👤 Player', value: `\`${username}\``, inline: true },
        { name: '🏆 Tier', value: `**${tierObj.label}**`, inline: true },
        { name: `${modeObj.icon} Gamemode`, value: `**${modeObj.label}**`, inline: true },
      ],
      footer: { text: 'SolaceTiers • Submission Request' },
      timestamp: new Date().toISOString(),
    }]
  };
}

function buildResultEmbed(entry) {
  const modeObj = MODES.find(m => m.id === entry.mode) || { label: entry.mode, icon: '🎮' };
  const tierObj = TIERS.find(t => t.id === entry.tier) || { label: entry.tier + ' Tier', color: '#ffffff' };
  return {
    embeds: [{
      title: `✅ Official Tier Placement`,
      color: parseInt(tierObj.color.replace('#',''), 16),
      fields: [
        { name: '👤 Player', value: `\`${entry.username}\``, inline: true },
        { name: '🏆 Tier', value: `**${tierObj.label}**`, inline: true },
        { name: `${modeObj.icon} Gamemode`, value: `**${modeObj.label}**`, inline: true },
        { name: '📝 Notes', value: entry.notes || '_No notes_', inline: false },
      ],
      footer: { text: `SolaceTiers • Official Result — ID: ${entry.id}` },
      timestamp: new Date(entry.timestamp).toISOString(),
    }]
  };
}

// ── Toast ────────────────────────────────────────────────────────────────────
function initToasts() {
  if (!document.getElementById('toast-container')) {
    const el = document.createElement('div');
    el.className = 'toast-container';
    el.id = 'toast-container';
    document.body.appendChild(el);
  }
}

function showToast(message, type = 'info', duration = 3500) {
  initToasts();
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.style.opacity = '0', duration);
  setTimeout(() => toast.remove(), duration + 400);
}

// ── Secret key sequence ──────────────────────────────────────────────────────
const SECRET = 'abcdefg';
let secretBuffer = '';
let secretTimer = null;

function initSecretKey(onUnlock) {
  // Visual indicator dots
  const hint = document.createElement('div');
  hint.className = 'key-hint';
  hint.id = 'key-hint';
  for (let i = 0; i < SECRET.length; i++) {
    const dot = document.createElement('div');
    dot.className = 'key-dot';
    hint.appendChild(dot);
  }
  document.body.appendChild(hint);

  document.addEventListener('keydown', (e) => {
    const ch = e.key.toLowerCase();
    if (!SECRET.includes(ch)) { resetSecret(); return; }

    const expected = SECRET[secretBuffer.length];
    if (ch !== expected) { resetSecret(); return; }

    secretBuffer += ch;

    // Light up dots
    const dots = document.querySelectorAll('.key-dot');
    dots.forEach((d, i) => d.classList.toggle('lit', i < secretBuffer.length));
    hint.classList.add('visible');

    // Reset timer
    clearTimeout(secretTimer);
    secretTimer = setTimeout(resetSecret, 5000);

    if (secretBuffer === SECRET) {
      resetSecret();
      onUnlock();
    }
  });
}

function resetSecret() {
  secretBuffer = '';
  clearTimeout(secretTimer);
  const dots = document.querySelectorAll('.key-dot');
  dots.forEach(d => d.classList.remove('lit'));
  const hint = document.getElementById('key-hint');
  if (hint) hint.classList.remove('visible');
}

// ── Nav active link ──────────────────────────────────────────────────────────
function setNavActive() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop();
    link.classList.toggle('active', href === path);
  });
}

// ── Tab active ───────────────────────────────────────────────────────────────
function initTabs() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.tab').forEach(tab => {
    const href = tab.getAttribute('href')?.split('/').pop();
    tab.classList.toggle('active', href === path);
  });
}

// ── Minecraft avatar ─────────────────────────────────────────────────────────
function mcAvatarUrl(username) {
  return `https://mc-heads.net/avatar/${encodeURIComponent(username)}/32`;
}

// ── Utilities ────────────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
