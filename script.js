const mainText = document.getElementById('mainText');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const dogImg = document.getElementById('dogImg');
const buttonsContainer = document.querySelector('.buttons');
const finalMessage = document.getElementById('finalMessage');
const audio = document.getElementById('audio');
const audioNo = document.getElementById('audioNo');
const attemptsContainer = document.getElementById('attempts-container');
const attemptsSpan = document.getElementById('attempts');
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let noClickCount = 0;
let yesScale = 1;

// Partículas
let W, H;
let particles = [];

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function createParticles(n = 50) {
  particles = [];
  for (let i = 0; i < n; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 100, 100, ${p.opacity})`;
    ctx.fill();
    
    p.x += p.speedX;
    p.y += p.speedY;
    
    if (p.x < 0 || p.x > W) p.speedX *= -1;
    if (p.y < 0 || p.y > H) p.speedY *= -1;
  }
  requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
createParticles();
drawParticles();

// Function to move the NO button
function moveNoButton(e) {
    if(e && e.cancelable) e.preventDefault();
    
    // Switch to fixed positioning if not already
    if (!noBtn.classList.contains('absolute-btn')) {
        noBtn.classList.add('absolute-btn');
    }

    const padding = 20;
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;
    
    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;
    
    let newX = padding + Math.random() * (maxX - padding * 2);
    let newY = padding + Math.random() * (maxY - padding * 2);
    
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;
    noBtn.style.bottom = 'auto';
    noBtn.style.right = 'auto';

    // Play NO audio
    audioNo.currentTime = 0;
    audioNo.play().catch(e => console.log('Audio autoplay blocked', e));

    // Make NO button smaller
    noClickCount++;
    const noScale = Math.max(0.4, 1 - (noClickCount * 0.15));
    noBtn.style.transform = `scale(${noScale})`;
    
    // Make YES button bigger
    yesScale += 0.2;
    yesBtn.style.transform = `scale(${yesScale})`;
    
    // Update attempts text
    attemptsContainer.classList.remove('hidden');
    attemptsSpan.innerText = noClickCount;
    
    // Change YES button style to look more appealing as it grows
    if (noClickCount === 1) {
        yesBtn.style.background = '#ff4d4d';
        yesBtn.style.color = 'white';
        yesBtn.style.boxShadow = '0 8px 20px rgba(255, 77, 77, 0.4)';
    }
}

// Support both touch and click for the NO button so it's impossible to click
noBtn.addEventListener('touchstart', moveNoButton, {passive: false});
noBtn.addEventListener('click', moveNoButton);
noBtn.addEventListener('mouseover', function(e) {
    // Only trigger on hover for non-touch devices
    if (window.matchMedia("(hover: hover)").matches) {
        moveNoButton(e);
    }
});

// YES button logic
yesBtn.addEventListener('click', function() {
    // Play audio
    audio.play().catch(e => console.log('Audio autoplay blocked', e));
    
    // Change image
    dogImg.style.opacity = '0';
    setTimeout(() => {
        dogImg.src = 'perro-feliz.png';
        dogImg.style.opacity = '1';
    }, 500);

    // Update UI
    mainText.classList.add('hidden');
    buttonsContainer.classList.add('hidden');
    noBtn.classList.add('hidden');
    attemptsContainer.classList.add('hidden');
    
    finalMessage.classList.remove('hidden');
});
