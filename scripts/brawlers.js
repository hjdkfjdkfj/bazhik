let gameData = null;

function loadData() {
    gameData = BazhikGame.loadGameData();
    updateDisplay();
    renderBrawlers();
}

function updateDisplay() {
    const currencyEl = document.getElementById('currencyDisplay');
    if (currencyEl) currencyEl.innerText = BazhikGame.formatNumber(gameData.currency);
}

function renderBrawlers() {
    const grid = document.getElementById('brawlersGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const order = ['default', 'glasses', 'mechanic', 'poko', 'master'];
    const names = { default: 'ОБЫЧНЫЙ БАЖИК', glasses: 'БАЖИК В ОЧКАХ', mechanic: 'БАЖИК МЕХА', poko: 'БАЖИК ПОКО', master: 'МАСТУРБАЖИК' };
    for (const id of order) {
        const char = gameData.characters[id];
        if (!char) continue;
        const rarity = char.rarity || 'COMMON';
        const card = document.createElement('div');
        card.className = `brawler-card ${rarity === 'RARE' ? 'rare' : 'common'} ${gameData.selectedCharacter === id ? 'selected' : ''} ${!char.unlocked ? 'locked' : ''}`;
        card.onclick = () => selectCharacter(id);
        const isMaxLevel = char.isMaxLevel || char.level >= BazhikGame.MAX_LEVEL;
        const cost = BazhikGame.getUpgradeCost(char);
        const progress = BazhikGame.getProgressToNextLevel(char);
        const bonusPerClick = BazhikGame.getClickBonus(char);
        if (char.unlocked) {
            card.innerHTML = `
                <div class="brawler-image-wrapper"><img src="${char.img}" class="brawler-img">${isMaxLevel ? '<div class="max-level-badge">✨ MAX ✨</div>' : ''}</div>
                <div class="brawler-name">${names[id]}</div>
                <div class="rarity-text">${rarity === 'RARE' ? '★ РЕДКИЙ ★' : '☆ ОБЫЧНЫЙ ☆'}</div>
                <div class="brawler-level ${isMaxLevel ? 'max-level-text' : ''}">${isMaxLevel ? 'МАКСИМАЛЬНЫЙ УРОВЕНЬ' : `УРОВЕНЬ ${char.level} / ${BazhikGame.MAX_LEVEL}`}</div>
                <div class="brawler-bonus">+${bonusPerClick} ЗА КЛИК ${rarity === 'RARE' ? '(x2!)' : ''}</div>
                ${!isMaxLevel ? `
                    <div class="progress-container"><div class="progress-label"><span>📦 Прогресс</span><span>${progress.current}/${progress.required}</span></div>
                    <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${progress.percentage}%"></div></div>
                    <div class="upgrade-cost-info"><div class="cost-item"><span>📦 Нужно дубликатов:</span><span class="cost-value">${cost.duplicates}</span></div>
                    <div class="cost-item"><span>💰 Нужно Бажичков:</span><span class="cost-value">${cost.currency}</span></div>
                    <div class="cost-item"><span>➡️ Следующий уровень:</span><span class="cost-value">${cost.nextLevel || 'MAX'}</span></div></div>
                    <button class="upgrade-btn" onclick="event.stopPropagation(); upgradeCharacter('${id}')">🔧 УЛУЧШИТЬ</button></div>
                ` : `<div class="brawler-max-achieved">🏆 ДОСТИГНУТ МАКСИМУМ 🏆</div><div class="final-bonus">✨ +${bonusPerClick} за клик ✨</div>`}
            `;
        } else {
            card.innerHTML = `
                <div class="brawler-image-wrapper locked"><img src="${char.img}" class="brawler-img locked-img"><div class="lock-overlay">🔒</div></div>
                <div class="brawler-name">${names[id]}</div>
                <div class="rarity-text">${rarity === 'RARE' ? '★ РЕДКИЙ ★' : '☆ ОБЫЧНЫЙ ☆'}</div>
                <div class="brawler-level locked-text">🔒 ЗАБЛОКИРОВАН</div>
                <div class="unlock-hint">🎁 Выбейте из кейса!</div>
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
    }
}

window.addEventListener('storage', (e) => { if (e.key === BazhikGame.STORAGE_KEY) { gameData = BazhikGame.loadGameData(); updateDisplay(); renderBrawlers(); } });
setInterval(() => { const fresh = BazhikGame.loadGameData(); if (JSON.stringify(fresh) !== JSON.stringify(gameData)) { gameData = fresh; updateDisplay(); renderBrawlers(); } }, 1000);
document.addEventListener('DOMContentLoaded', () => loadData());