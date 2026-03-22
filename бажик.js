// Веселый Бажик - Полностью адаптивная версия!
let sheepState = {
    totalSheep: 1,
    clickCounter: 0,
    audioEnabled: true,
    sheepElements: new Map(),
};

const sheepField = document.getElementById('sheepField');
const sheepCountSpan = document.getElementById('sheepCount');
const totalClicksSpan = document.getElementById('totalClicks');
const resetButton = document.getElementById('resetButton');
const muteButton = document.getElementById('muteButton');

let audioCtx = null;

function initAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { 
        console.warn("Web Audio API не поддерживается"); 
        sheepState.audioEnabled = false; 
    }
}

function playBaaSound() {
    if (!sheepState.audioEnabled) return;
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 720;
    gain.gain.value = 0.28;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.45);
    osc.stop(now + 0.42);
    
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = 560;
    gain2.gain.value = 0.22;
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start();
    gain2.gain.exponentialRampToValueAtTime(0.00001, now + 0.35);
    osc2.stop(now + 0.32);
}

function showPhrase(x, y) {
    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    bubble.innerText = '🐏💚 "ЛАРРИ И ЛОРИ ЧОРНЫЙ!" 🎶🌮';
    bubble.style.left = (x - 80) + 'px';
    bubble.style.top = (y - 70) + 'px';
    document.body.appendChild(bubble);
    setTimeout(() => { if(bubble) bubble.remove(); }, 800);
}

function createSheepElement(id) {
    const sheepDiv = document.createElement('div');
    sheepDiv.className = 'sheep-card';
    sheepDiv.setAttribute('data-id', id);
    
    sheepDiv.innerHTML = `
        <div class="sombrero-real"></div>
        <div class="sheep-image-container">
            <img src="бажичек.png" alt="Бажик" class="sheep-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%238bc34a\'/%3E%3Ctext x=\'50\' y=\'67\' text-anchor=\'middle\' fill=\'white\' font-size=\'40\'%3E🐏%3C/text%3E%3C/svg%3E';">
            <div class="mexican-frame"></div>
        </div>
        <div class="sheep-name-real">🐏 БАЖИК #${id}</div>
    `;
    
    sheepDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSheepClick(id, sheepDiv, e);
    });
    
    return sheepDiv;
}

function handleSheepClick(id, element, event) {
    sheepState.clickCounter++;
    totalClicksSpan.innerText = sheepState.clickCounter;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    showPhrase(centerX, centerY);
    
    if (sheepState.audioEnabled) {
        playBaaSound();
    }
    
    element.style.transform = 'scale(0.95)';
    setTimeout(() => { if(element) element.style.transform = ''; }, 120);
    
    const newId = Date.now() + Math.floor(Math.random() * 10000) + sheepState.totalSheep;
    const newSheep = createSheepElement(newId);
    
    sheepField.appendChild(newSheep);
    sheepState.totalSheep++;
    sheepCountSpan.innerText = sheepState.totalSheep;
    
    sheepState.sheepElements.set(newId, newSheep);
    createMiniConfetti(rect.left + rect.width/2, rect.top);
}

function createMiniConfetti(x, y) {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#ff9f4a', '#ff6b9d', '#4ecdc4'];
    for (let i = 0; i < 16; i++) {
        const conf = document.createElement('div');
        const size = Math.random() * 8 + 5;
        conf.style.position = 'fixed';
        conf.style.width = size + 'px';
        conf.style.height = size + 'px';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        conf.style.left = x + 'px';
        conf.style.top = y + 'px';
        conf.style.pointerEvents = 'none';
        conf.style.zIndex = '999';
        document.body.appendChild(conf);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 7;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity - 3;
        let posX = x, posY = y;
        let life = 1.0;
        
        function animateConf() {
            posX += vx;
            posY += vy;
            life -= 0.02;
            if (life <= 0 || posY > window.innerHeight + 50) {
                conf.remove();
                return;
            }
            conf.style.left = posX + 'px';
            conf.style.top = posY + 'px';
            conf.style.opacity = life;
            conf.style.transform = `rotate(${Date.now()}deg)`;
            requestAnimationFrame(animateConf);
        }
        requestAnimationFrame(animateConf);
    }
}

function resetGame() {
    while (sheepField.firstChild) {
        sheepField.removeChild(sheepField.firstChild);
    }
    sheepState.sheepElements.clear();
    
    sheepState.totalSheep = 1;
    sheepState.clickCounter = 0;
    totalClicksSpan.innerText = '0';
    sheepCountSpan.innerText = '1';
    
    const firstSheep = createSheepElement(1);
    sheepField.appendChild(firstSheep);
    sheepState.sheepElements.set(1, firstSheep);
    
    const msg = document.createElement('div');
    msg.className = 'speech-bubble';
    msg.innerText = '🌮✨ Стадо обнулено! ✨🐏';
    msg.style.left = '35%';
    msg.style.top = '40%';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 1500);
}

function toggleMute() {
    sheepState.audioEnabled = !sheepState.audioEnabled;
    if (sheepState.audioEnabled) {
        muteButton.innerHTML = '<span class="mute-icon">🔊</span><span class="mute-text">Звуки</span>';
        if (!audioCtx) {
            initAudio();
            if(audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        } else if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        playBaaSound();
    } else {
        muteButton.innerHTML = '<span class="mute-icon">🔇</span><span class="mute-text">Звук выкл</span>';
    }
}

function initSite() {
    resetGame();
    
    resetButton.addEventListener('click', () => {
        resetGame();
        if (sheepState.audioEnabled) playBaaSound();
    });
    
    muteButton.addEventListener('click', toggleMute);
    
    document.body.addEventListener('click', function initAudioOnFirstClick() {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        document.body.removeEventListener('click', initAudioOnFirstClick);
    }, { once: true });
}

document.addEventListener('DOMContentLoaded', initSite);
