/* ========================================
   БАЖИК КОЛЛЕКЦИЯ - ГЛАВНЫЙ СКРИПТ
   Обновленная система улучшений с новыми ценами
   ======================================== */

const STORAGE_KEY = 'bazhikGameV5';
const MAX_LEVEL = 12;

// Новая система цен на улучшение
const UPGRADE_COSTS = {
    1: { duplicates: 2, currency: 10 },
    2: { duplicates: 4, currency: 25 },
    3: { duplicates: 10, currency: 100 },
    4: { duplicates: 15, currency: 250 },
    5: { duplicates: 20, currency: 425 },
    6: { duplicates: 25, currency: 750 },
    7: { duplicates: 30, currency: 1250 },
    8: { duplicates: 35, currency: 2000 },
    9: { duplicates: 40, currency: 3000 },
    10: { duplicates: 50, currency: 4000 },
    11: { duplicates: 75, currency: 5500 }
};

const DEFAULT_CHARACTERS = {
    default: {
        id: 'default',
        name: 'ОБЫЧНЫЙ БАЖИК',
        img: 'images/бажичек.png',
        baseBonus: 1,
        level: 1,
        duplicates: 0,
        canUpgrade: true,
        unlocked: true,
        isMaxLevel: false
    },
    glasses: {
        id: 'glasses',
        name: 'БАЖИК В ОЧКАХ',
        img: 'images/бажиквочках.png',
        baseBonus: 1,
        level: 1,
        duplicates: 0,
        canUpgrade: true,
        unlocked: false,
        isMaxLevel: false
    },
    mechanic: {
        id: 'mechanic',
        name: 'БАЖИК МЕХА',
        img: 'images/бажикмеха.png',
        baseBonus: 1,
        level: 1,
        duplicates: 0,
        canUpgrade: true,
        unlocked: false,
        isMaxLevel: false
    },
    poko: {
        id: 'poko',
        name: 'БАЖИК ПОКО',
        img: 'images/бажикпоко.png',
        baseBonus: 1,
        level: 1,
        duplicates: 0,
        canUpgrade: true,
        unlocked: false,
        isMaxLevel: false
    }
};

const DEFAULT_GAME_STATE = {
    currency: 0,
    totalClicks: 0,
    characters: JSON.parse(JSON.stringify(DEFAULT_CHARACTERS)),
    selectedCharacter: 'default'
};

// ---------- УПРАВЛЕНИЕ СОХРАНЕНИЕМ ----------
function loadGameData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            for (const [id, char] of Object.entries(DEFAULT_CHARACTERS)) {
                if (!loaded.characters[id]) {
                    loaded.characters[id] = JSON.parse(JSON.stringify(char));
                } else {
                    loaded.characters[id].isMaxLevel = loaded.characters[id].level >= MAX_LEVEL;
                }
            }
            if (!loaded.characters[loaded.selectedCharacter]) {
                loaded.selectedCharacter = 'default';
            }
            return loaded;
        } catch (e) {
            console.error('Ошибка загрузки:', e);
            return JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
        }
    }
    return JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
}

function saveGameData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(data) }));
}

function resetGameData() {
    const freshState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(freshState) }));
    return freshState;
}

// ---------- ПОЛУЧЕНИЕ СТОИМОСТИ УЛУЧШЕНИЯ ----------
function getUpgradeCost(character) {
    if (!character || character.level >= MAX_LEVEL) {
        return { duplicates: 0, currency: 0, isMax: true };
    }
    const cost = UPGRADE_COSTS[character.level];
    if (!cost) {
        return { duplicates: 0, currency: 0, isMax: true };
    }
    return {
        duplicates: cost.duplicates,
        currency: cost.currency,
        isMax: false,
        nextLevel: character.level + 1
    };
}

function getProgressToNextLevel(character) {
    if (character.level >= MAX_LEVEL) {
        return { current: 0, required: 0, percentage: 100 };
    }
    const cost = UPGRADE_COSTS[character.level];
    if (!cost) {
        return { current: 0, required: 0, percentage: 100 };
    }
    const current = Math.min(character.duplicates, cost.duplicates);
    return {
        current: current,
        required: cost.duplicates,
        percentage: (current / cost.duplicates) * 100
    };
}

// ---------- ПРОВЕРКА ВОЗМОЖНОСТИ УЛУЧШЕНИЯ ----------
function canUpgrade(character, currency) {
    if (!character || !character.canUpgrade || !character.unlocked) return false;
    if (character.isMaxLevel || character.level >= MAX_LEVEL) return false;
    const cost = UPGRADE_COSTS[character.level];
    if (!cost) return false;
    return character.duplicates >= cost.duplicates && currency >= cost.currency;
}

