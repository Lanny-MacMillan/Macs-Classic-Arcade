const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("start-screen");
const upgradeScreen = document.getElementById("upgrade-screen");
const upgradeOptions = document.getElementById("upgrade-options");
const gameOverScreen = document.getElementById("game-over-screen");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const backBtn = document.getElementById("back-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const levelSpan = document.getElementById("level");
const killsSpan = document.getElementById("kills");
const finalLevelSpan = document.getElementById("final-level");
const finalKillsSpan = document.getElementById("final-kills");

canvas.width = 800;
canvas.height = 600;

const keys = {};
let gameRunning = false;
let gamePaused = false;
let lastTime = 0;

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 12,
  speed: 200,
  hp: 100,
  maxHp: 100,
  xp: 0,
  xpToLevel: 10,
  level: 1,
  kills: 0,
};

const weapon = {
  damage: 10,
  fireRate: 1000,
  lastFire: 0,
  projectileSpeed: 300,
  range: 400,
  projectileCount: 1,
};

const enemies = [];
const projectiles = [];
const xpOrbs = [];

let enemySpawnRate = 2000;
let lastSpawn = 0;
let enemySpeedMultiplier = 1;
let enemyHpMultiplier = 1;
let enemyDamageMultiplier = 1;

const upgrades = [
  { name: "Damage Up", desc: "+5 Damage", apply: () => (weapon.damage += 5) },
  {
    name: "Fire Rate Up",
    desc: "-200ms cooldown",
    apply: () => (weapon.fireRate = Math.max(200, weapon.fireRate - 200)),
  },
  {
    name: "Movement Speed",
    desc: "+50 Speed",
    apply: () => (player.speed += 50),
  },
  {
    name: "Max HP Up",
    desc: "+20 Max HP",
    apply: () => {
      player.maxHp += 20;
      player.hp += 20;
    },
  },
  {
    name: "Projectile Range",
    desc: "+100 Range",
    apply: () => (weapon.range += 100),
  },
  {
    name: "Additional Projectile",
    desc: "+1 Projectile",
    apply: () => (weapon.projectileCount += 1),
  },
  {
    name: "Heal",
    desc: "Restore 50 HP",
    apply: () => (player.hp = Math.min(player.maxHp, player.hp + 50)),
  },
];

function init() {
  enemies.length = 0;
  projectiles.length = 0;
  xpOrbs.length = 0;

  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.hp = 100;
  player.maxHp = 100;
  player.xp = 0;
  player.xpToLevel = 10;
  player.level = 1;
  player.kills = 0;
  player.speed = 200;

  weapon.damage = 10;
  weapon.fireRate = 1000;
  weapon.projectileSpeed = 300;
  weapon.range = 400;
  weapon.projectileCount = 1;

  enemySpawnRate = 2000;
  enemySpeedMultiplier = 1;
  enemyHpMultiplier = 1;
  enemyDamageMultiplier = 1;
  lastSpawn = 0;

  updateUI();
}

function startGame() {
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  init();
  gameRunning = true;
  gamePaused = false;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  startGame();
}

function gameLoop(currentTime) {
  if (!gameRunning) return;

  if (gamePaused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  update(deltaTime, currentTime);
  render();

  requestAnimationFrame(gameLoop);
}

function update(dt, time) {
  movePlayer(dt);
  spawnEnemies(time);
  updateEnemies(dt);
  updateProjectiles(dt);
  updateXpOrbs(dt);
  fireWeapon(time);
  checkCollisions();

  if (player.hp <= 0) {
    gameOver();
  }
}

function movePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (keys["w"] || keys["ArrowUp"]) dy -= 1;
  if (keys["s"] || keys["ArrowDown"]) dy += 1;
  if (keys["a"] || keys["ArrowLeft"]) dx -= 1;
  if (keys["d"] || keys["ArrowRight"]) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;

    player.x += dx * player.speed * dt;
    player.y += dy * player.speed * dt;

    player.x = Math.max(
      player.radius,
      Math.min(canvas.width - player.radius, player.x),
    );
    player.y = Math.max(
      player.radius,
      Math.min(canvas.height - player.radius, player.y),
    );
  }
}

