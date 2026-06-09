const TILE_SIZE = 40;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const TERRAIN = {
    GRASS: 0,
    ROAD: 1,
    BUILDING: 2
};

const REGIONS = [
    { name: '闸北', x: 0, y: 0, w: 10, h: 7, boss: null, conquered: false },
    { name: '虹口', x: 10, y: 0, w: 10, h: 7, boss: null, conquered: false },
    { name: '南市', x: 0, y: 7, w: 10, h: 8, boss: null, conquered: false },
    { name: '法租界', x: 10, y: 7, w: 10, h: 8, boss: null, conquered: false }
];

const game = {
    canvas: null,
    ctx: null,
    
    map: [],
    territories: [],
    enemySpots: [],
    taverns: [],
    regions: [],
    
    player: {
        x: 10,
        y: 7,
        hp: 100,
        maxHp: 100,
        attack: 20,
        defense: 10
    },
    
    stats: {
        money: 100,
        prestige: 0,
        followers: 0,
        days: 30,
        steps: 0,
        conqueredRegions: 0
    },
    
    currentEnemy: null,
    isBattling: false,
    isRecruiting: false,
    isBossBattle: false,
    
    camera: {
        x: 0,
        y: 0
    },
    
    currentRegion: -1
};

function initGame() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    
    generateMap();
    initUI();
    updateUI();
    draw();
    
    window.addEventListener('keydown', handleKeyDown);
}

function generateMap() {
    game.map = [];
    game.territories = [];
    game.enemySpots = [];
    game.taverns = [];
    game.regions = JSON.parse(JSON.stringify(REGIONS));
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        game.map[y] = [];
        game.territories[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            const rand = Math.random();
            if (rand < 0.15) {
                game.map[y][x] = TERRAIN.BUILDING;
            } else if (rand < 0.4) {
                game.map[y][x] = TERRAIN.ROAD;
            } else {
                game.map[y][x] = TERRAIN.GRASS;
            }
            game.territories[y][x] = false;
        }
    }
    
    game.map[game.player.y][game.player.x] = TERRAIN.GRASS;
    
    for (let i = 0; i < 8; i++) {
        const dx = [-1, 1, 0, 0, -1, -1, 1, 1][i];
        const dy = [0, 0, -1, 1, -1, 1, -1, 1][i];
        const nx = game.player.x + dx;
        const ny = game.player.y + dy;
        if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
            game.map[ny][nx] = TERRAIN.GRASS;
        }
    }
    
    generateEnemySpots();
    generateTaverns();
    generateRegionBosses();
    conquerStartingRegion();
}

function generateEnemySpots() {
    const count = 24;
    for (let i = 0; i < count; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * MAP_WIDTH);
            y = Math.floor(Math.random() * MAP_HEIGHT);
        } while (game.map[y][x] === TERRAIN.BUILDING || 
                 (x === game.player.x && y === game.player.y) ||
                 game.enemySpots.some(spot => spot.x === x && spot.y === y));
        
        const level = Math.floor(Math.random() * 3) + 1;
        game.enemySpots.push({ x, y, level: level });
    }
}

function generateTaverns() {
    const count = 5;
    const grassCoords = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (game.map[y][x] === TERRAIN.GRASS && !(x === game.player.x && y === game.player.y)) {
                grassCoords.push({ x, y });
            }
        }
    }
    
    const shuffled = grassCoords.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        game.taverns.push(shuffled[i]);
    }
}

function generateRegionBosses() {
    game.regions.forEach((region, index) => {
        if (index === 2) return;
        
        let x, y;
        do {
            x = region.x + Math.floor(Math.random() * region.w);
            y = region.y + Math.floor(Math.random() * region.h);
        } while (game.map[y][x] === TERRAIN.BUILDING || 
                 (x === game.player.x && y === game.player.y));
        
        region.boss = {
            x: x,
            y: y,
            level: index + 2,
            hp: 80 + index * 40,
            maxHp: 80 + index * 40,
            attack: 15 + index * 8,
            defense: 8 + index * 4,
            gold: 50 + index * 30,
            prestige: 20 + index * 15
        };
    });
}

