/* ============================================================
   script.js — Lógica de la página "¿me perdonas?"
   ============================================================ */

// ──────────────────────────────────────────────
// REFERENCIAS DOM
// ──────────────────────────────────────────────
const btnNo         = document.getElementById('btn-no');
const btnYes        = document.getElementById('btn-yes');
const dogSad        = document.getElementById('dog-sad');
const dogHappy      = document.getElementById('dog-happy');
const mainScreen    = document.getElementById('main-screen');
const successScreen = document.getElementById('success-screen');
const audio         = document.getElementById('perdona-audio');
const canvas        = document.getElementById('particles-canvas');
const ctx           = canvas.getContext('2d');

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
window.addEventListener('resize', () => { resizeCanvas(); createParticles(); updateNoButtonSize(); });

// ──────────────────────────────────────────────
// BOTÓN "NO" — SE MUEVE POR TODA LA PANTALLA
// ──────────────────────────────────────────────
let noClickCount  = 0;
let isMoving      = false;
let lastZone      = -1;

// 8 zonas de la pantalla para que se note bien el movimiento
const ZONES = [
  // [xFactor_start, yFactor_start, xFactor_end, yFactor_end]
  // arriba-izquierda
  { xMin: 0.03, xMax: 0.35, yMin: 0.03, yMax: 0.20 },
  // arriba-centro
  { xMin: 0.30, xMax: 0.65, yMin: 0.03, yMax: 0.18 },
  // arriba-derecha
  { xMin: 0.55, xMax: 0.90, yMin: 0.03, yMax: 0.20 },
  // medio-izquierda
  { xMin: 0.02, xMax: 0.20, yMin: 0.35, yMax: 0.65 },
  // medio-derecha
  { xMin: 0.72, xMax: 0.95, yMin: 0.35, yMax: 0.65 },
  // abajo-izquierda
  { xMin: 0.03, xMax: 0.35, yMin: 0.72, yMax: 0.92 },
  // abajo-centro
  { xMin: 0.30, xMax: 0.65, yMin: 0.76, yMax: 0.94 },
  // abajo-derecha
  { xMin: 0.55, xMax: 0.90, yMin: 0.72, yMax: 0.92 },
];

function initNoButton() {
  btnNo.style.position  = 'fixed';
  btnNo.style.zIndex    = '999';
  btnNo.style.transition = 'none';

  // Posición inicial: abajo-centro
  const bw = btnNo.offsetWidth;
  const bh = btnNo.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  btnNo.style.left = Math.max(8, (vw - bw) / 2) + 'px';
  btnNo.style.top  = (vh * 0.72) + 'px';
  lastZone = 6; // abajo-centro
}

function pickZone() {
  // Elige una zona aleatoria distinta a la actual
  let zone;
  do {
    zone = Math.floor(Math.random() * ZONES.length);
  } while (zone === lastZone);
  lastZone = zone;
  return ZONES[zone];
}

function moveNoButton() {
  if (isMoving) return;
  isMoving = true;

  const bw = btnNo.offsetWidth;
  const bh = btnNo.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const zone = pickZone();

  // Posición dentro de la zona elegida
  const xRange = (zone.xMax - zone.xMin) * vw - bw;
  const yRange = (zone.yMax - zone.yMin) * vh - bh;

  let newX = zone.xMin * vw + Math.random() * Math.max(0, xRange);
  let newY = zone.yMin * vh + Math.random() * Math.max(0, yRange);

  // Clampar para que no salga de pantalla
  newX = Math.max(6, Math.min(newX, vw - bw - 6));
  newY = Math.max(6, Math.min(newY, vh - bh - 6));

  // Transición rápida y elástica
  btnNo.style.transition = 'left 0.28s cubic-bezier(0.34,1.56,0.64,1), top 0.28s cubic-bezier(0.34,1.56,0.64,1)';
  btnNo.style.left = newX + 'px';
  btnNo.style.top  = newY + 'px';

  // Animación de "pulse"
  btnNo.classList.remove('pulse');
  void btnNo.offsetWidth;
  btnNo.classList.add('pulse');

  noClickCount++;
  updateNoButtonSize();

  setTimeout(() => { isMoving = false; }, 320);
}

// El botón crece y brilla más con cada intento
function updateNoButtonSize() {
  const base   = window.innerWidth <= 420 ? 17 : 20;
  const growth = Math.min(noClickCount * 0.055, 0.55);
  const fs     = Math.min(base * (1 + growth), 30);
  const pv     = Math.min(16 * (1 + growth), 28);
  const ph     = Math.min(28 * (1 + growth), 50);
  btnNo.style.fontSize = fs + 'px';
  btnNo.style.padding  = `${pv}px ${ph}px`;
}

function escapeButton(e) {
  e.preventDefault();
  e.stopPropagation();
  moveNoButton();
}

// ──────────────────────────────────────────────
// BOTÓN "SÍ ME PERDONAS"
// ──────────────────────────────────────────────
function handleYes() {
  // Cambiar perro triste → feliz
  dogSad.classList.remove('active');
  dogHappy.classList.add('active');

  // Reproducir audio
  audio.currentTime = 0;
  audio.play().catch(() => {
    document.addEventListener('touchend', () => audio.play(), { once: true });
    document.addEventListener('click',    () => audio.play(), { once: true });
  });

  // Ocultar botón "no"
  btnNo.style.display = 'none';

  // Transición a pantalla de éxito
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
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left              = Math.random() * 100 + 'vw';
    piece.style.width             = (Math.random() * 9 + 5) + 'px';
    piece.style.height            = (Math.random() * 9 + 5) + 'px';
    piece.style.background        = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.borderRadius      = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = (Math.random() * 2.5 + 1.5) + 's';
    piece.style.animationDelay   = (Math.random() * 0.8) + 's';
    piece.style.opacity           = Math.random() * 0.7 + 0.3;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 5000);
  }
}

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(initNoButton, 120);
});

window.addEventListener('resize', () => {
  setTimeout(initNoButton, 120);
});

// Prevenir scroll en móvil
document.addEventListener('touchmove', (e) => {
  if (e.cancelable) e.preventDefault();
}, { passive: false });
