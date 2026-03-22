// Бажик Коллекция - с полноэкранными окнами и CS:GO анимацией прокрутки!

const CHARACTERS = {
    'default': {
        id: 'default',
        name: 'ОБЫЧНЫЙ БАЖИК',
        img: 'бажичек.png',
        baseBonus: 1,
        level: 1,
        duplicates: 0,
        canUpgrade: true
    },
    'glasses': {
        id: 'glasses',
        name: 'БАЖИК В ОЧКАХ',
        img: 'бажиквочках.png',
        baseBonus: 1,
        level: 1,
        duplicates: 0,
        canUpgrade: true
    },
    'mechanic': {
        id: 'mechanic',
        name: 'БАЖИК МЕХА',
        img: 'бажикмеха.png',
        baseBonus: 1,
        level: 1,
        duplicates: 0,
        canUpgrade: true
    },
    'poko': {
        id: 'poko',
        name: 'БАЖИК ПОКО',
        img: 'бажикпоко.png',
        baseBonus: 1,
        level: 1,
        duplicates: 0,
        canUpgrade: true
    }
};

let gameState = {
    currency: 0,
    totalClicks: 0,
    characters: JSON.parse(JSON.stringify(CHARACTERS)),
    selectedCharacter: 'default'
};

let rollAnimation = null;
let rollInterval = null;

function loadGame() {
    const saved = localStorage.getItem('bazhikGame');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            gameState = loaded;
            if (!gameState.characters.default) {
                gameState.characters.default = JSON.parse(JSON.stringify(CHARACTERS.default));
            }
            if (!gameState.selectedCharacter) gameState.selectedCharacter = 'default';
        } catch(e) {}
    }
    updateUI();
}

function saveGame() {
    localStorage.setItem('bazhikGame', JSON.stringify(gameState));
}

function getClickBonus() {
    const char = gameState.characters[gameState.selectedCharacter];
    if (!char) return 1;
    return char.baseBonus * char.level;
}

function handleClick() {
    const bonus = getClickBonus();
    gameState.currency += bonus;
    gameState.totalClicks++;
    
    updateUI();
    saveGame();
    
    const sheep = document.getElementById('clickableSheep');
    const effect = sheep.querySelector('.click-effect');
    effect.classList.add('active');
    setTimeout(() => effect.classList.remove('active'), 400);
    
    showFloatingBonus(bonus);
}

function showFloatingBonus(bonus) {
    const bonusDiv = document.createElement('div');
    bonusDiv.textContent = `+${bonus}`;
    bonusDiv.style.position = 'fixed';
    bonusDiv.style.left = '50%';
    bonusDiv.style.top = '45%';
    bonusDiv.style.transform = 'translate(-50%, -50%)';
    bonusDiv.style.fontSize = '2.5rem';
    bonusDiv.style.fontWeight = 'bold';
    bonusDiv.style.color = '#ffd966';
    bonusDiv.style.textShadow = '2px 2px 0 #e55c2c';
    bonusDiv.style.pointerEvents = 'none';
    bonusDiv.style.zIndex = '1000';
    bonusDiv.style.animation = 'floatUp 0.8s forwards';
    document.body.appendChild(bonusDiv);
    setTimeout(() => bonusDiv.remove(), 800);
}

function getCasePrice() {
    return 10;
}

// Одинаковый шанс для всех барашков (25% каждый)
function getRandomCharacterFromCase() {
    const chars = ['default', 'glasses', 'mechanic', 'poko'];
    const random = Math.floor(Math.random() * chars.length);
    return chars[random];
}

// CS:GO стиль - анимация прокрутки скинов
function startCSGORoll() {
    const casePrice = getCasePrice();
    if (gameState.currency < casePrice) {
        showMessage(`Не хватает ${casePrice - gameState.currency} Бажичков!`, 'warning');
        return;
    }
    
    gameState.currency -= casePrice;
    saveGame();
    updateUI();
    
    // Определяем выигрыш
    const rewardId = getRandomCharacterFromCase();
    const reward = gameState.characters[rewardId];
    
    // Создаем массив скинов для прокрутки (30+ элементов для реалистичности)
    const allSkinIds = ['default', 'glasses', 'mechanic', 'poko'];
    const rollItems = [];
    // Создаем длинную последовательность для прокрутки
    for (let i = 0; i < 40; i++) {
        const randomId = allSkinIds[Math.floor(Math.random() * allSkinIds.length)];
        rollItems.push(gameState.characters[randomId]);
    }
    // Добавляем выигрыш в конец
    rollItems.push(reward);
    // Добавляем еще немного после выигрыша для плавной остановки
    for (let i = 0; i < 15; i++) {
        rollItems.push(reward);
    }
    
    showCSGORollAnimation(rollItems, reward);
}