function conquerStartingRegion() {
    const startRegion = game.regions[2];
    startRegion.conquered = true;
    game.stats.conqueredRegions = 1;
    
    for (let y = startRegion.y; y < startRegion.y + startRegion.h && y < MAP_HEIGHT; y++) {
        for (let x = startRegion.x; x < startRegion.x + startRegion.w && x < MAP_WIDTH; x++) {
            if (game.map[y][x] !== TERRAIN.BUILDING) {
                game.territories[y][x] = true;
            }
        }
    }
}

function initUI() {
    document.getElementById('saveBtn').addEventListener('click', saveGame);
    document.getElementById('loadBtn').addEventListener('click', loadGame);
    document.getElementById('attackBtn').addEventListener('click', attack);
    document.getElementById('fleeBtn').addEventListener('click', flee);
    document.getElementById('cancelRecruitBtn').addEventListener('click', closeRecruitModal);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
}

function updateUI() {
    document.getElementById('prestige').textContent = game.stats.prestige;
    document.getElementById('money').textContent = game.stats.money;
    document.getElementById('followers').textContent = game.stats.followers;
    document.getElementById('territories').textContent = game.stats.conqueredRegions + '/' + game.regions.length;
    document.getElementById('days').textContent = game.stats.days;
    document.getElementById('playerHp').textContent = game.player.hp;
    document.getElementById('playerAtk').textContent = game.player.attack;
    document.getElementById('playerDef').textContent = game.player.defense;
}

function countTerritories() {
    let count = 0;
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (game.territories[y][x]) count++;
        }
    }
    return count;
}

function getCurrentRegion(x, y) {
    return game.regions.findIndex(r => 
        x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h
    );
}

function handleKeyDown(e) {
    if (game.isBattling || game.isRecruiting) return;
    
    let dx = 0, dy = 0;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            dy = -1;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            dy = 1;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            dx = -1;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            dx = 1;
            break;
        default:
            return;
    }
    
    movePlayer(dx, dy);
}

function movePlayer(dx, dy) {
    const newX = game.player.x + dx;
    const newY = game.player.y + dy;
    
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) return;
    if (game.map[newY][newX] === TERRAIN.BUILDING) return;
    
    const oldRegion = game.currentRegion;
    game.player.x = newX;
    game.player.y = newY;
    game.stats.steps++;
    
    game.currentRegion = getCurrentRegion(game.player.x, game.player.y);
    
    checkStepCount();
    checkNewRegion(oldRegion);
    checkEnemySpot();
    checkBossSpot();
    checkTavern();
    updateCamera();
    draw();
}

function checkStepCount() {
    if (game.stats.steps >= 10) {
        game.stats.steps = 0;
        game.stats.days--;
        deductWages();
        updateUI();
        checkGameEnd();
    }
}

function deductWages() {
    const wage = game.stats.followers * 2;
    game.stats.money -= wage;
    if (game.stats.money < 0) game.stats.money = 0;
    updateUI();
}

function checkNewRegion(oldRegion) {
    if (game.currentRegion !== oldRegion && game.currentRegion !== -1) {
        const region = game.regions[game.currentRegion];
        if (!region.conquered) {
            alert(`进入${region.name}区域！\n找到并击败区域BOSS以占领此地！`);
        }
    }
}

function checkEnemySpot() {
    const index = game.enemySpots.findIndex(spot => spot.x === game.player.x && spot.y === game.player.y);
    if (index !== -1) {
        startBattle(index, false);
    }
}

function checkBossSpot() {
    const region = game.regions[game.currentRegion];
    if (region && !region.conquered && region.boss && 
        region.boss.x === game.player.x && region.boss.y === game.player.y) {
        startBossBattle(region);
    }
}

