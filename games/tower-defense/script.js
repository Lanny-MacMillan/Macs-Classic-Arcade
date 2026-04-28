const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const waveDisplay = document.getElementById("wave");
const scoreDisplay = document.getElementById("score");
const goldDisplay = document.getElementById("gold");
const livesDisplay = document.getElementById("lives");
const finalScoreDisplay = document.getElementById("final-score");
const wavesCompletedDisplay = document.getElementById("waves-completed");
const victoryScoreDisplay = document.getElementById("victory-score");
const waveNotification = document.getElementById("wave-notification");
const waveNotificationText = document.getElementById("wave-notification-text");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const victoryScreen = document.getElementById("victory-screen");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const victoryRestartBtn = document.getElementById("victory-restart-btn");
const backBtn = document.getElementById("back-btn");

canvas.width = 750;
canvas.height = 500;

const MAX_WAVES = 20;
const MAX_LEVELS = 5;

const TOWER_TYPES = {
  basic: {
    cost: 50,
    range: 120,
    damage: 20,
    fireRate: 600,
    color: "#4444ff",
    name: "Basic",
  },
  sniper: {
    cost: 100,
    range: 200,
    damage: 60,
    fireRate: 1200,
    color: "#ff44ff",
    name: "Sniper",
  },
  rapid: {
    cost: 75,
    range: 100,
    damage: 10,
    fireRate: 200,
    color: "#44ff44",
    name: "Rapid",
  },
  splash: {
    cost: 120,
    range: 110,
    damage: 15,
    fireRate: 800,
    color: "#ff8844",
    name: "Splash",
    splashRadius: 40,
  },
};

const ENEMY_TYPES = {
  normal: { speed: 1, health: 50, size: 15, worth: 10, color: "#ff4444" },
  fast: { speed: 2, health: 30, size: 12, worth: 15, color: "#ffff44" },
  tank: { speed: 0.6, health: 150, size: 20, worth: 25, color: "#444444" },
  boss: { speed: 0.8, health: 300, size: 25, worth: 50, color: "#ff0088" },
};

const path = [
  { x: -20, y: 100 },
  { x: 150, y: 100 },
  { x: 150, y: 300 },
  { x: 400, y: 300 },
  { x: 400, y: 150 },
  { x: 600, y: 150 },
  { x: 600, y: 400 },
  { x: 770, y: 400 },
];

let gameState = {
  enemies: [],
  towers: [],
  projectiles: [],
  wave: 1,
  level: 1,
  score: 0,
  gold: 200,
  lives: 20,
  gameRunning: false,
  waveActive: false,
  enemiesSpawned: 0,
  enemiesPerWave: 20,
  lastSpawn: 0,
  spawnInterval: 800,
  selectedTowerType: "basic",
  selectedTower: null,
};

let isInitialized = false;

class Enemy {
  constructor(type, wave, level) {
    const stats = ENEMY_TYPES[type];
    this.type = type;
    this.x = path[0].x;
    this.y = path[0].y;
    this.pathIndex = 0;
    const levelMultiplier = 1 + (level - 1) * 0.3;
    this.speed = stats.speed * (1 + wave * 0.05) * levelMultiplier;
    this.health = stats.health * (1 + wave * 0.15) * levelMultiplier;
    this.maxHealth = this.health;
    this.size = stats.size;
    this.worth = Math.floor(
      stats.worth * Math.ceil(wave * 0.5) * levelMultiplier,
    );
    this.color = stats.color;
  }

  update() {
    if (this.pathIndex >= path.length - 1) return true;

    const target = path[this.pathIndex + 1];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.pathIndex++;
      if (this.pathIndex >= path.length - 1) return true;
    }

    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;
    return false;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle =
      healthPercent > 0.5
        ? "#00ff00"
        : healthPercent > 0.25
          ? "#ffff00"
          : "#ff0000";
    ctx.fillRect(
      this.x - this.size,
      this.y - this.size - 8,
      this.size * 2 * healthPercent,
      4,
    );
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.x - this.size,
      this.y - this.size - 8,
      this.size * 2,
      4,
    );
  }

  takeDamage(damage) {
    this.health -= damage;
    return this.health <= 0;
  }
}

class Tower {
  constructor(x, y, type) {
    const stats = TOWER_TYPES[type];
    this.x = x;
    this.y = y;
    this.type = type;
    this.range = stats.range;
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.color = stats.color;
    this.splashRadius = stats.splashRadius || 0;
    this.lastFire = 0;
    this.size = 20;
    this.level = 1;
    this.target = null;
  }