// ---------- УЛУЧШЕНИЕ ПЕРСОНАЖА ----------
function upgradeCharacterLogic(character, gameData) {
    if (character.isMaxLevel || character.level >= MAX_LEVEL) {
        showFloatingMessage(`${character.name} уже на МАКСИМАЛЬНОМ уровне (${MAX_LEVEL})!`, 'warning');
        return false;
    }
    
    const cost = UPGRADE_COSTS[character.level];
    if (!cost) {
        showFloatingMessage(`Достигнут максимальный уровень!`, 'warning');
        return false;
    }
    
    if (character.duplicates >= cost.duplicates && gameData.currency >= cost.currency) {
        character.duplicates -= cost.duplicates;
        gameData.currency -= cost.currency;
        character.level++;
        
        if (character.level >= MAX_LEVEL) {
            character.isMaxLevel = true;
            showFloatingMessage(`✨ ${character.name} достиг МАКСИМАЛЬНОГО уровня ${MAX_LEVEL}! ✨`, 'success');
        } else {
            const nextCost = UPGRADE_COSTS[character.level];
            showFloatingMessage(
                `${character.name} улучшен до ${character.level} уровня! +${character.baseBonus * character.level} за клик\n` +
                `Следующий уровень: ${nextCost.duplicates}📦 + ${nextCost.currency}💰`,
                'success'
            );
        }
        return true;
    } else {
        const needDup = cost.duplicates - character.duplicates;
        const needCurr = cost.currency - gameData.currency;
        
        if (needDup > 0 && needCurr > 0) {
            showFloatingMessage(`Нужно еще ${needDup} дубликатов и ${needCurr}💰`, 'warning');
        } else if (needDup > 0) {
            showFloatingMessage(`Нужно еще ${needDup} дубликатов!`, 'warning');
        } else {
            showFloatingMessage(`Нужно еще ${needCurr}💰!`, 'warning');
        }
        return false;
    }
}

// ---------- ВСПЛЫВАЮЩИЕ УВЕДОМЛЕНИЯ ----------
let toastTimeout = null;