function checkTavern() {
    const exists = game.taverns.some(tavern => tavern.x === game.player.x && tavern.y === game.player.y);
    if (exists) {
        openRecruitModal();
    }
}

function startBattle(enemyIndex, isBoss = false) {
    game.isBattling = true;
    
    if (isBoss) {
        game.isBossBattle = true;
        game.currentEnemy = JSON.parse(JSON.stringify(game.currentRegionBoss));
    } else {
        game.isBossBattle = false;
        const spot = game.enemySpots[enemyIndex];
        
        const level = Math.floor(Math.random() * 3) + 1;
        game.currentEnemy = {
            level: level,
            hp: 30 + level * 20,
            maxHp: 30 + level * 20,
            attack: 10 + level * 5,
            defense: 5 + level * 2,
            gold: 15 + level * 10,
            prestige: 3 + level * 2,
            spotIndex: enemyIndex
        };
    }
    
    updateEnemyUI();
    document.getElementById('battleModal').classList.remove('hidden');
}

function startBossBattle(region) {
    game.isBattling = true;
    game.isBossBattle = true;
    game.currentEnemy = JSON.parse(JSON.stringify(region.boss));
    game.currentRegionBoss = region.boss;
    game.currentBossRegion = region;
    
    updateEnemyUI();
    document.getElementById('battleModal').classList.remove('hidden');
}

function updateEnemyUI() {
    const enemy = game.currentEnemy;
    if (game.isBossBattle) {
        document.getElementById('enemyName').textContent = `👹 ${game.currentBossRegion.name}大佬 Lv.${enemy.level}`;
    } else {
        document.getElementById('enemyName').textContent = `敌人 Lv.${enemy.level}`;
    }
    document.getElementById('enemyHp').textContent = enemy.hp;
    document.getElementById('enemyAtk').textContent = enemy.attack;
    document.getElementById('enemyDef').textContent = enemy.defense;
    document.getElementById('battleResult').textContent = '';
}

function attack() {
    if (!game.isBattling || !game.currentEnemy) return;
    
    const playerDamage = Math.max(1, game.player.attack - game.currentEnemy.defense + Math.floor(Math.random() * 5));
    game.currentEnemy.hp -= playerDamage;
    
    document.getElementById('enemyHp').textContent = game.currentEnemy.hp;
    document.getElementById('battleResult').textContent = `你对敌人造成了 ${playerDamage} 点伤害！`;
    
    if (game.currentEnemy.hp <= 0) {
        battleVictory();
        return;
    }
    
    const enemyDamage = Math.max(1, game.currentEnemy.attack - game.player.defense + Math.floor(Math.random() * 5));
    game.player.hp -= enemyDamage;
    
    setTimeout(() => {
        document.getElementById('battleResult').textContent = `敌人对你造成了 ${enemyDamage} 点伤害！`;
        document.getElementById('playerHp').textContent = game.player.hp;
        
        if (game.player.hp <= 0) {
            battleDefeat();
        }
    }, 500);
}

function flee() {
    if (!game.isBattling) return;
    
    if (game.isBossBattle) {
        alert('BOSS战无法逃跑！必须战胜！');
        return;
    }
    
    if (game.stats.prestige < 5) {
        alert('威望不足，无法逃跑！');
        return;
    }
    
    game.stats.prestige -= 5;
    game.isBattling = false;
    game.currentEnemy = null;
    document.getElementById('battleModal').classList.add('hidden');
    updateUI();
    alert('你消耗了 5 威望，成功逃跑！');
}