function showCSGORollAnimation(rollItems, reward) {
    const overlay = document.getElementById('csgoRollAnimation');
    const roller = document.getElementById('skinRoller');
    const resultDiv = document.getElementById('rollResult');
    const progressFill = document.getElementById('rollProgressFill');
    
    // Очищаем и заполняем роллер
    roller.innerHTML = '';
    rollItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'roll-skin-item';
        itemDiv.innerHTML = `
            <img src="${item.img}" class="roll-skin-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%238bc34a\'/%3E%3Ctext x=\'50\' y=\'67\' text-anchor=\'middle\' fill=\'white\' font-size=\'40\'%3E🐏%3C/text%3E%3C/svg%3E';">
            <div class="roll-skin-name">${item.name}</div>
        `;
        roller.appendChild(itemDiv);
    });
    
    // Позиционирование
    const itemWidth = 170; // ширина элемента + gap
    const totalWidth = rollItems.length * itemWidth;
    const centerOffset = (window.innerWidth / 2) - 85;
    let currentPosition = 0;
    let startTime = Date.now();
    const duration = 2500; // 2.5 секунды прокрутки
    
    overlay.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    
    // Анимация прогресс-бара
    progressFill.style.width = '0%';
    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percent = Math.min(100, (elapsed / duration) * 100);
        progressFill.style.width = percent + '%';
        if (percent >= 100) clearInterval(progressInterval);
    }, 16);
    
    // Прокрутка
    const startPosition = 0;
    const endPosition = totalWidth - (window.innerWidth / 2);
    
    function animateRoll() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - t, 3);
        currentPosition = startPosition + (endPosition * easeOut);
        roller.style.left = `-${currentPosition}px`;
        
        if (t < 1) {
            requestAnimationFrame(animateRoll);
        } else {
            // Завершение анимации
            clearInterval(progressInterval);
            setTimeout(() => {
                showRollResult(reward);
            }, 200);
        }
    }
    
    requestAnimationFrame(animateRoll);
}

function showRollResult(reward) {
    const resultDiv = document.getElementById('rollResult');
    const resultImage = document.getElementById('resultImage');
    const resultName = document.getElementById('resultName');
    const resultStats = document.getElementById('resultStats');
    
    resultImage.innerHTML = `<img src="${reward.img}" alt="${reward.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%238bc34a\'/%3E%3Ctext x=\'50\' y=\'67\' text-anchor=\'middle\' fill=\'white\' font-size=\'40\'%3E🐏%3C/text%3E%3C/svg%3E';">`;
    resultName.textContent = reward.name;
    resultStats.innerHTML = `Дубликатов: ${reward.duplicates + 1} | Уровень: ${reward.level}`;
    
    resultDiv.classList.remove('hidden');
}

function claimRollReward() {
    // Получаем выигрыш (нужно сохранить его в момент открытия)
    // В нашей реализации выигрыш уже определен в startCSGORoll
    // Но нам нужно добавить дубликат
    // Переделаем: при открытии кейса мы уже знаем reward
    // Сейчас просто закроем анимацию
    closeCSGORoll();
}

function closeCSGORoll() {
    const overlay = document.getElementById('csgoRollAnimation');
    overlay.classList.add('hidden');
    
    // Обновляем UI после получения награды
    updateUI();
}

// Альтернативный способ - вызываем из openCaseWithRoll
let pendingReward = null;

function openCaseWithRoll() {
    const casePrice = getCasePrice();
    if (gameState.currency < casePrice) {
        showMessage(`Не хватает ${casePrice - gameState.currency} Бажичков!`, 'warning');
        return;
    }
    
    gameState.currency -= casePrice;
    saveGame();
    updateUI();
    
    const rewardId = getRandomCharacterFromCase();
    const reward = gameState.characters[rewardId];
    pendingReward = reward;
    
    startCSGORollWithReward(reward);
}

