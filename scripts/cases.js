let gameData = null;

function loadData() {
    gameData = BazhikGame.loadGameData();
    updateDisplay();
    checkAllMaxLevel();
    updateCaseStats();
}

function updateDisplay() {
    document.getElementById('currencyDisplay').innerText = BazhikGame.formatNumber(gameData.currency);
    document.getElementById('normalCasePrice').innerText = BazhikGame.CASE_PRICE_NORMAL;
    document.getElementById('goldenCasePrice').innerText = BazhikGame.CASE_PRICE_GOLDEN;
}

function checkAllMaxLevel() {
    const allMax = BazhikGame.areAllMaxLevel(gameData);
    const normalBtn = document.getElementById('openNormalCaseBtn');
    const goldenBtn = document.getElementById('openGoldenCaseBtn');
    if (allMax) {
        if (normalBtn) { normalBtn.disabled = true; normalBtn.style.opacity = '0.5'; }
        if (goldenBtn) { goldenBtn.disabled = true; goldenBtn.style.opacity = '0.5'; }
    } else {
        if (normalBtn) { normalBtn.disabled = false; normalBtn.style.opacity = '1'; }
        if (goldenBtn) { goldenBtn.disabled = false; goldenBtn.style.opacity = '1'; }
    }
}

function updateCaseStats() {
    const total = Object.values(gameData.characters).length;
    const unlocked = Object.values(gameData.characters).filter(c => c.unlocked).length;
    const maxed = Object.values(gameData.characters).filter(c => c.unlocked && (c.isMaxLevel || c.level >= BazhikGame.MAX_LEVEL)).length;
    const rare = Object.values(gameData.characters).filter(c => c.rarity === 'RARE' && c.unlocked).length;
    const totalRare = Object.values(gameData.characters).filter(c => c.rarity === 'RARE').length;
    const stats = document.getElementById('caseStats');
    if (stats) stats.innerHTML = `<div class="case-stats"><div class="stat-item"><div class="stat-label">РАЗБЛОКИРОВАНО</div><div class="stat-value">${unlocked}/${total}</div></div>
        <div class="stat-item"><div class="stat-label">МАКС. УРОВЕНЬ</div><div class="stat-value">${maxed}/${total}</div></div>
        <div class="stat-item"><div class="stat-label">РЕДКИЕ</div><div class="stat-value" style="color:#28a745;">${rare}/${totalRare}</div></div></div>`;
}

function openNormalCase() { BazhikGame.openCaseWithAnimation(gameData, 'normal', () => { gameData = BazhikGame.loadGameData(); updateDisplay(); checkAllMaxLevel(); updateCaseStats(); }); }
function openGoldenCase() { BazhikGame.openCaseWithAnimation(gameData, 'golden', () => { gameData = BazhikGame.loadGameData(); updateDisplay(); checkAllMaxLevel(); updateCaseStats(); }); }

window.addEventListener('storage', (e) => { if (e.key === BazhikGame.STORAGE_KEY) { gameData = BazhikGame.loadGameData(); updateDisplay(); checkAllMaxLevel(); updateCaseStats(); } });
setInterval(() => { const fresh = BazhikGame.loadGameData(); if (JSON.stringify(fresh) !== JSON.stringify(gameData)) { gameData = fresh; updateDisplay(); checkAllMaxLevel(); updateCaseStats(); } }, 1000);
document.addEventListener('DOMContentLoaded', () => { loadData(); document.getElementById('openNormalCaseBtn').addEventListener('click', openNormalCase); document.getElementById('openGoldenCaseBtn').addEventListener('click', openGoldenCase); });