  update() {
    if (Date.now() - this.lastFire < this.fireRate) return;

    this.target = this.findTarget();
    if (this.target) {
      this.shoot();
      this.lastFire = Date.now();
    }
  }

  findTarget() {
    let closest = null;
    let maxProgress = -1;

    for (const enemy of gameState.enemies) {
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= this.range && enemy.pathIndex > maxProgress) {
        maxProgress = enemy.pathIndex;
        closest = enemy;
      }
    }

    return closest;
  }

  shoot() {
    gameState.projectiles.push(
      new Projectile(
        this.x,
        this.y,
        this.target,
        this.damage,
        this.type,
        this.splashRadius,
      ),
    );
  }

  upgrade() {
    if (this.level >= 3) return false;
    this.level++;
    this.damage *= 1.5;
    this.range *= 1.1;
    return true;
  }

  getUpgradeCost() {
    return Math.floor(TOWER_TYPES[this.type].cost * this.level * 0.7);
  }

  draw() {
    const isSelected = gameState.selectedTower === this;

    if (isSelected) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size,
    );
    ctx.strokeStyle = isSelected ? "#ffffff" : "#000";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size,
    );

    if (this.level > 1) {
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`L${this.level}`, this.x, this.y - this.size / 2 - 5);
    }

    if (this.target && !isSelected) {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.target.x, this.target.y);
      ctx.stroke();
    }
  }
}

class Projectile {
  constructor(x, y, target, damage, towerType, splashRadius) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.towerType = towerType;
    this.splashRadius = splashRadius;
    this.speed = towerType === "sniper" ? 10 : 5;
    this.size = towerType === "splash" ? 6 : 4;
  }

  update() {
    if (!this.target || this.target.health <= 0) {
      if (this.towerType !== "splash") return true;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      this.dealDamage();
      return true;
    }

    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;
    return false;
  }

  dealDamage() {
    if (this.splashRadius > 0) {
      for (const enemy of gameState.enemies) {
        const dx = enemy.x - this.target.x;
        const dy = enemy.y - this.target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= this.splashRadius) {
          if (enemy.takeDamage(this.damage)) {
            gameState.gold += enemy.worth;
            gameState.score += enemy.worth;
          }
        }
      }
    } else {
      if (this.target.takeDamage(this.damage)) {
        gameState.gold += this.target.worth;
        gameState.score += this.target.worth;
      }
    }
  }

  draw() {
    const color =
      this.towerType === "splash"
        ? "#ff8844"
        : this.towerType === "sniper"
          ? "#ff44ff"
          : this.towerType === "rapid"
            ? "#44ff44"
            : "#ffff00";

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initTowerDefense(container) {
  if (container) {
    container.appendChild(document.querySelector(".game-wrapper"));
  }
  init();
}

function init() {
  if (isInitialized) return;

  if (!startBtn) {
    console.error("Start button not found");
    return;
  }

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", resetGame);
  victoryRestartBtn.addEventListener("click", resetGame);
  backBtn.addEventListener("click", () => {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  });

  canvas.addEventListener("click", handleCanvasClick);
  document.addEventListener("keydown", handleKeyPress);

  isInitialized = true;
}

function handleKeyPress(event) {
  if (!gameState.gameRunning) return;

  const key = event.key.toLowerCase();
  if (key === "1") gameState.selectedTowerType = "basic";
  if (key === "2") gameState.selectedTowerType = "sniper";
  if (key === "3") gameState.selectedTowerType = "rapid";
  if (key === "4") gameState.selectedTowerType = "splash";

  if (key === "u" && gameState.selectedTower) {
    const cost = gameState.selectedTower.getUpgradeCost();
    if (gameState.gold >= cost && gameState.selectedTower.upgrade()) {
      gameState.gold -= cost;
      updateDisplay();
    }
  }

  if (key === "s" && gameState.selectedTower) {
    const sellValue = Math.floor(
      TOWER_TYPES[gameState.selectedTower.type].cost *
        0.6 *
        gameState.selectedTower.level,
    );
    gameState.gold += sellValue;
    gameState.towers = gameState.towers.filter(
      (t) => t !== gameState.selectedTower,
    );
    gameState.selectedTower = null;
    updateDisplay();
  }
}

function startGame() {
  startScreen.classList.add("hidden");
  gameState.gameRunning = true;
  showWaveNotification(gameState.wave, gameState.level);
  startWave();
  gameLoop();
}

function resetGame() {
  gameState = {
    enemies: [],
    towers: [],
    projectiles: [],
    wave: 1,
    level: 1,
    score: 0,
    gold: 200,
    lives: 20,
    gameRunning: false,
    waveActive: false,
    enemiesSpawned: 0,
    enemiesPerWave: 20,
    lastSpawn: 0,
    spawnInterval: 800,
    selectedTowerType: "basic",
    selectedTower: null,
  };
  updateDisplay();
  gameOverScreen.classList.add("hidden");
  victoryScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
}

function startWave() {
  gameState.waveActive = true;
  gameState.enemiesSpawned = 0;
  gameState.lastSpawn = Date.now();
}

function handleCanvasClick(event) {
  if (!gameState.gameRunning) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const clickedTower = gameState.towers.find((t) => {
    const dx = t.x - x;
    const dy = t.y - y;
    return Math.sqrt(dx * dx + dy * dy) < t.size;
  });

  if (clickedTower) {
    gameState.selectedTower =
      gameState.selectedTower === clickedTower ? null : clickedTower;
    return;
  }

  gameState.selectedTower = null;

  const towerCost = TOWER_TYPES[gameState.selectedTowerType].cost;
  if (gameState.gold >= towerCost && isValidTowerPlacement(x, y)) {
    gameState.towers.push(new Tower(x, y, gameState.selectedTowerType));
    gameState.gold -= towerCost;
    updateDisplay();
  }
}

function isValidTowerPlacement(x, y) {
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    const dist = distanceToSegment(x, y, start.x, start.y, end.x, end.y);
    if (dist < 30) return false;
  }

  for (const tower of gameState.towers) {
    const dx = tower.x - x;
    const dy = tower.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 40) return false;
  }

  return true;
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = dx * dx + dy * dy;
  let t = ((px - x1) * dx + (py - y1) * dy) / len;
  t = Math.max(0, Math.min(1, t));
  const nearestX = x1 + t * dx;
  const nearestY = y1 + t * dy;
  const distX = px - nearestX;
  const distY = py - nearestY;
  return Math.sqrt(distX * distX + distY * distY);
}