function startCSGORollWithReward(reward) {
    const allSkinIds = ['default', 'glasses', 'mechanic', 'poko'];
    const rollItems = [];
    for (let i = 0; i < 45; i++) {
        const randomId = allSkinIds[Math.floor(Math.random() * allSkinIds.length)];
        rollItems.push(gameState.characters[randomId]);
    }
    rollItems.push(reward);
    for (let i = 0; i < 20; i++) {
        rollItems.push(reward);
    }
    
    const overlay = document.getElementById('csgoRollAnimation');
    const roller = document.getElementById('skinRoller');
    const resultDiv = document.getElementById('rollResult');
    const progressFill = document.getElementById('rollProgressFill');
    
    roller.innerHTML = '';
    rollItems.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'roll-skin-item';
        itemDiv.innerHTML = `
            <img src="${item.img}" class="roll-skin-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%238bc34a\'/%3E%3Ctext x=\'50\' y=\'67\' text-anchor=\'middle\' fill=\'white\' font-size=\'40\'%3E🐏%3C/text%3E%3C/svg%3E';">
            <div class="roll-skin-name">${item.name}</div>
        `;
        roller.appendChild(itemDiv);
    });
    
    const itemWidth = 170;
    const totalWidth = rollItems.length * itemWidth;
    let currentPosition = 0;
    let startTime = Date.now();
    const duration = 2800;
    
    overlay.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    
    progressFill.style.width = '0%';
    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percent = Math.min(100, (elapsed / duration) * 100);
        progressFill.style.width = percent + '%';
        if (percent >= 100) clearInterval(progressInterval);
    }, 16);
    
    const endPosition = totalWidth - (window.innerWidth / 2);
    
    function animateRoll() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - t, 3);
        currentPosition = endPosition * easeOut;
        roller.style.left = `-${currentPosition}px`;
        
        if (t < 1) {
            requestAnimationFrame(animateRoll);
        } else {
            clearInterval(progressInterval);
            setTimeout(() => {
                // Добавляем дубликат
                reward.duplicates++;
                saveGame();
                updateUI();
                showRollResultFinal(reward);
            }, 200);
        }
    }
    
    requestAnimationFrame(animateRoll);
}

function showRollResultFinal(reward) {
    const resultDiv = document.getElementById('rollResult');
    const resultImage = document.getElementById('resultImage');
    const resultName = document.getElementById('resultName');
    const resultStats = document.getElementById('resultStats');
    
    resultImage.innerHTML = `<img src="${reward.img}" alt="${reward.name}">`;
    resultName.textContent = reward.name;
    resultStats.innerHTML = `Дубликатов: ${reward.duplicates} | Уровень: ${reward.level}`;
    
    resultDiv.classList.remove('hidden');
    
    const claimBtn = document.getElementById('resultClaimBtn');
    claimBtn.onclick = () => {
        document.getElementById('csgoRollAnimation').classList.add('hidden');
        updateUI();
    };
}

function upgradeCharacter(characterId) {
    const char = gameState.characters[characterId];
    if (!char || !char.canUpgrade) return;
    
    const requiredDuplicates = char.level;
    const requiredCurrency = char.level * 2;
    
    if (char.duplicates >= requiredDuplicates && gameState.currency >= requiredCurrency) {
        char.duplicates -= requiredDuplicates;
        gameState.currency -= requiredCurrency;
        char.level++;
        
        saveGame();
        updateUI();
        showMessage(`${char.name} улучшен до ${char.level} уровня!`, 'success');
    } else {
        let needDup = requiredDuplicates - char.duplicates;
        let needCurr = requiredCurrency - gameState.currency;
        if (needDup > 0 && needCurr > 0) {
            showMessage(`Нужно еще ${needDup} дубликатов и ${needCurr} Бажичков!`, 'warning');
        } else if (needDup > 0) {
            showMessage(`Нужно еще ${needDup} дубликатов!`, 'warning');
        } else {
            showMessage(`Нужно еще ${needCurr} Бажичков!`, 'warning');
        }
    }
}

function selectCharacter(characterId) {
    gameState.selectedCharacter = characterId;
    updateUI();
    saveGame();
    
    const mainImage = document.getElementById('mainSheepImage');
    const selectedChar = gameState.characters[characterId];
    if (selectedChar && selectedChar.img) {
        mainImage.src = selectedChar.img;
    }
    
    showMessage(`Выбран ${gameState.characters[characterId].name}!`, 'info');
}

function updateUI() {
    document.getElementById('currencyAmount').innerText = gameState.currency;
    document.getElementById('totalClicks').innerText = gameState.totalClicks;
    document.getElementById('clickBonus').innerText = getClickBonus();
    if (document.getElementById('casePriceFull')) {
        document.getElementById('casePriceFull').innerText = getCasePrice();
    }
    
    const selectedChar = gameState.characters[gameState.selectedCharacter];
    document.getElementById('activeBrawlerName').innerHTML = `🐏 ${selectedChar.name} ур.${selectedChar.level}`;
    document.getElementById('activeBrawlerBonus').innerHTML = `+${getClickBonus()} за клик`;
    
    updateBrawlersWindow();
}