function battleVictory() {
    const enemy = game.currentEnemy;
    game.stats.money += enemy.gold;
    game.stats.prestige += enemy.prestige;
    
    if (!game.isBossBattle) {
        game.enemySpots.splice(enemy.spotIndex, 1);
    } else {
        conquerRegion();
    }
    
    game.player.hp = Math.min(game.player.maxHp, Math.floor(game.player.hp * 1.1));
    
    game.isBattling = false;
    game.isBossBattle = false;
    game.currentEnemy = null;
    document.getElementById('battleModal').classList.add('hidden');
    
    updateUI();
    
    if (game.isBossBattle) {
        alert(`🎉 恭喜！成功击败${game.currentBossRegion.name}大佬！\n占领${game.currentBossRegion.name}区域！\n获得 ${enemy.gold} 大洋，威望 +${enemy.prestige}`);
    } else {
        alert(`战斗胜利！获得 ${enemy.gold} 大洋，威望 +${enemy.prestige}，生命恢复10%`);
    }
    
    checkWinCondition();
}

function conquerRegion() {
    const region = game.currentBossRegion;
    region.conquered = true;
    game.stats.conqueredRegions++;
    
    for (let y = region.y; y < region.y + region.h && y < MAP_HEIGHT; y++) {
        for (let x = region.x; x < region.x + region.w && x < MAP_WIDTH; x++) {
            if (game.map[y][x] !== TERRAIN.BUILDING) {
                game.territories[y][x] = true;
            }
        }
    }
    
    region.boss = null;
}

function battleDefeat() {
    game.stats.days--;
    game.stats.money = Math.floor(game.stats.money / 2);
    
    const startRegion = game.regions.find(r => r.conquered);
    if (startRegion) {
        game.player.x = startRegion.x + Math.floor(startRegion.w / 2);
        game.player.y = startRegion.y + Math.floor(startRegion.h / 2);
    } else {
        game.player.x = 10;
        game.player.y = 7;
    }
    game.player.hp = game.player.maxHp;
    
    game.isBattling = false;
    game.isBossBattle = false;
    game.currentEnemy = null;
    document.getElementById('battleModal').classList.add('hidden');
    
    updateUI();
    updateCamera();
    draw();
    
    alert('战斗失败！时间减少1天，金钱减半，回到己方区域');
    checkGameEnd();
}

function openRecruitModal() {
    game.isRecruiting = true;
    updateShopUI();
    document.getElementById('recruitModal').classList.remove('hidden');
}

function closeRecruitModal() {
    game.isRecruiting = false;
    document.getElementById('recruitModal').classList.add('hidden');
}

function updateShopUI() {
    document.getElementById('currentMoney').textContent = game.stats.money;
    document.getElementById('currentHp').textContent = game.player.hp;
    document.getElementById('maxHp').textContent = game.player.maxHp;
    document.getElementById('currentAtk').textContent = game.player.attack;
    document.getElementById('currentDef').textContent = game.player.defense;
    document.getElementById('currentFollowers').textContent = game.stats.followers;
}

function buyItem(itemType) {
    let price = 0;
    let message = '';
    
    switch(itemType) {
        case 'heal':
            price = 30;
            if (game.stats.money < price) {
                alert('大洋不足！');
                return;
            }
            if (game.player.hp >= game.player.maxHp) {
                alert('你的HP已经满了！');
                return;
            }
            game.player.hp = Math.min(game.player.hp + 30, game.player.maxHp);
            message = '使用跌打药酒，恢复了30点HP！';
            break;
            
        case 'fullHeal':
            price = 100;
            if (game.stats.money < price) {
                alert('大洋不足！');
                return;
            }
            if (game.player.hp >= game.player.maxHp) {
                alert('你的HP已经满了！');
                return;
            }
            game.player.hp = game.player.maxHp;
            message = '使用医疗箱，HP完全恢复！';
            break;
            
        case 'attack':
            price = 80;
            if (game.stats.money < price) {
                alert('大洋不足！');
                return;
            }
            game.player.attack += 3;
            message = '服用大力丸，攻击力永久 +3！';
            break;
            
        case 'defense':
            price = 80;
            if (game.stats.money < price) {
                alert('大洋不足！');
                return;
            }
            game.player.defense += 2;
            message = '学会铁布衫，防御力永久 +2！';
            break;
            
        case 'follower':
            price = 50;
            if (game.stats.money < price) {
                alert('大洋不足！');
                return;
            }
            game.stats.followers++;
            game.player.attack += 5;
            message = '招募一名小弟！攻击力永久 +5！';
            break;
    }
    
    game.stats.money -= price;
    updateShopUI();
    updateUI();
    alert(message);
}

