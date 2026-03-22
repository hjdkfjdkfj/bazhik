/* ========================================
   БАЖИК КОЛЛЕКЦИЯ - ОСНОВНАЯ ИГРА
   Синхронизированная версия
   ======================================== */

let gameData = null;

function loadData() {
    gameData = BazhikGame.loadGameData();
    console.log('game: загружены данные, монет:', gameData.currency);
    updateUI();
}

function saveData() {
    BazhikGame.saveGameData(gameData);
}

function getCurrentBonus() {
    const char = gameData.characters[gameData.selectedCharacter];
    if (!char || !char.unlocked) return 1;
    return char.baseBonus * char.level;
}

function updateUI() {
    // Обновляем валюту
    const currencyEl = document.getElementById('currencyAmount');
    if (currencyEl) currencyEl.innerText = BazhikGame.formatNumber(gameData.currency);
    
    // Обновляем общее количество кликов
    const totalClicksEl = document.getElementById('totalClicks');
    if (totalClicksEl) totalClicksEl.innerText = BazhikGame.formatNumber(gameData.totalClicks);
    
    // Обновляем бонус за клик
    const bonus = getCurrentBonus();
    const clickBonusEl = document.getElementById('clickBonus');
    if (clickBonusEl) clickBonusEl.innerText = bonus;
    
    // Обновляем информацию о выбранном персонаже
    const selectedChar = gameData.characters[gameData.selectedCharacter];
    const activeNameEl = document.getElementById('activeBrawlerName');
    const activeBonusEl = document.getElementById('activeBrawlerBonus');
    
    if (activeNameEl) {
        const maxStatus = (selectedChar.isMaxLevel || selectedChar.level >= BazhikGame.MAX_LEVEL) ? ' MAX' : ` ур.${selectedChar.level}`;
        activeNameEl.innerHTML = `🐏 ${selectedChar.name}${maxStatus}`;
    }
    if (activeBonusEl) {
        activeBonusEl.innerHTML = `+${bonus} за клик`;
    }
    
    // Обновляем изображение главного Бажика
    const mainImage = document.getElementById('mainSheepImage');
    if (mainImage && selectedChar.img) {
        mainImage.src = selectedChar.img;
        mainImage.onerror = function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 200\'%3E%3Ccircle cx=\'100\' cy=\'100\' r=\'90\' fill=\'%238bc34a\'/%3E%3Ctext x=\'100\' y=\'130\' text-anchor=\'middle\' fill=\'white\' font-size=\'80\'%3E🐏%3C/text%3E%3C/svg%3E';
        };
    }
}

function handleClick() {
    const bonus = getCurrentBonus();
    gameData.currency += bonus;
    gameData.totalClicks++;
    
    updateUI();
    saveData();
    
    // Анимация клика
    const sheep = document.getElementById('clickableSheep');
    if (sheep) {
        sheep.style.transform = 'scale(0.95)';
        setTimeout(() => {
            if (sheep) sheep.style.transform = '';
        }, 100);
        
        const ripple = sheep.querySelector('.click-ripple');
        if (ripple) {
            ripple.classList.add('active');
            setTimeout(() => ripple.classList.remove('active'), 400);
        }
    }
    
    // Показываем парящее число
    const rect = sheep ? sheep.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    BazhikGame.showFloatingNumber(bonus, rect.left + rect.width / 2, rect.top + rect.height / 2, true);
    
    // Вибрация для мобильных
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(30);
    }
}

function resetGame() {
    BazhikGame.showFloatingMessage('Вы уверены, что хотите сбросить прогресс?', 'warning');
    
    const confirmDiv = document.createElement('div');
    confirmDiv.className = 'reset-confirm-overlay';
    confirmDiv.innerHTML = `
        <div class="reset-confirm-box">
            <div class="reset-confirm-title">⚠️ СБРОС ПРОГРЕССА ⚠️</div>
            <div class="reset-confirm-text">Все барашки, уровни и монеты будут удалены без возможности восстановления!</div>
            <div class="reset-confirm-buttons">
                <button class="reset-confirm-yes">✅ ДА, СБРОСИТЬ</button>
                <button class="reset-confirm-no">❌ ОТМЕНА</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmDiv);
    
    confirmDiv.querySelector('.reset-confirm-yes').onclick = () => {
        gameData = BazhikGame.resetGameData();
        updateUI();
        BazhikGame.showFloatingMessage('Прогресс успешно сброшен!', 'success');
        confirmDiv.remove();
    };
    
    confirmDiv.querySelector('.reset-confirm-no').onclick = () => {
        confirmDiv.remove();
    };
}

function openBrawlersWindow() {
    window.location.href = 'brawlers.html';
}

function openCasesWindow() {
    window.location.href = 'cases.html';
}

// Стили для окна подтверждения
const confirmStyles = document.createElement('style');
confirmStyles.textContent = `
    .reset-confirm-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 4000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s;
    }
    .reset-confirm-box {
        background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
        border-radius: 40px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        border: 2px solid #ffd966;
        animation: popIn 0.3s;
    }
    .reset-confirm-title {
        font-size: 1.3rem;
        font-weight: 800;
        color: #ffaa66;
        margin-bottom: 15px;
    }
    .reset-confirm-text {
        color: rgba(255,255,255,0.7);
        margin-bottom: 25px;
        line-height: 1.5;
    }
    .reset-confirm-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
    }
    .reset-confirm-yes {
        background: linear-gradient(135deg, #e55c2c, #c4451a);
        border: none;
        padding: 10px 20px;
        border-radius: 40px;
        color: white;
        font-weight: 600;
        cursor: pointer;
    }
    .reset-confirm-no {
        background: rgba(100,100,100,0.3);
        border: 1px solid rgba(255,255,255,0.3);
        padding: 10px 20px;
        border-radius: 40px;
        color: white;
        cursor: pointer;
    }
    @keyframes popIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(confirmStyles);

// Слушаем изменения в localStorage
window.addEventListener('storage', (e) => {
    if (e.key === BazhikGame.STORAGE_KEY) {
        console.log('game: получено событие обновления данных');
        gameData = BazhikGame.loadGameData();
        updateUI();
    }
});

// Обновляем каждую секунду
setInterval(() => {
    const freshData = BazhikGame.loadGameData();
    if (JSON.stringify(freshData) !== JSON.stringify(gameData)) {
        console.log('game: синхронизация данных');
        gameData = freshData;
        updateUI();
    }
}, 1000);

document.addEventListener('DOMContentLoaded', () => {
    console.log('game: страница загружена');
    loadData();
    BazhikGame.initParticles('particles');
    
    const clickableSheep = document.getElementById('clickableSheep');
    if (clickableSheep) clickableSheep.addEventListener('click', handleClick);
    
    const resetBtn = document.getElementById('resetGameBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetGame);
    
    const brawlersBtn = document.getElementById('openBrawlersBtn');
    if (brawlersBtn) brawlersBtn.addEventListener('click', openBrawlersWindow);
    
    const casesBtn = document.getElementById('openCasesBtn');
    if (casesBtn) casesBtn.addEventListener('click', openCasesWindow);
});