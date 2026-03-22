/* ========================================
   БАЖИК КОЛЛЕКЦИЯ - МОИ БАРАНЧИКИ
   Полностью синхронизированная версия
   ======================================== */

let gameData = null;

function loadData() {
    gameData = BazhikGame.loadGameData();
    console.log('brawlers: загружены данные', gameData);
    updateDisplay();
    renderBrawlers();
}

function updateDisplay() {
    const currencyEl = document.getElementById('currencyDisplay');
    if (currencyEl) {
        currencyEl.innerText = BazhikGame.formatNumber(gameData.currency);
    }
}

function renderBrawlers() {
    const grid = document.getElementById('brawlersGrid');
    if (!grid) {
        console.error('brawlersGrid не найден!');
        return;
    }
    
    grid.innerHTML = '';
    
    const charactersOrder = ['default', 'glasses', 'mechanic', 'poko'];
    const characterNames = {
        default: 'ОБЫЧНЫЙ БАЖИК',
        glasses: 'БАЖИК В ОЧКАХ',
        mechanic: 'БАЖИК МЕХА',
        poko: 'БАЖИК ПОКО'
    };
    
    for (const id of charactersOrder) {
        const char = gameData.characters[id];
        if (!char) continue;
        
        const card = document.createElement('div');
        card.className = `brawler-card ${gameData.selectedCharacter === id ? 'selected' : ''} ${!char.unlocked ? 'locked' : ''}`;
        card.onclick = () => selectCharacter(id);
        
        const isMaxLevel = char.isMaxLevel || char.level >= BazhikGame.MAX_LEVEL;
        const cost = BazhikGame.getUpgradeCost(char);
        const progress = BazhikGame.getProgressToNextLevel(char);
        const bonusPerClick = char.baseBonus * char.level;
        
        if (char.unlocked) {
            card.innerHTML = `
                <div class="brawler-image-wrapper">
                    <img src="${char.img}" class="brawler-img" alt="${characterNames[id]}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%238bc34a\'/%3E%3Ctext x=\'50\' y=\'67\' text-anchor=\'middle\' fill=\'white\' font-size=\'40\'%3E🐏%3C/text%3E%3C/svg%3E';">
                    ${isMaxLevel ? '<div class="max-level-badge">✨ MAX ✨</div>' : ''}
                </div>
                <div class="brawler-name">${characterNames[id]}</div>
                <div class="brawler-level ${isMaxLevel ? 'max-level-text' : ''}">
                    ${isMaxLevel ? 'МАКСИМАЛЬНЫЙ УРОВЕНЬ' : `УРОВЕНЬ ${char.level} / ${BazhikGame.MAX_LEVEL}`}
                </div>
                <div class="brawler-bonus">+${bonusPerClick} ЗА КЛИК</div>
                
                ${!isMaxLevel ? `
                    <div class="progress-container">
                        <div class="progress-label">
                            <span>📦 Прогресс улучшения</span>
                            <span>${progress.current}/${progress.required}</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${progress.percentage}%"></div>
                        </div>
                        <div class="upgrade-cost-info">
                            <div class="cost-item">
                                <span>📦 Нужно дубликатов:</span>
                                <span class="cost-value">${cost.duplicates}</span>
                            </div>
                            <div class="cost-item">
                                <span>💰 Нужно Бажичков:</span>
                                <span class="cost-value">${cost.currency}</span>
                            </div>
                            <div class="cost-item">
                                <span>➡️ Следующий уровень:</span>
                                <span class="cost-value">${cost.nextLevel || 'MAX'}</span>
                            </div>
                        </div>
                        <button class="upgrade-btn" onclick="event.stopPropagation(); upgradeCharacter('${id}')">
                            🔧 УЛУЧШИТЬ
                        </button>
                    </div>
                ` : `
                    <div class="brawler-max-achieved">🏆 ДОСТИГНУТ МАКСИМУМ 🏆</div>
                    <div class="final-bonus">✨ +${bonusPerClick} за клик ✨</div>
                `}
            `;
        } else {
            card.innerHTML = `
                <div class="brawler-image-wrapper locked">
                    <img src="${char.img}" class="brawler-img locked-img" alt="${characterNames[id]}">
                    <div class="lock-overlay">🔒</div>
                </div>
                <div class="brawler-name">${characterNames[id]}</div>
                <div class="brawler-level locked-text">🔒 ЗАБЛОКИРОВАН</div>
                <div class="brawler-bonus">???</div>
                <div class="unlock-hint">🎁 Выбейте из кейса! (${BazhikGame.CASE_PRICE}💰)</div>
            `;
        }
        grid.appendChild(card);
    }
}

function selectCharacter(id) {
    if (BazhikGame.selectCharacterLogic(gameData, id)) {
        gameData = BazhikGame.loadGameData();
        renderBrawlers();
        updateDisplay();
        
        const selectedCard = document.querySelector('.brawler-card.selected');
        if (selectedCard) {
            selectedCard.style.animation = 'selectPulse 0.3s ease';
            setTimeout(() => {
                if (selectedCard) selectedCard.style.animation = '';
            }, 300);
        }
    }
}

function upgradeCharacter(id) {
    const char = gameData.characters[id];
    if (!char || !char.unlocked) return;
    
    if (BazhikGame.upgradeCharacterLogic(char, gameData)) {
        BazhikGame.saveGameData(gameData);
        gameData = BazhikGame.loadGameData();
        renderBrawlers();
        updateDisplay();
        
        const card = document.querySelector(`.brawler-card`);
        if (card) {
            card.style.animation = 'upgradeFlash 0.3s ease';
            setTimeout(() => {
                if (card) card.style.animation = '';
            }, 300);
        }
    }
}

// Добавляем стили для анимаций
const brawlerStyles = document.createElement('style');
brawlerStyles.textContent = `
    @keyframes selectPulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,215,0,0.7); }
        100% { transform: scale(1.02); box-shadow: 0 0 20px 10px rgba(255,215,0,0); }
    }
    @keyframes upgradeFlash {
        0% { background: rgba(255,170,51,0.5); transform: scale(1); }
        100% { background: transparent; transform: scale(1.02); }
    }
`;
document.head.appendChild(brawlerStyles);

// Слушаем изменения в localStorage
window.addEventListener('storage', (e) => {
    if (e.key === BazhikGame.STORAGE_KEY) {
        console.log('brawlers: получено событие обновления данных');
        gameData = BazhikGame.loadGameData();
        updateDisplay();
        renderBrawlers();
    }
});

// Обновляем каждую секунду для синхронизации
setInterval(() => {
    const freshData = BazhikGame.loadGameData();
    if (JSON.stringify(freshData) !== JSON.stringify(gameData)) {
        console.log('brawlers: синхронизация данных');
        gameData = freshData;
        updateDisplay();
        renderBrawlers();
    }
}, 1000);

document.addEventListener('DOMContentLoaded', () => {
    console.log('brawlers: страница загружена');
    loadData();
});