const mainText = document.getElementById('mainText');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const dogImg = document.getElementById('dogImg');
const buttonsContainer = document.querySelector('.buttons');
const finalMessage = document.getElementById('finalMessage');
const audio = document.getElementById('audio');

let noClickCount = 0;
let yesScale = 1;

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

    // Make NO button smaller
    noClickCount++;
    const noScale = Math.max(0.4, 1 - (noClickCount * 0.15));
    noBtn.style.transform = `scale(${noScale})`;
    
    // Make YES button bigger
    yesScale += 0.2;
    yesBtn.style.transform = `scale(${yesScale})`;
    
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
    
    finalMessage.classList.remove('hidden');
});
