const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

const TILE_SIZE = 40;
const ROOM_WIDTH = 20;
const ROOM_HEIGHT = 15;

const keys = {};
const projectiles = [];
const enemies = [];
const items = [];
let gameState = "playing";
let currentRoom = 1;

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 16;
    this.speed = 3;
    this.hp = 100;
    this.maxHp = 100;
    this.weapon = this.createBasicWeapon();
    this.lastShot = 0;
    this.keyCount = 0;
    this.shootAngle = 0;
  }

  createBasicWeapon() {
    return {
      name: "Basic Pistol",
      fireRate: 300,
      damage: 10,
      speed: 6,
      range: 400,
      modifiers: [],
    };
  }

  update() {
    let dx = 0;
    let dy = 0;

    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) dx -= 1;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) dx += 1;
    if (keys["ArrowUp"] || keys["w"] || keys["W"]) dy -= 1;
    if (keys["ArrowDown"] || keys["s"] || keys["S"]) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      const newX = this.x + dx * this.speed;
      const newY = this.y + dy * this.speed;

      if (!this.checkCollision(newX, newY)) {
        this.x = newX;
        this.y = newY;
      }
    }

    if (enemies.length > 0) {
      const nearest = this.getNearestEnemy();
      if (nearest) {
        this.shootAngle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
      }
    }

    if (
      Date.now() - this.lastShot > this.weapon.fireRate &&
      enemies.length > 0
    ) {
      this.shoot();
      this.lastShot = Date.now();
    }

    this.checkItemPickup();
    this.checkDoorCollision();
  }

  getNearestEnemy() {
    let nearest = null;
    let minDist = Infinity;

    for (const enemy of enemies) {
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    return nearest;
  }

  shoot() {
    const weapon = this.weapon;
    const baseAngle = this.shootAngle;

    const applyModifier = (proj, modifier) => {
      switch (modifier) {
        case "piercing":
          proj.piercing = true;
          break;
        case "bounce":
          proj.bounces = 3;
          break;
        case "multishot":
          break;
        case "spread":
          break;
        case "orbit":
          proj.orbiting = true;
          proj.orbitAngle = 0;
          proj.orbitRadius = 40;
          break;
      }
    };

    if (weapon.modifiers.includes("multishot")) {
      for (let i = 0; i < 3; i++) {
        const angle = baseAngle + (i - 1) * 0.15;
        const proj = this.createProjectile(angle);
        weapon.modifiers.forEach((mod) => applyModifier(proj, mod));
        projectiles.push(proj);
      }
    } else if (weapon.modifiers.includes("spread")) {
      for (let i = 0; i < 3; i++) {
        const angle = baseAngle + (i - 1) * 0.4;
        const proj = this.createProjectile(angle);
        weapon.modifiers.forEach((mod) => applyModifier(proj, mod));
        projectiles.push(proj);
      }
    } else if (weapon.modifiers.includes("orbit")) {
      for (let i = 0; i < 4; i++) {
        const proj = this.createProjectile(baseAngle);
        proj.orbiting = true;
        proj.orbitAngle = ((Math.PI * 2) / 4) * i;
        proj.orbitRadius = 50;
        projectiles.push(proj);
      }
    } else {
      const randomOffset = weapon.modifiers.includes("inaccurate")
        ? (Math.random() - 0.5) * 0.3
        : 0;
      const proj = this.createProjectile(baseAngle + randomOffset);
      weapon.modifiers.forEach((mod) => applyModifier(proj, mod));
      projectiles.push(proj);
    }
  }

  createProjectile(angle) {
    return {
      x: this.x,
      y: this.y,
      vx: Math.cos(angle) * this.weapon.speed,
      vy: Math.sin(angle) * this.weapon.speed,
      damage: this.weapon.damage,
      lifetime: this.weapon.range,
      maxLifetime: this.weapon.range,
      size: 4,
      color: this.weapon.color || "#ffff00",
      piercing: false,
      bounces: 0,
      orbiting: false,
    };
  }

  checkCollision(x, y) {
    const doorWidth = 60;
    const doorX = canvas.width / 2;
    const inDoorwayX = Math.abs(x - doorX) < doorWidth / 2;

    if (x - this.size < 40 || x + this.size > canvas.width - 40) return true;
    if (y - this.size < 40) return true;
    if (y + this.size > canvas.height - 40 && !inDoorwayX) return true;

    for (const wall of room.walls) {
      if (
        x + this.size > wall.x &&
        x - this.size < wall.x + wall.width &&
        y + this.size > wall.y &&
        y - this.size < wall.y + wall.height
      ) {
        return true;
      }
    }

    return false;
  }

  checkItemPickup() {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const dist = Math.hypot(item.x - this.x, item.y - this.y);

      if (dist < this.size + item.size) {
        if (item.type === "weapon") {
          this.weapon = item.weapon;
          updateUI();
        } else if (item.type === "key") {
          this.keyCount++;
          updateUI();
        }
        items.splice(i, 1);
      }
    }
  }

  checkDoorCollision() {
    for (const door of room.doors) {
      const doorWidth = 60;
      const inDoorway =
        Math.abs(this.x - door.x) < doorWidth / 2 &&
        this.y > canvas.height - 60;

      if (inDoorway && room.cleared) {
        if (door.locked) {
          if (this.keyCount > 0) {
            this.keyCount--;
            door.locked = false;
            door.open = true;
            updateUI();
            nextRoom();
            return;
          }
        } else if (door.open) {
          nextRoom();
          return;
        }
      }
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      gameOver();
    }
    updateUI();
  }

  draw() {
    ctx.fillStyle = "#44aaff";
    ctx.fillRect(
      this.x - this.size,
      this.y - this.size,
      this.size * 2,
      this.size * 2,
    );

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + Math.cos(this.shootAngle) * 20,
      this.y + Math.sin(this.shootAngle) * 20,
    );
    ctx.stroke();
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 14;
    this.speed = 1.5;
    this.hp = 30;
    this.maxHp = 30;
    this.damage = 5;
    this.lastHit = 0;
    this.hitCooldown = 1000;
  }

  update() {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 1) {
      const moveX = (dx / dist) * this.speed;
      const moveY = (dy / dist) * this.speed;

      if (!this.checkCollision(this.x + moveX, this.y + moveY)) {
        this.x += moveX;
        this.y += moveY;
      }
    }

    const playerDist = Math.hypot(player.x - this.x, player.y - this.y);
    if (playerDist < this.size + player.size) {
      if (Date.now() - this.lastHit > this.hitCooldown) {
        player.takeDamage(this.damage);
        this.lastHit = Date.now();
      }
    }
  }

  checkCollision(x, y) {
    for (const wall of room.walls) {
      if (
        x + this.size > wall.x &&
        x - this.size < wall.x + wall.width &&
        y + this.size > wall.y &&
        y - this.size < wall.y + wall.height
      ) {
        return true;
      }
    }
    return false;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      const index = enemies.indexOf(this);
      if (index > -1) enemies.splice(index, 1);

      if (Math.random() < 0.3) {
        dropItem(this.x, this.y);
      }
    }
  }

  draw() {
    ctx.fillStyle = "#ff4444";
    ctx.fillRect(
      this.x - this.size,
      this.y - this.size,
      this.size * 2,
      this.size * 2,
    );

    ctx.fillStyle = "#ff0000";
    const hpWidth = (this.hp / this.maxHp) * this.size * 2;
    ctx.fillRect(this.x - this.size, this.y - this.size - 8, hpWidth, 4);
  }
}