function spawnEnemies(time) {
  if (time - lastSpawn > enemySpawnRate) {
    lastSpawn = time;

    const enemiesToSpawn = Math.min(1 + Math.floor(player.level / 5), 3);

    for (let i = 0; i < enemiesToSpawn; i++) {
      const side = Math.floor(Math.random() * 4);
      let x, y;

      if (side === 0) {
        x = Math.random() * canvas.width;
        y = -20;
      } else if (side === 1) {
        x = canvas.width + 20;
        y = Math.random() * canvas.height;
      } else if (side === 2) {
        x = Math.random() * canvas.width;
        y = canvas.height + 20;
      } else {
        x = -20;
        y = Math.random() * canvas.height;
      }

      enemies.push({
        x: x,
        y: y,
        radius: 10,
        speed: 80 * enemySpeedMultiplier,
        hp: 20 * enemyHpMultiplier,
        maxHp: 20 * enemyHpMultiplier,
        damage: 10 * enemyDamageMultiplier,
      });
    }
  }
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      enemy.x += (dx / dist) * enemy.speed * dt;
      enemy.y += (dy / dist) * enemy.speed * dt;
    }

    if (enemy.hp <= 0) {
      enemies.splice(i, 1);
      player.kills++;
      updateUI();

      xpOrbs.push({
        x: enemy.x,
        y: enemy.y,
        radius: 6,
        xp: 5,
      });
    }
  }
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];

    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.traveled += weapon.projectileSpeed * dt;

    if (
      proj.traveled > weapon.range ||
      proj.x < 0 ||
      proj.x > canvas.width ||
      proj.y < 0 ||
      proj.y > canvas.height
    ) {
      projectiles.splice(i, 1);
    }
  }
}

function updateXpOrbs(dt) {
  const pickupRange = 100;

  for (let i = xpOrbs.length - 1; i >= 0; i--) {
    const orb = xpOrbs[i];

    const dx = player.x - orb.x;
    const dy = player.y - orb.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < pickupRange) {
      orb.x += (dx / dist) * 300 * dt;
      orb.y += (dy / dist) * 300 * dt;
    }

    if (dist < player.radius + orb.radius) {
      xpOrbs.splice(i, 1);
      addXp(orb.xp);
    }
  }
}

function fireWeapon(time) {
  if (time - weapon.lastFire < weapon.fireRate) return;

  let nearestEnemy = null;
  let nearestDist = Infinity;

  for (const enemy of enemies) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < nearestDist) {
      nearestDist = dist;
      nearestEnemy = enemy;
    }
  }

  if (nearestEnemy) {
    weapon.lastFire = time;

    const dx = nearestEnemy.x - player.x;
    const dy = nearestEnemy.y - player.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const baseAngle = Math.atan2(dy, dx);

    const spreadAngle = weapon.projectileCount > 1 ? 0.3 : 0;
    const angleStep =
      weapon.projectileCount > 1
        ? spreadAngle / (weapon.projectileCount - 1)
        : 0;

    for (let i = 0; i < weapon.projectileCount; i++) {
      const offset =
        weapon.projectileCount > 1 ? -spreadAngle / 2 + angleStep * i : 0;
      const angle = baseAngle + offset;

      projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * weapon.projectileSpeed,
        vy: Math.sin(angle) * weapon.projectileSpeed,
        radius: 4,
        damage: weapon.damage,
        traveled: 0,
      });
    }
  }
}