function updateBrawlersWindow() {
    const grid = document.getElementById('brawlersGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    for (const [id, char] of Object.entries(gameState.characters)) {
        const card = document.createElement('div');
        card.className = `brawler-card-full ${gameState.selectedCharacter === id ? 'selected' : ''}`;
        card.onclick = () => selectCharacter(id);
        
        const upgradeCost = char.level * 2;
        
        card.innerHTML = `
            <img src="${char.img}" alt="${char.name}" class="brawler-img-full" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%238bc34a\'/%3E%3Ctext x=\'50\' y=\'67\' text-anchor=\'middle\' fill=\'white\' font-size=\'40\'%3E🐏%3C/text%3E%3C/svg%3E';">
            <div class="brawler-name-full">${char.name}</div>
            <div class="brawler-level-full">УРОВЕНЬ ${char.level}</div>
            <div class="brawler-bonus-full">+${char.baseBonus * char.level} ЗА КЛИК</div>
            <div class="brawler-dupes-full">📦 ДУБЛИКАТОВ: ${char.duplicates}</div>
            <button class="upgrade-btn-full" onclick="event.stopPropagation(); upgradeCharacter('${id}')">
                🔧 УЛУЧШИТЬ (${char.level}📦 + ${upgradeCost}💰)
            </button>
        `;
        grid.appendChild(card);
    }
}

function openWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (windowEl) {
        windowEl.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (windowEl) {
        windowEl.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function showMessage(text, type) {
    let msgDiv = document.getElementById('tempMessage');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'tempMessage';
        msgDiv.style.position = 'fixed';
        msgDiv.style.bottom = '20px';
        msgDiv.style.left = '50%';
        msgDiv.style.transform = 'translateX(-50%)';
        msgDiv.style.padding = '12px 24px';
        msgDiv.style.borderRadius = '50px';
        msgDiv.style.fontWeight = 'bold';
        msgDiv.style.zIndex = '1000';
        msgDiv.style.textAlign = 'center';
        msgDiv.style.whiteSpace = 'nowrap';
        document.body.appendChild(msgDiv);
    }
    
    if (type === 'warning') {
        msgDiv.style.background = '#ffaa33';
        msgDiv.style.color = '#5c3e1f';
    } else if (type === 'success') {
        msgDiv.style.background = '#6bb86b';
        msgDiv.style.color = 'white';
    } else {
        msgDiv.style.background = '#2d2d2d';
        msgDiv.style.color = '#ffd966';
    }
    
    msgDiv.textContent = text;
    msgDiv.style.display = 'block';
    
    if (window.messageTimeout) clearTimeout(window.messageTimeout);
    window.messageTimeout = setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 2000);
}

function resetGame() {
    gameState = {
        currency: 0,
        totalClicks: 0,
        characters: JSON.parse(JSON.stringify(CHARACTERS)),
        selectedCharacter: 'default'
    };
    saveGame();
    updateUI();
    closeResetModal();
    showMessage('Прогресс сброшен!', 'success');
    
    const mainImage = document.getElementById('mainSheepImage');
    mainImage.src = 'бажичек.png';
}

function showResetModal() {
    document.getElementById('resetModal').classList.add('active');
}
function closeResetModal() {
    document.getElementById('resetModal').classList.remove('active');
}

function init() {
    loadGame();
    
    document.getElementById('clickableSheep').addEventListener('click', handleClick);
    document.getElementById('resetGameBtn').addEventListener('click', showResetModal);
    document.getElementById('confirmResetBtn').addEventListener('click', resetGame);
    document.getElementById('cancelResetBtn').addEventListener('click', closeResetModal);
    
    document.getElementById('openBrawlersBtn').addEventListener('click', () => openWindow('brawlersWindow'));
    document.getElementById('openCasesBtn').addEventListener('click', () => openWindow('casesWindow'));
    
    const openCaseFullBtn = document.getElementById('openCaseFullBtn');
    if (openCaseFullBtn) {
        openCaseFullBtn.addEventListener('click', () => openCaseWithRoll());
    }
    
    document.querySelectorAll('.close-window-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const windowId = btn.getAttribute('data-window');
            if (windowId) closeWindow(windowId);
        });
    });
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(0.8); }
            100% { opacity: 0; transform: translate(-50%, -150%) scale(1.3); }
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', init);