class Room {
  constructor() {
    this.walls = [];
    this.doors = [];
    this.cleared = false;
    this.generateRoom();
  }

  generateRoom() {
    const doorWidth = 60;
    const doorX = canvas.width / 2;

    this.walls = [
      { x: 0, y: 0, width: canvas.width, height: 40 },
      { x: 0, y: canvas.height - 40, width: doorX - doorWidth / 2, height: 40 },
      {
        x: doorX + doorWidth / 2,
        y: canvas.height - 40,
        width: canvas.width - (doorX + doorWidth / 2),
        height: 40,
      },
      { x: 0, y: 0, width: 40, height: canvas.height },
      { x: canvas.width - 40, y: 0, width: 40, height: canvas.height },
    ];

    const numObstacles = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numObstacles; i++) {
      let x, y, w, h, valid;
      let attempts = 0;

      do {
        w = 60 + Math.random() * 60;
        h = 60 + Math.random() * 60;
        x = 100 + Math.random() * (canvas.width - 200 - w);
        y = 150 + Math.random() * (canvas.height - 300 - h);

        const spawnSafeZone = 80;
        const spawnX = canvas.width / 2;
        const spawnY1 = 100;
        const spawnY2 = canvas.height / 2;

        const overlapSpawn1 = !(
          x > spawnX + spawnSafeZone ||
          x + w < spawnX - spawnSafeZone ||
          y > spawnY1 + spawnSafeZone ||
          y + h < spawnY1 - spawnSafeZone
        );
        const overlapSpawn2 = !(
          x > spawnX + spawnSafeZone ||
          x + w < spawnX - spawnSafeZone ||
          y > spawnY2 + spawnSafeZone ||
          y + h < spawnY2 - spawnSafeZone
        );

        valid = !overlapSpawn1 && !overlapSpawn2;
        attempts++;
      } while (!valid && attempts < 20);

      if (valid) {
        this.walls.push({ x, y, width: w, height: h });
      }
    }