function checkWinCondition() {
    if (game.stats.conqueredRegions >= game.regions.length || game.stats.prestige >= 200) {
        showEnding(true);
    }
}

function checkGameEnd() {
    if (game.stats.days <= 0) {
        showEnding(false);
    }
}

function showEnding(win) {
    const title = win ? '🎉 胜利！' : '💀 失败！';
    const content = win 
        ? '恭喜！斧头帮在你的带领下称霸上海滩！\n阿龙的名字将被永远铭记！'
        : '30天期限已到，斧头帮未能称霸上海滩...\n江湖路远，从头再来！';
    
    document.getElementById('endingTitle').textContent = title;
    document.getElementById('endingContent').textContent = content;
    document.getElementById('endingModal').classList.remove('hidden');
}

function restartGame() {
    document.getElementById('endingModal').classList.add('hidden');
    
    game.player = {
        x: 10,
        y: 7,
        hp: 100,
        maxHp: 100,
        attack: 20,
        defense: 10
    };
    
    game.stats = {
        money: 100,
        prestige: 0,
        followers: 0,
        days: 30,
        steps: 0,
        conqueredRegions: 0
    };
    
    game.currentEnemy = null;
    game.isBattling = false;
    game.isRecruiting = false;
    game.isBossBattle = false;
    game.camera = { x: 0, y: 0 };
    game.currentRegion = -1;
    
    generateMap();
    updateUI();
    draw();
}

function updateCamera() {
    const centerX = game.player.x * TILE_SIZE + TILE_SIZE / 2;
    const centerY = game.player.y * TILE_SIZE + TILE_SIZE / 2;
    
    game.camera.x = Math.max(0, Math.min(centerX - CANVAS_WIDTH / 2, MAP_WIDTH * TILE_SIZE - CANVAS_WIDTH));
    game.camera.y = Math.max(0, Math.min(centerY - CANVAS_HEIGHT / 2, MAP_HEIGHT * TILE_SIZE - CANVAS_HEIGHT));
}

function draw() {
    const ctx = game.ctx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawMap();
    drawRegions();
    drawTerritories();
    drawEnemySpots();
    drawBossSpots();
    drawTaverns();
    drawPlayer();
}

function drawMap() {
    const ctx = game.ctx;
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const screenX = x * TILE_SIZE - game.camera.x;
            const screenY = y * TILE_SIZE - game.camera.y;
            
            if (screenX + TILE_SIZE < 0 || screenX > CANVAS_WIDTH ||
                screenY + TILE_SIZE < 0 || screenY > CANVAS_HEIGHT) {
                continue;
            }
            
            switch (game.map[y][x]) {
                case TERRAIN.GRASS:
                    drawGrassTile(ctx, screenX, screenY, x, y);
                    break;
                case TERRAIN.ROAD:
                    drawRoadTile(ctx, screenX, screenY, x, y);
                    break;
                case TERRAIN.BUILDING:
                    drawBuildingTile(ctx, screenX, screenY);
                    break;
            }
            
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
    }
}

