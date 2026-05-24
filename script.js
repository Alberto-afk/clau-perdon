/* ============================================================
   script.js — Lógica de la página "¿me perdonas?"
   ============================================================ */

// ──────────────────────────────────────────────
// REFERENCIAS DOM
// ──────────────────────────────────────────────
const btnNo        = document.getElementById('btn-no');
const btnYes       = document.getElementById('btn-yes');
const buttonsArea  = document.getElementById('buttons-area');
const dogSad       = document.getElementById('dog-sad');
const dogHappy     = document.getElementById('dog-happy');
const mainScreen   = document.getElementById('main-screen');
const successScreen = document.getElementById('success-screen');
const audio        = document.getElementById('perdona-audio');
const canvas       = document.getElementById('particles-canvas');
const ctx          = canvas.getContext('2d');

// ──────────────────────────────────────────────
// CANVAS PARTÍCULAS
// ──────────────────────────────────────────────
let W, H;
let particles = [];

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function createParticles(n = 55) {
  particles = [];
  for (let i = 0; i < n; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      opacity: Math.random() * 0.5 + 0.08,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 80, 100, ${p.opacity})`;
    ctx.fill();

    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;
  }
  requestAnimationFrame(drawParticles);
}

resizeCanvas();
createParticles();
drawParticles();
window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });

// ──────────────────────────────────────────────
// POSICIÓN DINÁMICA DEL BOTÓN "NO"
// ──────────────────────────────────────────────
let noEscapeEnabled  = true;  // empieza en modo "escapa"
let noClickCount     = 0;     // cuántas veces intentó presionarlo
let isMoving         = false;

function getAreaBounds() {
  const rect = buttonsArea.getBoundingClientRect();
  return rect;
}

function getButtonSize() {
  return {
    w: btnNo.offsetWidth,
    h: btnNo.offsetHeight,
  };
}

function getRandomPosition() {
  const area   = getAreaBounds();
  const btn    = getButtonSize();
  const margin = 10;

  const maxX = area.width  - btn.w - margin;
  const maxY = area.height - btn.h - margin;

  return {
    x: margin + Math.random() * maxX,
    y: margin + Math.random() * maxY,
  };
}

// Hace que el botón "no" tenga posición absoluta dentro de buttonsArea
function initNoButton() {
  btnNo.style.position = 'absolute';
  // Colocación inicial centrada
  const area = getAreaBounds();
  const btn  = getButtonSize();
  btnNo.style.left = ((area.width - btn.w) / 2) + 'px';
  btnNo.style.top  = '0px';
}

function moveNoButton() {
  if (!noEscapeEnabled || isMoving) return;
  isMoving = true;

  const pos  = getRandomPosition();
  const area = getAreaBounds();
  const btn  = getButtonSize();

  // Asegurar que no se salga de los límites
  const safeX = Math.max(0, Math.min(pos.x, area.width  - btn.w));
  const safeY = Math.max(0, Math.min(pos.y, area.height - btn.h));

  btnNo.style.transition = 'left 0.22s cubic-bezier(0.34,1.56,0.64,1), top 0.22s cubic-bezier(0.34,1.56,0.64,1)';
  btnNo.style.left = safeX + 'px';
  btnNo.style.top  = safeY + 'px';

  // Quitar la clase pulse si está y añadir nueva
  btnNo.classList.remove('pulse');
  void btnNo.offsetWidth; // reflow
  btnNo.classList.add('pulse');

  noClickCount++;
  updateNoButtonSize();

  setTimeout(() => { isMoving = false; }, 280);
}

// Cuanto más intenta, más grande y llamativo se hace el botón
function updateNoButtonSize() {
  const scale = 1 + Math.min(noClickCount * 0.04, 0.4);
  // Escalamos padding y font-size dinámicamente
  const baseFontSize   = window.innerWidth <= 420 ? 17 : 21;
  const newFontSize    = Math.min(baseFontSize * scale, 28);
  const basePadV       = window.innerWidth <= 420 ? 16 : 18;
  const basePadH       = window.innerWidth <= 420 ? 26 : 32;
  const newPadV        = Math.min(basePadV * scale, 26);
  const newPadH        = Math.min(basePadH * scale, 44);

  btnNo.style.fontSize  = newFontSize + 'px';
  btnNo.style.padding   = `${newPadV}px ${newPadH}px`;
}

// Escapa en touch/hover/click
function escapeButton(e) {
  e.preventDefault();
  e.stopPropagation();
  moveNoButton();
}

// ──────────────────────────────────────────────
// BOTÓN "SÍ ME PERDONAS"
// ──────────────────────────────────────────────
function handleYes() {
  // 1. Cambiar el perro: triste → feliz
  dogSad.classList.remove('active');
  dogHappy.classList.add('active');

  // 2. Reproducir audio
  audio.currentTime = 0;
  audio.play().catch(() => {
    // autoplay bloqueado — intentar al siguiente click
    document.addEventListener('click', () => audio.play(), { once: true });
  });

  // 3. Transición de pantalla
  setTimeout(() => {
    mainScreen.classList.remove('active');
    successScreen.classList.add('active');
    launchConfetti();
  }, 900);
}

// ──────────────────────────────────────────────
// CONFETI
// ──────────────────────────────────────────────
const CONFETTI_COLORS = [
  '#c0192e', '#8b0520', '#e8314a',
  '#f7c6cc', '#fff', '#d4a0a8',
  '#ff6b81', '#b22233',
];

function launchConfetti() {
  const container = document.getElementById('confetti');
  const count     = 80;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left         = Math.random() * 100 + 'vw';
    piece.style.width        = (Math.random() * 8 + 5) + 'px';
    piece.style.height       = (Math.random() * 8 + 5) + 'px';
    piece.style.background   = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration  = (Math.random() * 2.5 + 1.5) + 's';
    piece.style.animationDelay     = (Math.random() * 0.8) + 's';
    piece.style.opacity      = Math.random() * 0.7 + 0.3;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 5000);
  }
}

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
window.addEventListener('load', () => {
  // Pequeño delay para que el DOM esté renderizado y tengamos dimensiones reales
  setTimeout(initNoButton, 100);
});

// Re-inicializar en resize (ej: orientación)
window.addEventListener('resize', () => {
  setTimeout(initNoButton, 100);
});

// Prevenir scroll en móvil
document.addEventListener('touchmove', (e) => {
  if (e.cancelable) e.preventDefault();
}, { passive: false });
