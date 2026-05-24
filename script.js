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
const attemptsText  = document.getElementById('attempts-text');
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
window.addEventListener('resize', () => { resizeCanvas(); createParticles(); updateButtonSizes(); });

// ──────────────────────────────────────────────
// BOTÓN "NO" — SE MUEVE POR TODA LA PANTALLA Y SE ACHICA
// ──────────────────────────────────────────────
let noClickCount  = 0;
let isMoving      = false;
let lastZone      = -1;
let hasEscaped    = false; // Bandera para saber si ya empezó a volar

const ZONES = [
  { xMin: 0.03, xMax: 0.35, yMin: 0.03, yMax: 0.20 },
  { xMin: 0.30, xMax: 0.65, yMin: 0.03, yMax: 0.18 },
  { xMin: 0.55, xMax: 0.90, yMin: 0.03, yMax: 0.20 },
  { xMin: 0.02, xMax: 0.20, yMin: 0.35, yMax: 0.65 },
  { xMin: 0.72, xMax: 0.95, yMin: 0.35, yMax: 0.65 },
  { xMin: 0.03, xMax: 0.35, yMin: 0.72, yMax: 0.92 },
  { xMin: 0.30, xMax: 0.65, yMin: 0.76, yMax: 0.94 },
  { xMin: 0.55, xMax: 0.90, yMin: 0.72, yMax: 0.92 },
];

function initNoButton() {
  // Limpia estilos de vuelo para que vuelva al flujo de la tarjeta (encuadre inicial óptimo)
  btnNo.style.position   = '';
  btnNo.style.zIndex     = '';
  btnNo.style.left       = '';
  btnNo.style.top        = '';
  btnNo.style.transition = 'none';
  hasEscaped             = false;
  noClickCount           = 0;
  updateButtonSizes();
}

function pickZone() {
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

  noClickCount++;

  // En el primer touch/hover, forzamos position fixed para sacarlo del card y hacerlo volar
  if (!hasEscaped) {
    btnNo.style.position = 'fixed';
    btnNo.style.zIndex   = '9999';
    hasEscaped = true;
  }

  // Actualizar los tamaños de ambos botones primero
  updateButtonSizes();

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

  newX = Math.max(8, Math.min(newX, vw - bw - 8));
  newY = Math.max(8, Math.min(newY, vh - bh - 8));

  btnNo.style.transition = 'left 0.26s cubic-bezier(0.34,1.56,0.64,1), top 0.26s cubic-bezier(0.34,1.56,0.64,1)';
  btnNo.style.left = newX + 'px';
  btnNo.style.top  = newY + 'px';

  btnNo.classList.remove('pulse');
  void btnNo.offsetWidth;
  btnNo.classList.add('pulse');

  // Actualizar el texto del contador al estilo de tu captura
  attemptsText.classList.add('visible');
  attemptsText.innerHTML = `¡Puedo hacer esto todo el día! 💪🔥 (Intentos: ${noClickCount})`;

  setTimeout(() => { isMoving = false; }, 280);
}

// Actualiza los tamaños de ambos botones
function updateButtonSizes() {
  // 1. EL BOTÓN "NO" SE VA ACHICANDO
  const noBaseFontSize = window.innerWidth <= 420 ? 17 : 20;
  // Factor de escala: reduce un 6.5% por cada intento, hasta un mínimo del 30% del tamaño original
  const shrinkScale = Math.max(1 - (noClickCount * 0.065), 0.3);
  
  const noFs = noBaseFontSize * shrinkScale;
  const noPv = Math.max(18 * shrinkScale, 6);
  const noPh = Math.max(32 * shrinkScale, 14);
  const noMinW = Math.max(200 * shrinkScale, 70);

  btnNo.style.fontSize  = noFs + 'px';
  btnNo.style.padding   = `${noPv}px ${noPh}px`;
  btnNo.style.minWidth  = noMinW + 'px';

  // 2. EL BOTÓN "SÍ" SE HACE CADA VEZ MÁS GRANDE (COMO EN LA CAPTURA)
  // Factor de crecimiento: sube exponencialmente o lineal con cada intento
  const growthScale = 1 + (noClickCount * 0.16); // 16% más grande por cada intento
  
  const yesBaseFontSize = 13;
  const yesFs = Math.min(yesBaseFontSize * growthScale, 36); // cap at 36px
  const yesPv = Math.min(11 * growthScale, 28);
  const yesPh = Math.min(28 * growthScale, 72);
  const yesMinW = Math.min(140 * growthScale, 340);
  const yesRadius = Math.min(50 * growthScale, 24); // se vuelve más cuadrado como un gran botón principal

  btnYes.style.fontSize     = yesFs + 'px';
  btnYes.style.padding      = `${yesPv}px ${yesPh}px`;
  btnYes.style.minWidth     = yesMinW + 'px';
  btnYes.style.borderRadius = yesRadius + 'px';

  // Si ya ha intentado más de 2 veces, activamos el fondo gradient llamativo rojo/rosa premium en el botón SÍ
  if (noClickCount >= 2) {
    btnYes.classList.add('glow-active');
  } else {
    btnYes.classList.remove('glow-active');
  }
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
  dogSad.classList.remove('active');
  dogHappy.classList.add('active');

  audio.currentTime = 0;
  audio.play().catch(() => {
    document.addEventListener('touchend', () => audio.play(), { once: true });
    document.addEventListener('click',    () => audio.play(), { once: true });
  });

  btnNo.style.display = 'none';

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
  initNoButton();
});

window.addEventListener('resize', () => {
  initNoButton();
});

// Prevenir scroll en móvil
document.addEventListener('touchmove', (e) => {
  if (e.cancelable) e.preventDefault();
}, { passive: false });