function drawGrassTile(ctx, x, y, tileX, tileY) {
    const gradient = ctx.createLinearGradient(x, y, x, y + TILE_SIZE);
    gradient.addColorStop(0, '#2d5a27');
    gradient.addColorStop(1, '#1a3d16');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    ctx.fillStyle = '#3d7a37';
    const grassCount = 3 + (tileX + tileY) % 4;
    for (let i = 0; i < grassCount; i++) {
        const gx = x + 5 + (i * 10) % 30;
        const gy = y + TILE_SIZE - 5 - ((tileX + tileY + i) * 3) % 15;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx - 2, gy - 6);
        ctx.lineTo(gx + 2, gy - 6);
        ctx.fill();
    }
}

function drawRoadTile(ctx, x, y, tileX, tileY) {
    const gradient = ctx.createLinearGradient(x, y, x + TILE_SIZE, y + TILE_SIZE);
    gradient.addColorStop(0, '#a07030');
    gradient.addColorStop(0.5, '#8b5a2b');
    gradient.addColorStop(1, '#7a4a20');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    ctx.strokeStyle = '#6a3a15';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + TILE_SIZE / 2, y + 5);
    ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE - 5);
    ctx.stroke();
    
    ctx.fillStyle = '#6a3a15';
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawBuildingTile(ctx, x, y) {
    const gradient = ctx.createLinearGradient(x, y, x, y + TILE_SIZE);
    gradient.addColorStop(0, '#5a5a5a');
    gradient.addColorStop(1, '#3a3a3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE * 0.4);
    
    ctx.fillStyle = '#4a4a4a';
    const windowRows = 2;
    const windowCols = 3;
    const ww = 6;
    const wh = 8;
    const wx = (TILE_SIZE - windowCols * (ww + 4)) / 2 + x;
    const wy = y + TILE_SIZE * 0.5;
    
    for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
            ctx.fillStyle = '#ffcc66';
            ctx.fillRect(wx + col * (ww + 4), wy + row * (wh + 4), ww, wh);
        }
    }
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + TILE_SIZE * 0.3, y + TILE_SIZE - 4, TILE_SIZE * 0.4, 4);
}

function drawRegions() {
    const ctx = game.ctx;
    
    game.regions.forEach((region, index) => {
        const screenX = region.x * TILE_SIZE - game.camera.x;
        const screenY = region.y * TILE_SIZE - game.camera.y;
        const screenW = region.w * TILE_SIZE;
        const screenH = region.h * TILE_SIZE;
        
        if (screenX + screenW < 0 || screenX > CANVAS_WIDTH ||
            screenY + screenH < 0 || screenY > CANVAS_HEIGHT) {
            return;
        }
        
        ctx.strokeStyle = region.conquered ? '#00FF00' : '#FF6600';
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX, screenY, screenW, screenH);
        
        if (!region.conquered && region.boss) {
            const bossScreenX = region.boss.x * TILE_SIZE - game.camera.x;
            const bossScreenY = region.boss.y * TILE_SIZE - game.camera.y;
            
            if (bossScreenX + TILE_SIZE > 0 && bossScreenX < CANVAS_WIDTH &&
                bossScreenY + TILE_SIZE > 0 && bossScreenY < CANVAS_HEIGHT) {
                ctx.fillStyle = 'rgba(139, 0, 0, 0.7)';
                ctx.fillRect(bossScreenX, bossScreenY, TILE_SIZE, TILE_SIZE);
            }
        }
    });
}

function drawTerritories() {
    const ctx = game.ctx;
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (game.territories[y][x]) {
                const screenX = x * TILE_SIZE - game.camera.x;
                const screenY = y * TILE_SIZE - game.camera.y;
                
                if (screenX + TILE_SIZE < 0 || screenX > CANVAS_WIDTH ||
                    screenY + TILE_SIZE < 0 || screenY > CANVAS_HEIGHT) {
                    continue;
                }
                
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            }
        }
    }
}