    const needsKey = currentRoom % 3 === 0;
    this.doors = [
      { x: doorX, y: canvas.height - 10, open: false, locked: needsKey },
    ];
  }

  update() {
    if (!this.cleared && enemies.length === 0) {
      this.cleared = true;
      this.doors.forEach((door) => {
        if (!door.locked) {
          door.open = true;
        }
      });
    }
  }

  draw() {
    ctx.fillStyle = "#333333";
    this.walls.forEach((wall) => {
      ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });

    this.doors.forEach((door) => {
      if (door.locked && this.cleared) {
        ctx.fillStyle = "#ffaa00";
      } else {
        ctx.fillStyle = door.open ? "#44ff44" : "#ff4444";
      }
      ctx.fillRect(door.x - 20, door.y - 10, 40, 20);

      if (door.locked && this.cleared) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.fillText("KEY", door.x, door.y + 5);
      }
    });
  }
}

function generateWeapon() {
  const fireRates = [200, 300, 400, 600, 800];
  const damages = [8, 12, 15, 20, 25];
  const speeds = [4, 6, 8, 10];
  const ranges = [300, 400, 500];
  const colors = ["#ffff00", "#ff00ff", "#00ffff", "#ff8800", "#88ff00"];

  const modifierPool = [
    "piercing",
    "bounce",
    "multishot",
    "spread",
    "orbit",
    "inaccurate",
  ];
  const selectedModifiers = [];
  const modCount = Math.random() < 0.6 ? 1 : 2;

  for (let i = 0; i < modCount; i++) {
    const mod = modifierPool[Math.floor(Math.random() * modifierPool.length)];
    if (!selectedModifiers.includes(mod)) {
      selectedModifiers.push(mod);
    }
  }

  const weapon = {
    name: generateWeaponName(selectedModifiers),
    fireRate: fireRates[Math.floor(Math.random() * fireRates.length)],
    damage: damages[Math.floor(Math.random() * damages.length)],
    speed: speeds[Math.floor(Math.random() * speeds.length)],
    range: ranges[Math.floor(Math.random() * ranges.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    modifiers: selectedModifiers,
  };

  return weapon;
}

function generateWeaponName(modifiers) {
  const prefixes = [
    "Rusty",
    "Ancient",
    "Cursed",
    "Blessed",
    "Strange",
    "Wild",
    "Swift",
    "Heavy",
  ];
  const types = ["Blaster", "Cannon", "Shooter", "Gun", "Rifle", "Pistol"];

  let name = prefixes[Math.floor(Math.random() * prefixes.length)] + " ";
  name += types[Math.floor(Math.random() * types.length)];

  return name;
}

function dropItem(x, y) {
  if (Math.random() < 0.6) {
    items.push({
      x,
      y,
      size: 12,
      type: "weapon",
      weapon: generateWeapon(),
    });
  } else {
    items.push({
      x,
      y,
      size: 10,
      type: "key",
    });
  }
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];

    if (proj.orbiting) {
      proj.orbitAngle += 0.1;
      proj.x = player.x + Math.cos(proj.orbitAngle) * proj.orbitRadius;
      proj.y = player.y + Math.sin(proj.orbitAngle) * proj.orbitRadius;
    } else {
      proj.x += proj.vx;
      proj.y += proj.vy;
    }

    proj.lifetime -= Math.hypot(proj.vx, proj.vy);

    if (proj.bounces > 0) {
      if (proj.x < 40 || proj.x > canvas.width - 40) {
        proj.vx *= -1;
        proj.bounces--;
      }
      if (proj.y < 40 || proj.y > canvas.height - 40) {
        proj.vy *= -1;
        proj.bounces--;
      }
    }

    let hitWall = false;
    for (const wall of room.walls) {
      if (
        proj.x > wall.x &&
        proj.x < wall.x + wall.width &&
        proj.y > wall.y &&
        proj.y < wall.y + wall.height
      ) {
        hitWall = true;
        break;
      }
    }

    if (proj.lifetime <= 0 || (hitWall && !proj.bounces && !proj.orbiting)) {
      projectiles.splice(i, 1);
      continue;
    }

    let hitEnemy = false;
    for (const enemy of enemies) {
      const dist = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
      if (dist < enemy.size + proj.size) {
        enemy.takeDamage(proj.damage);
        hitEnemy = true;
        if (!proj.piercing) break;
      }
    }

    if (hitEnemy && !proj.piercing && !proj.orbiting) {
      projectiles.splice(i, 1);
    }
  }
}