function spawnEnemy() {
  if (gameState.enemiesSpawned >= gameState.enemiesPerWave) {
    gameState.waveActive = false;
    return;
  }

  if (Date.now() - gameState.lastSpawn > gameState.spawnInterval) {
    const enemyType = getEnemyTypeForWave(
      gameState.wave,
      gameState.enemiesSpawned,
    );
    gameState.enemies.push(
      new Enemy(enemyType, gameState.wave, gameState.level),
    );
    gameState.enemiesSpawned++;
    gameState.lastSpawn = Date.now();
  }
}

function getEnemyTypeForWave(wave, spawnCount) {
  if (wave >= 5 && spawnCount % 10 === 9) return "boss";
  if (wave >= 3 && spawnCount % 5 === 0) return "tank";
  if (wave >= 2 && spawnCount % 3 === 0) return "fast";
  return "normal";
}

function updateDisplay() {
  waveDisplay.textContent = `${gameState.level}-${gameState.wave}`;
  scoreDisplay.textContent = gameState.score;
  goldDisplay.textContent = gameState.gold;
  livesDisplay.textContent = gameState.lives;
}

function showWaveNotification(wave, level) {
  waveNotificationText.textContent = level
    ? `Level ${level} - Wave ${wave}`
    : `Wave ${wave}`;
  waveNotification.classList.remove("hidden");
  setTimeout(() => {
    waveNotification.classList.add("hidden");
  }, 2000);
}

function gameLoop() {
  if (!gameState.gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPath();
  drawUI();

  if (gameState.waveActive) {
    spawnEnemy();
  }

  for (let i = gameState.enemies.length - 1; i >= 0; i--) {
    const enemy = gameState.enemies[i];
    const reachedEnd = enemy.update();

    if (reachedEnd) {
      gameState.enemies.splice(i, 1);
      gameState.lives--;
      updateDisplay();
      if (gameState.lives <= 0) {
        endGame(false);
        return;
      }
    } else if (enemy.health <= 0) {
      gameState.enemies.splice(i, 1);
    } else {
      enemy.draw();
    }
  }

  for (const tower of gameState.towers) {
    tower.update();
    tower.draw();
  }

  for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
    const projectile = gameState.projectiles[i];
    const shouldRemove = projectile.update();

    if (shouldRemove) {
      gameState.projectiles.splice(i, 1);
    } else {
      projectile.draw();
    }
  }

  if (!gameState.waveActive && gameState.enemies.length === 0) {
    gameState.wave++;
    if (gameState.wave > MAX_WAVES) {
      advanceLevel();
      return;
    }
    gameState.gold += 25 + gameState.wave * 2;
    updateDisplay();
    showWaveNotification(gameState.wave, gameState.level);
    setTimeout(() => startWave(), 3000);
  }

  requestAnimationFrame(gameLoop);
}