function drawEnemySpots() {
    const ctx = game.ctx;
    
    const levelColors = {
        1: { bg: '#1a4a1a', glow: 'rgba(50, 200, 50, ', border: '#2d8a2d', text: '#44FF44' },
        2: { bg: '#4a3a1a', glow: 'rgba(255, 200, 50, ', border: '#daa520', text: '#FFD700' },
        3: { bg: '#4a1a1a', glow: 'rgba(255, 50, 50, ', border: '#cc0000', text: '#FF4444' }
    };
    
    const levelNames = { 1: '杂鱼', 2: '打手', 3: '高手' };
    
    game.enemySpots.forEach(spot => {
        const screenX = spot.x * TILE_SIZE - game.camera.x;
        const screenY = spot.y * TILE_SIZE - game.camera.y;
        const centerX = screenX + TILE_SIZE / 2;
        const centerY = screenY + TILE_SIZE / 2;
        
        if (screenX + TILE_SIZE < 0 || screenX > CANVAS_WIDTH ||
            screenY + TILE_SIZE < 0 || screenY > CANVAS_HEIGHT) {
            return;
        }
        
        const colors = levelColors[spot.level] || levelColors[1];
        const size = TILE_SIZE / 2.8 + spot.level * 2;
        
        ctx.fillStyle = colors.bg;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.fill();
        
        const glowSize = TILE_SIZE / 2.5 + spot.level * 3;
        const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize);
        glowGradient.addColorStop(0, colors.glow + '0.6)');
        glowGradient.addColorStop(1, colors.glow + '0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = colors.text;
        ctx.font = `bold ${16 + spot.level * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚔', centerX, centerY - 2);
        
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 10px Arial';
        ctx.fillText(levelNames[spot.level], centerX, centerY + 10);
        
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 2 + spot.level;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.stroke();
        
        if (spot.level === 3) {
            ctx.strokeStyle = '#FF6600';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(centerX, centerY, size + 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    });
}

function drawBossSpots() {
    const ctx = game.ctx;
    
    game.regions.forEach(region => {
        if (!region.conquered && region.boss) {
            const screenX = region.boss.x * TILE_SIZE - game.camera.x;
            const screenY = region.boss.y * TILE_SIZE - game.camera.y;
            const centerX = screenX + TILE_SIZE / 2;
            const centerY = screenY + TILE_SIZE / 2;
            
            if (screenX + TILE_SIZE < 0 || screenX > CANVAS_WIDTH ||
                screenY + TILE_SIZE < 0 || screenY > CANVAS_HEIGHT) {
                return;
            }
            
            const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, TILE_SIZE / 2);
            bgGradient.addColorStop(0, '#6B0000');
            bgGradient.addColorStop(1, '#3B0000');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            
            const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, TILE_SIZE);
            glowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.5)');
            glowGradient.addColorStop(0.5, 'rgba(200, 0, 0, 0.2)');
            glowGradient.addColorStop(1, 'rgba(200, 0, 0, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(screenX - TILE_SIZE * 0.2, screenY - TILE_SIZE * 0.2, TILE_SIZE * 1.4, TILE_SIZE * 1.4);
            
            ctx.fillStyle = '#4a0000';
            ctx.beginPath();
            ctx.moveTo(centerX - 12, centerY + 8);
            ctx.lineTo(centerX - 6, centerY - 12);
            ctx.lineTo(centerX, centerY - 8);
            ctx.lineTo(centerX + 6, centerY - 12);
            ctx.lineTo(centerX + 12, centerY + 8);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('👹', centerX, centerY + 4);
            
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 3;
            ctx.strokeRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            
            ctx.strokeStyle = '#FF6600';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(screenX - 4, screenY - 4, TILE_SIZE + 8, TILE_SIZE + 8);
            ctx.setLineDash([]);
        }
    });
}

function drawTaverns() {
    const ctx = game.ctx;
    
    game.taverns.forEach(tavern => {
        const screenX = tavern.x * TILE_SIZE - game.camera.x;
        const screenY = tavern.y * TILE_SIZE - game.camera.y;
        
        if (screenX + TILE_SIZE < 0 || screenX > CANVAS_WIDTH ||
            screenY + TILE_SIZE < 0 || screenY > CANVAS_HEIGHT) {
            return;
        }
        
        const gradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + TILE_SIZE);
        gradient.addColorStop(0, '#6B3E26');
        gradient.addColorStop(1, '#4A2C18');
        ctx.fillStyle = gradient;
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        
        ctx.fillStyle = '#3a2010';
        ctx.fillRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE * 0.35);
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX + 4, screenY + TILE_SIZE * 0.38, TILE_SIZE - 8, TILE_SIZE * 0.58);
        
        const signGradient = ctx.createLinearGradient(
            screenX + TILE_SIZE * 0.2, screenY + TILE_SIZE * 0.15,
            screenX + TILE_SIZE * 0.8, screenY + TILE_SIZE * 0.25
        );
        signGradient.addColorStop(0, '#DAA520');
        signGradient.addColorStop(1, '#B8860B');
        ctx.fillStyle = signGradient;
        ctx.fillRect(screenX + TILE_SIZE * 0.2, screenY + TILE_SIZE * 0.15, TILE_SIZE * 0.6, TILE_SIZE * 0.12);
        
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('酒 馆', screenX + TILE_SIZE / 2, screenY + TILE_SIZE * 0.22);
        
        ctx.fillStyle = '#CD853F';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍶', screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2 + 8);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
    });
}

function drawPlayer() {
    const ctx = game.ctx;
    const screenX = game.player.x * TILE_SIZE - game.camera.x;
    const screenY = game.player.y * TILE_SIZE - game.camera.y;
    const centerX = screenX + TILE_SIZE / 2;
    const centerY = screenY + TILE_SIZE / 2;
    
    ctx.fillStyle = '#1a4d16';
    ctx.beginPath();
    ctx.arc(centerX, centerY + 4, TILE_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    const bodyGradient = ctx.createRadialGradient(centerX - 5, centerY - 5, 0, centerX, centerY, TILE_SIZE / 2 - 4);
    bodyGradient.addColorStop(0, '#2d8a27');
    bodyGradient.addColorStop(1, '#1a5a16');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 4, TILE_SIZE / 2 - 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#CC0000';
    ctx.beginPath();
    ctx.moveTo(centerX - 8, screenY + 8);
    ctx.lineTo(centerX, screenY);
    ctx.lineTo(centerX + 8, screenY + 8);
    ctx.fill();
    
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(centerX - 6, screenY + 6);
    ctx.lineTo(centerX, screenY + 2);
    ctx.lineTo(centerX + 6, screenY + 6);
    ctx.fill();
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('龍', centerX, centerY + 6);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, TILE_SIZE / 2 + 4, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = '#CCAA00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, TILE_SIZE / 2 + 6, 0, Math.PI * 2);
    ctx.stroke();
}

function saveGame() {
    const saveData = {
        map: game.map,
        territories: game.territories,
        enemySpots: game.enemySpots,
        taverns: game.taverns,
        regions: game.regions,
        player: JSON.parse(JSON.stringify(game.player)),
        stats: JSON.parse(JSON.stringify(game.stats)),
        currentRegion: game.currentRegion
    };
    
    localStorage.setItem('axeGameSave', JSON.stringify(saveData));
    alert('游戏已保存！');
}

function loadGame() {
    const saveData = localStorage.getItem('axeGameSave');
    if (!saveData) {
        alert('没有找到存档！');
        return;
    }
    
    const data = JSON.parse(saveData);
    
    game.map = data.map;
    game.territories = data.territories;
    game.enemySpots = data.enemySpots;
    game.taverns = data.taverns;
    game.regions = data.regions;
    game.player = data.player;
    game.stats = data.stats;
    game.currentRegion = data.currentRegion || -1;
    
    updateUI();
    updateCamera();
    draw();
    
    alert('游戏已读取！');
}

window.addEventListener('load', initGame);