function showFloatingMessage(message, type = 'info', duration = 2500) {
    const existingToast = document.querySelector('.floating-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `floating-message ${type}`;
    toast.innerHTML = message.replace(/\n/g, '<br>');
    document.body.appendChild(toast);
    
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ---------- ФОРМАТИРОВАНИЕ ----------
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// ---------- РАСЧЕТ БОНУСА ----------
function getClickBonus(character) {
    if (!character || !character.unlocked) return 1;
    return character.baseBonus * character.level;
}

// ---------- ПРОВЕРКА ВСЕХ ЛИ НА МАКС. УРОВНЕ ----------
function areAllMaxLevel(gameData) {
    let allUnlocked = true;
    for (const char of Object.values(gameData.characters)) {
        if (!char.unlocked) {
            allUnlocked = false;
            continue;
        }
        if (char.unlocked && char.level < MAX_LEVEL) {
            return false;
        }
    }
    return allUnlocked;
}

// ---------- ПОЛУЧЕНИЕ СЛУЧАЙНОГО ПЕРСОНАЖА ----------
function getRandomCharacterFromCase(gameData) {
    const availableChars = [];
    for (const [id, char] of Object.entries(gameData.characters)) {
        if (!char.unlocked || char.level < MAX_LEVEL) {
            availableChars.push(id);
        }
    }
    
    if (availableChars.length === 0) {
        return null;
    }
    
    const randomId = availableChars[Math.floor(Math.random() * availableChars.length)];
    return gameData.characters[randomId];
}

// ---------- ОТКРЫТИЕ КЕЙСА ----------
let isOpeningCase = false;
const CASE_PRICE = 150;

function openCaseWithAnimation(gameData, onComplete) {
    if (isOpeningCase) {
        showFloatingMessage('Подождите, кейс уже открывается!', 'warning');
        return false;
    }
    
    if (areAllMaxLevel(gameData)) {
        showFloatingMessage('🎉 Поздравляем! Все барашки достигли максимального уровня! Кейсы больше недоступны! 🎉', 'success');
        return false;
    }
    
    if (gameData.currency < CASE_PRICE) {
        showFloatingMessage(`Не хватает ${CASE_PRICE - gameData.currency}💰`, 'warning');
        return false;
    }
    
    gameData.currency -= CASE_PRICE;
    saveGameData(gameData);
    
    const reward = getRandomCharacterFromCase(gameData);
    if (!reward) {
        showFloatingMessage('Все барашки уже на максимальном уровне!', 'warning');
        gameData.currency += CASE_PRICE;
        saveGameData(gameData);
        return false;
    }
    
    showCaseOpenAnimation(reward, gameData, () => {
        reward.duplicates++;
        
        const wasLocked = !reward.unlocked;
        if (wasLocked) {
            reward.unlocked = true;
            showFloatingMessage(`🎉 ПОЗДРАВЛЯЕМ! Вы разблокировали ${reward.name}! 🎉`, 'success');
        } else if (reward.isMaxLevel || reward.level >= MAX_LEVEL) {
            showFloatingMessage(`📦 Дубликат ${reward.name}, но он уже на МАКСИМАЛЬНОМ уровне! Дубликат не засчитан. 📦`, 'info');
            reward.duplicates--;
            gameData.currency += CASE_PRICE;
        } else {
            const cost = UPGRADE_COSTS[reward.level];
            showFloatingMessage(`📦 Вы получили дубликат ${reward.name}! (${reward.duplicates}/${cost.duplicates} для улучшения)`, 'info');
        }
        
        saveGameData(gameData);
        if (onComplete) onComplete(reward);
    });
    
    return true;
}

// ---------- АНИМАЦИЯ ОТКРЫТИЯ ----------
function showCaseOpenAnimation(reward, gameData, onComplete) {
    isOpeningCase = true;
    
    const overlay = document.createElement('div');
    overlay.className = 'case-opening-overlay';
    overlay.innerHTML = `
        <div class="case-animation-container">
            <div class="case-animation-box">
                <div class="case-spinning">
                    <img src="images/баранокейс.png" class="spinning-case" alt="Кейс">
                </div>
                <div class="case-opening-progress">
                    <div class="progress-bar-animation"></div>
                </div>
                <div class="case-opening-text">ОТКРЫВАЕМ КЕЙС...</div>
            </div>
            <div class="case-result hidden">
                <div class="result-glow"></div>
                <div class="result-character">
                    <img src="${reward.img}" class="result-img" alt="${reward.name}">
                </div>
                <div class="result-name">${reward.name}</div>
                <div class="result-bonus">+${reward.baseBonus * reward.level} за клик</div>
                <div class="result-dupes">Дубликатов: ${reward.duplicates + 1}</div>
                <button class="result-close-btn">ЗАБРАТЬ</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    const spinningCase = overlay.querySelector('.spinning-case');
    const progressBar = overlay.querySelector('.progress-bar-animation');
    const caseBox = overlay.querySelector('.case-animation-box');
    const resultDiv = overlay.querySelector('.case-result');
    
    spinningCase.style.animation = 'spin3d 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 2;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(progressInterval);
            caseBox.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                caseBox.classList.add('hidden');
                resultDiv.classList.remove('hidden');
                resultDiv.style.animation = 'resultPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                
                const closeBtn = overlay.querySelector('.result-close-btn');
                closeBtn.addEventListener('click', () => {
                    overlay.style.animation = 'fadeOut 0.3s forwards';
                    setTimeout(() => {
                        overlay.remove();
                        isOpeningCase = false;
                        if (onComplete) onComplete();
                    }, 300);
                });
            }, 300);
        }
    }, 20);
}

// ---------- ВЫБОР ПЕРСОНАЖА ----------
function selectCharacterLogic(gameData, characterId) {
    const character = gameData.characters[characterId];
    if (!character) return false;
    
    if (!character.unlocked) {
        showFloatingMessage(`${character.name} еще не разблокирован! Выбейте его из кейса!`, 'warning');
        return false;
    }
    
    gameData.selectedCharacter = characterId;
    saveGameData(gameData);
    showFloatingMessage(`Выбран ${character.name}! +${getClickBonus(character)} за клик`, 'info');
    return true;
}

// ---------- АНИМАЦИИ ----------
function animateClick(element) {
    if (!element) return;
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        if (element) element.style.transform = '';
    }, 100);
}

function showFloatingNumber(value, x, y, isBonus = true) {
    const div = document.createElement('div');
    div.textContent = isBonus ? `+${value}` : `-${value}`;
    div.style.position = 'fixed';
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.fontSize = isBonus ? '2rem' : '1.5rem';
    div.style.fontWeight = '800';
    div.style.color = isBonus ? '#ffd966' : '#ffaa66';
    div.style.textShadow = '0 0 10px rgba(0,0,0,0.5)';
    div.style.pointerEvents = 'none';
    div.style.zIndex = '1000';
    div.style.fontFamily = 'inherit';
    div.style.animation = 'floatUpNumber 0.8s forwards';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 800);
}

function updateCurrencyDisplay(currency) {
    const elements = document.querySelectorAll('.currency-display, .currency-amount, #currencyAmount, #currencyDisplay');
    elements.forEach(el => {
        if (el) el.innerText = formatNumber(currency);
    });
}

function initParticles(containerId = 'particles') {
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'particles';
        document.body.appendChild(container);
    }
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = Math.random() * 10 + 8 + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.background = `rgba(255, 215, 0, ${Math.random() * 0.3 + 0.1})`;
        particle.style.position = 'absolute';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        container.appendChild(particle);
    }
}

// ---------- СТИЛИ ----------
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes spin3d {
        0% { transform: rotateY(0deg) rotateX(0deg) scale(1); }
        50% { transform: rotateY(360deg) rotateX(180deg) scale(1.1); }
        100% { transform: rotateY(720deg) rotateX(360deg) scale(1); }
    }
    @keyframes fadeOut {
        to { opacity: 0; transform: scale(0.9); visibility: hidden; }
    }
    @keyframes resultPop {
        0% { transform: scale(0); opacity: 0; }
        80% { transform: scale(1.05); }
        100% { transform: scale(1); opacity: 1; }
    }
    @keyframes floatUpNumber {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(0.6); }
        100% { opacity: 0; transform: translate(-50%, -150%) scale(1.2); }
    }
    .floating-message {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(30, 40, 50, 0.95);
        backdrop-filter: blur(10px);
        color: #ffd966;
        padding: 12px 24px;
        border-radius: 60px;
        font-weight: 600;
        font-size: 0.9rem;
        z-index: 3000;
        border: 1px solid #ffd966;
        animation: fadeInUp 0.3s ease;
        transition: opacity 0.3s, transform 0.3s;
        font-family: inherit;
        text-align: center;
        max-width: 80vw;
        white-space: nowrap;
    }
    .floating-message.success {
        background: rgba(107, 184, 107, 0.95);
        color: white;
        border-color: #6bb86b;
    }
    .floating-message.warning {
        background: rgba(255, 170, 51, 0.95);
        color: #1a1a2e;
        border-color: #ffaa33;
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .case-opening-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s;
    }
    .case-animation-container {
        text-align: center;
        max-width: 500px;
        width: 90%;
    }
    .case-animation-box {
        background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
        border-radius: 40px;
        padding: 40px;
        border: 2px solid #ffd966;
        transition: all 0.3s;
    }
    .spinning-case {
        width: 180px;
        height: 180px;
        object-fit: contain;
        filter: drop-shadow(0 0 20px #ffaa33);
    }
    .case-opening-progress {
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
        overflow: hidden;
        margin: 20px 0;
    }
    .progress-bar-animation {
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #ffaa33, #ffd966);
        transition: width 0.02s linear;
    }
    .case-opening-text {
        color: #ffd966;
        font-size: 1rem;
        letter-spacing: 2px;
        animation: pulse 1s infinite;
    }
    .case-result {
        background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
        border-radius: 40px;
        padding: 30px;
        text-align: center;
        border: 3px solid #ffd966;
        position: relative;
    }
    .result-glow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255,215,0,0.2), transparent);
        border-radius: 40px;
        pointer-events: none;
    }
    .result-img {
        width: 150px;
        height: 150px;
        object-fit: contain;
        animation: bounce 0.5s ease;
    }
    .result-name {
        font-size: 1.5rem;
        font-weight: 800;
        color: #ffd966;
        margin-bottom: 10px;
    }
    .result-bonus {
        color: #6bb86b;
        font-size: 1rem;
        margin-bottom: 8px;
    }
    .result-dupes {
        color: rgba(255,255,255,0.7);
        font-size: 0.9rem;
        margin-bottom: 20px;
    }
    .result-close-btn {
        background: linear-gradient(135deg, #ffaa33, #ff8800);
        border: none;
        padding: 12px 30px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        font-family: inherit;
        transition: transform 0.1s;
    }
    .result-close-btn:active {
        transform: scale(0.96);
    }
    .hidden {
        display: none !important;
    }
    .particles {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
    }
    .particle {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        animation: floatParticle linear infinite;
    }
    @keyframes floatParticle {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 0.5; }
        90% { opacity: 0.5; }
        100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }
`;
document.head.appendChild(animationStyles);

window.BazhikGame = {
    STORAGE_KEY,
    DEFAULT_CHARACTERS,
    DEFAULT_GAME_STATE,
    MAX_LEVEL,
    CASE_PRICE,
    UPGRADE_COSTS,
    
    loadGameData,
    saveGameData,
    resetGameData,
    
    showFloatingMessage,
    formatNumber,
    updateCurrencyDisplay,
    animateClick,
    showFloatingNumber,
    initParticles,
    
    getClickBonus,
    canUpgrade,
    getUpgradeCost,
    getProgressToNextLevel,
    upgradeCharacterLogic,
    getRandomCharacterFromCase,
    openCaseWithAnimation,
    selectCharacterLogic,
    areAllMaxLevel
};

console.log('🐏 Бажик: Главный скрипт загружен! Новая система улучшений!');