function checkCollisions() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];

    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];

      const dx = proj.x - enemy.x;
      const dy = proj.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < proj.radius + enemy.radius) {
        enemy.hp -= proj.damage;
        projectiles.splice(i, 1);
        break;
      }
    }
  }

  for (const enemy of enemies) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < player.radius + enemy.radius) {
      player.hp -= enemy.damage * 0.5 * (1 / 60);
      player.hp = Math.max(0, player.hp);
    }
  }
}

function addXp(amount) {
  player.xp += amount;

  if (player.xp >= player.xpToLevel) {
    player.xp -= player.xpToLevel;
    player.level++;
    player.xpToLevel = Math.floor(player.xpToLevel * 1.5);

    enemySpeedMultiplier += 0.15;
    enemyHpMultiplier += 0.3;
    enemyDamageMultiplier += 0.08;
    enemySpawnRate = Math.max(1200, enemySpawnRate - 50);

    levelUp();
  }
}

function levelUp() {
  gamePaused = true;
  upgradeScreen.classList.remove("hidden");

  const availableUpgrades = [];
  const projectileUpgrade = upgrades.find(
    (u) => u.name === "Additional Projectile",
  );

  if (player.level >= 5 && projectileUpgrade) {
    if (player.level % 5 === 0) {
      availableUpgrades.push(projectileUpgrade);
    } else if (Math.random() < 0.15) {
      availableUpgrades.push(projectileUpgrade);
    }
  }

  while (
    availableUpgrades.length < 3 &&
    availableUpgrades.length < upgrades.length
  ) {
    const upgrade = upgrades[Math.floor(Math.random() * upgrades.length)];
    if (!availableUpgrades.includes(upgrade)) {
      availableUpgrades.push(upgrade);
    }
  }

  upgradeOptions.innerHTML = "";
  availableUpgrades.forEach((upgrade) => {
    const btn = document.createElement("button");
    btn.className = "upgrade-btn";
    btn.innerHTML = `<strong>${upgrade.name}</strong>${upgrade.desc}`;
    btn.onclick = () => selectUpgrade(upgrade);
    upgradeOptions.appendChild(btn);
  });

  updateUI();
}

function selectUpgrade(upgrade) {
  upgrade.apply();
  upgradeScreen.classList.add("hidden");
  gamePaused = false;
}

function render() {
  ctx.fillStyle = "#1a0033";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  xpOrbs.forEach((orb) => {
    ctx.fillStyle = "#00ffff";
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  enemies.forEach((enemy) => {
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    const hpPercent = enemy.hp / enemy.maxHp;
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(enemy.x - 15, enemy.y - 20, 30 * hpPercent, 3);
  });

  projectiles.forEach((proj) => {
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#00ff00";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  const hpPercent = player.hp / player.maxHp;
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(10, 10, 200, 20);
  ctx.fillStyle = "#00ff00";
  ctx.fillRect(10, 10, 200 * hpPercent, 20);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(10, 10, 200, 20);
  ctx.fillStyle = "#fff";
  ctx.font = "12px Courier New";
  ctx.fillText(`HP: ${Math.floor(player.hp)}/${player.maxHp}`, 15, 24);

  const xpPercent = player.xp / player.xpToLevel;
  ctx.fillStyle = "#444";
  ctx.fillRect(10, 35, 200, 15);
  ctx.fillStyle = "#00ffff";
  ctx.fillRect(10, 35, 200 * xpPercent, 15);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(10, 35, 200, 15);
  ctx.fillStyle = "#fff";
  ctx.font = "10px Courier New";
  ctx.fillText(`XP: ${player.xp}/${player.xpToLevel}`, 15, 46);
}

function updateUI() {
  levelSpan.textContent = player.level;
  killsSpan.textContent = player.kills;
}

function gameOver() {
  gameRunning = false;
  finalLevelSpan.textContent = player.level;
  finalKillsSpan.textContent = player.kills;
  gameOverScreen.classList.remove("hidden");
}

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
playAgainBtn.addEventListener("click", startGame);
backBtn.addEventListener("click", () => {
  window.location.href = "../../index.html";
});
