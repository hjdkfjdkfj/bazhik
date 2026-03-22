/* ========================================
   БАЖИК КОЛЛЕКЦИЯ - БАРАНОКЕЙСЫ
   Цена 150 Бажичков
   ======================================== */

let gameData = null;

function loadData() {
    gameData = BazhikGame.loadGameData();
    updateDisplay();
    checkAllMaxLevel();
    updateCaseStats();
    console.log('Кейсы: загружено данных', gameData.currency, 'монет');
}

function updateDisplay() {
    const currencyEl = document.getElementById('currencyDisplay');
    if (currencyEl) currencyEl.innerText = BazhikGame.formatNumber(gameData.currency);
    
    const casePriceEl = document.getElementById('casePrice');
    if (casePriceEl) casePriceEl.innerText = BazhikGame.CASE_PRICE;
}

function checkAllMaxLevel() {
    const allMax = BazhikGame.areAllMaxLevel(gameData);
    const openBtn = document.getElementById('openCaseBtn');
    const caseWarning = document.getElementById('caseWarning');
    
    if (allMax) {
        if (openBtn) {
            openBtn.disabled = true;
            openBtn.style.opacity = '0.5';
            openBtn.style.cursor = 'not-allowed';
        }
        if (caseWarning) {
            caseWarning.innerHTML = '🎉✨ ПОЗДРАВЛЯЕМ! ✨🎉<br>Все барашки достигли максимального уровня!<br>Кейсы больше недоступны!';
            caseWarning.style.color = '#ffaa33';
            caseWarning.style.fontWeight = 'bold';
        }
    } else {
        if (openBtn) {
            openBtn.disabled = false;
            openBtn.style.opacity = '1';
            openBtn.style.cursor = 'pointer';
        }
        if (caseWarning) {
            caseWarning.innerHTML = `⭐ Кейс стоит ${BazhikGame.CASE_PRICE} Бажичков ⭐<br>Выпадает любой барашек с одинаковым шансом!`;
        }
    }
}

function updateCaseStats() {
    const totalSheep = Object.values(gameData.characters).length;
    const unlockedSheep = Object.values(gameData.characters).filter(c => c.unlocked).length;
    const maxLevelSheep = Object.values(gameData.characters).filter(c => c.unlocked && (c.isMaxLevel || c.level >= BazhikGame.MAX_LEVEL)).length;
    
    const statsContainer = document.getElementById('caseStats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="case-stats">
                <div class="stat-item">
                    <div class="stat-label">РАЗБЛОКИРОВАНО</div>
                    <div class="stat-value">${unlockedSheep}/${totalSheep}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">МАКС. УРОВЕНЬ</div>
                    <div class="stat-value">${maxLevelSheep}/${totalSheep}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">ЦЕНА КЕЙСА</div>
                    <div class="stat-value">${BazhikGame.CASE_PRICE}💰</div>
                </div>
            </div>
        `;
    }
}

function openCase() {
    console.log('Кейсы: попытка открыть кейс, монет:', gameData.currency);
    
    BazhikGame.openCaseWithAnimation(gameData, (reward) => {
        gameData = BazhikGame.loadGameData();
        updateDisplay();
        checkAllMaxLevel();
        updateCaseStats();
        console.log('Кейсы: кейс открыт, новая валюта:', gameData.currency);
        window.dispatchEvent(new StorageEvent('storage', { key: BazhikGame.STORAGE_KEY }));
    });
}

window.addEventListener('storage', (e) => {
    if (e.key === BazhikGame.STORAGE_KEY) {
        console.log('Кейсы: получено событие обновления данных');
        gameData = BazhikGame.loadGameData();
        updateDisplay();
        checkAllMaxLevel();
        updateCaseStats();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    const openBtn = document.getElementById('openCaseBtn');
    if (openBtn) openBtn.addEventListener('click', openCase);
    
    const casesContainer = document.querySelector('.cases-container');
    if (casesContainer && !document.getElementById('caseStats')) {
        const statsDiv = document.createElement('div');
        statsDiv.id = 'caseStats';
        statsDiv.className = 'case-stats-container';
        casesContainer.appendChild(statsDiv);
        updateCaseStats();
    }
    
    setInterval(() => {
        const freshData = BazhikGame.loadGameData();
        if (JSON.stringify(freshData) !== JSON.stringify(gameData)) {
            gameData = freshData;
            updateDisplay();
            checkAllMaxLevel();
            updateCaseStats();
        }
    }, 1000);
});