function spawnEnemies(count) {
  enemies.length = 0;
  for (let i = 0; i < count; i++) {
    let x, y, valid;
    do {
      x = 100 + Math.random() * (canvas.width - 200);
      y = 100 + Math.random() * (canvas.height - 200);
      valid = true;

      for (const wall of room.walls) {
        if (
          x > wall.x - 20 &&
          x < wall.x + wall.width + 20 &&
          y > wall.y - 20 &&
          y < wall.y + wall.height + 20
        ) {
          valid = false;
          break;
        }
      }

      if (Math.hypot(x - player.x, y - player.y) < 100) {
        valid = false;
      }
    } while (!valid);

    enemies.push(new Enemy(x, y));
  }
}

function nextRoom() {
  currentRoom++;
  projectiles.length = 0;
  items.length = 0;

  room = new Room();
  player.x = canvas.width / 2;
  player.y = 100;

  const enemyCount = Math.min(3 + Math.floor(currentRoom / 2), 10);
  spawnEnemies(enemyCount);

  const nextRoomIsLocked = (currentRoom + 1) % 3 === 0;

  if (nextRoomIsLocked && player.keyCount === 0) {
    items.push({
      x: 200 + Math.random() * (canvas.width - 400),
      y: 200 + Math.random() * (canvas.height - 400),
      size: 10,
      type: "key",
    });
  } else if (Math.random() < 0.4) {
    dropItem(
      200 + Math.random() * (canvas.width - 400),
      200 + Math.random() * (canvas.height - 400),
    );
  }
}

function gameOver() {
  gameState = "gameOver";
  document.getElementById("game-over").classList.remove("hidden");
  document.getElementById("final-room").textContent = currentRoom;
}

function restartGame() {
  gameState = "playing";
  currentRoom = 1;
  projectiles.length = 0;
  enemies.length = 0;
  items.length = 0;

  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.hp = player.maxHp;
  player.weapon = player.createBasicWeapon();
  player.keyCount = 0;

  room = new Room();
  spawnEnemies(3);

  document.getElementById("game-over").classList.add("hidden");
  updateUI();
}

function updateUI() {
  document.getElementById("hp-value").textContent = player.hp;
  document.getElementById("weapon-name").textContent = player.weapon.name;
  document.getElementById("key-count").textContent = player.keyCount;
}

function drawItems() {
  items.forEach((item) => {
    if (item.type === "weapon") {
      ctx.fillStyle = item.weapon.color;
      ctx.fillRect(
        item.x - item.size,
        item.y - item.size,
        item.size * 2,
        item.size * 2,
      );
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(
        item.x - item.size,
        item.y - item.size,
        item.size * 2,
        item.size * 2,
      );
    } else if (item.type === "key") {
      ctx.fillStyle = "#ffaa44";
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawProjectiles() {
  projectiles.forEach((proj) => {
    ctx.fillStyle = proj.color;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
    ctx.fill();

    if (proj.piercing) {
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }
  });
}

function gameLoop() {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (gameState === "playing") {
    room.update();
    room.draw();

    player.update();
    player.draw();

    enemies.forEach((enemy) => {
      enemy.update();
      enemy.draw();
    });

    updateProjectiles();
    drawProjectiles();
    drawItems();
  }

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

document.getElementById("back-btn").addEventListener("click", () => {
  window.parent.postMessage({ action: "backToArcade" }, "*");
});

document.getElementById("restart-btn").addEventListener("click", restartGame);

let player = new Player(canvas.width / 2, canvas.height / 2);
let room = new Room();
spawnEnemies(3);
updateUI();
gameLoop();

function initDungeonRandomWeapons(container) {
  container.innerHTML = `
        <div id="ui">
            <div id="stats">
                <div id="health">HP: <span id="hp-value">100</span></div>
                <div id="weapon-info">Weapon: <span id="weapon-name">Basic Pistol</span></div>
                <div id="keys">Keys: <span id="key-count">0</span></div>
            </div>
            <div id="game-over" class="hidden">
                <h2>Game Over</h2>
                <p>Final Room: <span id="final-room">1</span></p>
                <button id="restart-btn">Restart</button>
            </div>
        </div>
        <canvas id="game-canvas" width="800" height="600"></canvas>
    `;

  restartGame();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { initDungeonRandomWeapons };
}