function advanceLevel() {
  const prevLevel = gameState.level;
  gameState.level++;

  if (gameState.level > MAX_LEVELS) {
    endGame(true);
    return;
  }

  gameState.wave = 1;
  gameState.towers = [];
  gameState.projectiles = [];
  gameState.selectedTower = null;
  gameState.gold = Math.floor(gameState.gold * 0.7) + 50;
  gameState.lives = Math.min(gameState.lives + 5, 20);

  updateDisplay();
  showLevelNotification(prevLevel, gameState.level);

  setTimeout(() => {
    showWaveNotification(gameState.wave, gameState.level);
    startWave();
    requestAnimationFrame(gameLoop);
  }, 4000);
}

function showLevelNotification(completedLevel, nextLevel) {
  waveNotificationText.textContent = `Level ${completedLevel} Complete! Starting Level ${nextLevel}`;
  waveNotification.classList.remove("hidden");
  setTimeout(() => {
    waveNotification.classList.add("hidden");
  }, 3000);
}

function drawUI() {
  const types = Object.keys(TOWER_TYPES);
  const boxWidth = 120;
  const boxHeight = 60;
  const startX = 10;
  const startY = 10;

  types.forEach((type, i) => {
    const stats = TOWER_TYPES[type];
    const x = startX + i * (boxWidth + 10);
    const isSelected = gameState.selectedTowerType === type;

    ctx.fillStyle = isSelected
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x, startY, boxWidth, boxHeight);
    ctx.strokeStyle = isSelected ? "#ffffff" : stats.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, startY, boxWidth, boxHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${i + 1}. ${stats.name}`, x + 5, startY + 20);
    ctx.font = "10px monospace";
    ctx.fillText(`Cost: ${stats.cost}`, x + 5, startY + 35);
    ctx.fillText(
      `DMG: ${stats.damage} RNG: ${stats.range}`,
      x + 5,
      startY + 50,
    );
  });

  if (gameState.selectedTower) {
    const tower = gameState.selectedTower;
    const x = canvas.width - 150;
    const y = 10;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(x, y, 140, 100);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 140, 100);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `${TOWER_TYPES[tower.type].name} L${tower.level}`,
      x + 5,
      y + 20,
    );
    ctx.font = "10px monospace";
    ctx.fillText(`DMG: ${Math.floor(tower.damage)}`, x + 5, y + 35);
    ctx.fillText(`RNG: ${Math.floor(tower.range)}`, x + 5, y + 50);

    if (tower.level < 3) {
      const cost = tower.getUpgradeCost();
      ctx.fillText(`U: Upgrade ($${cost})`, x + 5, y + 70);
    } else {
      ctx.fillText("MAX LEVEL", x + 5, y + 70);
    }

    const sellValue = Math.floor(
      TOWER_TYPES[tower.type].cost * 0.6 * tower.level,
    );
    ctx.fillText(`S: Sell ($${sellValue})`, x + 5, y + 85);
  }
}

function drawPath() {
  ctx.strokeStyle = "#556b2f";
  ctx.lineWidth = 40;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.stroke();

  ctx.fillStyle = "#ff0000";
  ctx.fillRect(
    path[path.length - 1].x - 15,
    path[path.length - 1].y - 15,
    30,
    30,
  );
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    path[path.length - 1].x - 15,
    path[path.length - 1].y - 15,
    30,
    30,
  );
}

function endGame(victory) {
  gameState.gameRunning = false;

  if (victory) {
    victoryScoreDisplay.textContent = gameState.score;
    victoryScreen.classList.remove("hidden");
  } else {
    finalScoreDisplay.textContent = gameState.score;
    const totalWaves = (gameState.level - 1) * MAX_WAVES + (gameState.wave - 1);
    wavesCompletedDisplay.textContent = `${totalWaves} (Level ${gameState.level})`;
    gameOverScreen.classList.remove("hidden");
  }
}

if (typeof window !== "undefined") {
  window.initTowerDefense = initTowerDefense;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
