let gameData = null;

function loadData() {
    gameData = BazhikGame.loadGameData();
    updateUI();
}

function updateUI() {
    BazhikGame.updateCurrencyDisplay(gameData.currency);
    document.getElementById('totalClicks').innerText = BazhikGame.formatNumber(gameData.totalClicks);
    const bonus = BazhikGame.getClickBonus(gameData.characters[gameData.selectedCharacter]);
    document.getElementById('clickBonus').innerText = bonus;
    const selectedChar = gameData.characters[gameData.selectedCharacter];
    document.getElementById('activeBrawlerName').innerHTML = `🐏 ${selectedChar.name} ${selectedChar.isMaxLevel ? 'MAX' : `ур.${selectedChar.level}`}`;
    document.getElementById('activeBrawlerBonus').innerHTML = `+${bonus} за клик`;
    const rarity = selectedChar.rarity === 'RARE' ? '★ РЕДКИЙ ★' : '☆ ОБЫЧНЫЙ ☆';
    document.getElementById('activeBrawlerRarity').innerHTML = rarity;
    document.getElementById('activeBrawlerRarity').className = `hero-rarity ${selectedChar.rarity === 'RARE' ? 'rare' : 'common'}`;
    document.getElementById('mainSheepImage').src = selectedChar.img;
}

function handleClick() {
    const bonus = BazhikGame.getClickBonus(gameData.characters[gameData.selectedCharacter]);
    gameData.currency += bonus;
    gameData.totalClicks++;
    updateUI();
    BazhikGame.saveGameData(gameData);
    const sheep = document.getElementById('clickableSheep');
    BazhikGame.animateClick(sheep);
    const rect = sheep.getBoundingClientRect();
    BazhikGame.showFloatingNumber(bonus, rect.left + rect.width/2, rect.top + rect.height/2, true);
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(30);
}

function resetGame() {
    if (confirm('Вы уверены? Весь прогресс будет удален!')) {
        gameData = BazhikGame.resetGameData();
        updateUI();
        BazhikGame.showFloatingMessage('Прогресс сброшен!', 'success');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    BazhikGame.initParticles();
    document.getElementById('clickableSheep').addEventListener('click', handleClick);
    document.getElementById('resetGameBtn').addEventListener('click', resetGame);
    document.getElementById('openBrawlersBtn').addEventListener('click', () => window.location.href = 'brawlers.html');
    document.getElementById('openCasesBtn').addEventListener('click', () => window.location.href = 'cases.html');
    setInterval(() => { const fresh = BazhikGame.loadGameData(); if (JSON.stringify(fresh) !== JSON.stringify(gameData)) { gameData = fresh; updateUI(); } }, 1000);
});