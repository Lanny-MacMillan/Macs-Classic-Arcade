(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const playerHealthBar = document.getElementById("player-health");
  const bossHealthBar = document.getElementById("boss-health");
  const startScreen = document.getElementById("start-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  const gameOverTitle = document.getElementById("game-over-title");
  const gameOverMessage = document.getElementById("game-over-message");
  const startBtn = document.getElementById("start-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const restartBtn = document.getElementById("restart-btn");
  const backBtn = document.getElementById("back-btn");

  canvas.width = 800;
  canvas.height = 600;

  const PLAYER_SIZE = 20;
  const PLAYER_SPEED = 5;
  const PLAYER_MAX_HEALTH = 100;
  const BOSS_SIZE = 80;

  const LEVEL_CONFIG = [
    {
      level: 1,
      bossHealth: 300,
      patternDelay: 140,
      projectileSpeed: 2.5,
      shootCooldown: 15,
      bulletCount: 1,
      name: "Guardian Awakened",
    },
    {
      level: 2,
      bossHealth: 450,
      patternDelay: 120,
      projectileSpeed: 3,
      shootCooldown: 12,
      bulletCount: 1,
      name: "Guardian Enraged",
    },
    {
      level: 3,
      bossHealth: 600,
      patternDelay: 100,
      projectileSpeed: 3.5,
      shootCooldown: 10,
      bulletCount: 2,
      name: "Guardian Empowered",
    },
    {
      level: 4,
      bossHealth: 1100,
      patternDelay: 85,
      projectileSpeed: 4,
      shootCooldown: 8,
      bulletCount: 2,
      name: "Guardian Ascended",
    },
    {
      level: 5,
      bossHealth: 1800,
      patternDelay: 70,
      projectileSpeed: 4.5,
      shootCooldown: 6,
      bulletCount: 3,
      name: "Guardian Supreme",
    },
  ];

  const PROJECTILE_SIZE = 8;
  const PLAYER_PROJECTILE_SPEED = 7;
  const PLAYER_PROJECTILE_SIZE = 6;

  let gameRunning = false;
  let animationId;
  let patternIndex = 0;
  let patternCooldown = 0;
  let shootCooldown = 0;
  let currentLevel = 0;
  let levelConfig;

  let player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    size: PLAYER_SIZE,
    speed: PLAYER_SPEED,
    health: PLAYER_MAX_HEALTH,
    dx: 0,
    dy: 0,
  };

  let boss = {
    x: canvas.width / 2,
    y: 100,
    size: BOSS_SIZE,
    health: 0,
    maxHealth: 0,
    phase: 0,
  };

  let projectiles = [];
  let playerProjectiles = [];
  let keys = {};

  const patterns = [
    { name: "spread", execute: spreadPattern },
    { name: "spiral", execute: spiralPattern },
    { name: "wave", execute: wavePattern },
    { name: "cross", execute: crossPattern },
    { name: "circle", execute: circlePattern },
  ];

  function spreadPattern() {
    const count = 7;
    const angleSpread = Math.PI / 3;
    const startAngle = Math.PI / 2 - angleSpread / 2;
    const speed = levelConfig.projectileSpeed;
    for (let i = 0; i < count; i++) {
      const angle = startAngle + (angleSpread / (count - 1)) * i;
      projectiles.push({
        x: boss.x,
        y: boss.y + boss.size / 2,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: PROJECTILE_SIZE,
      });
    }
  }

  function spiralPattern() {
    const count = 12;
    const offset = (Date.now() / 50) % (Math.PI * 2);
    const speed = levelConfig.projectileSpeed;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + offset;
      projectiles.push({
        x: boss.x,
        y: boss.y + boss.size / 2,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: PROJECTILE_SIZE,
      });
    }
  }

  function wavePattern() {
    const count = 5;
    const spacing = canvas.width / (count + 1);
    const speed = levelConfig.projectileSpeed;
    for (let i = 0; i < count; i++) {
      projectiles.push({
        x: spacing * (i + 1),
        y: boss.y + boss.size / 2,
        dx: Math.sin((i / count) * Math.PI * 2) * speed * 0.5,
        dy: speed,
        size: PROJECTILE_SIZE,
      });
    }
  }

  function crossPattern() {
    const directions = [
      { dx: 0, dy: 1 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0.707, dy: 0.707 },
      { dx: -0.707, dy: 0.707 },
    ];
    const speed = levelConfig.projectileSpeed;
    directions.forEach((dir) => {
      projectiles.push({
        x: boss.x,
        y: boss.y + boss.size / 2,
        dx: dir.dx * speed,
        dy: dir.dy * speed,
        size: PROJECTILE_SIZE,
      });
    });
  }

  function circlePattern() {
    const count = 16;
    const speed = levelConfig.projectileSpeed;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      projectiles.push({
        x: boss.x,
        y: boss.y + boss.size / 2,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: PROJECTILE_SIZE,
      });
    }
  }

  function initGame() {
    levelConfig = LEVEL_CONFIG[currentLevel];

    player = {
      x: canvas.width / 2,
      y: canvas.height - 100,
      size: PLAYER_SIZE,
      speed: PLAYER_SPEED,
      health: PLAYER_MAX_HEALTH,
      dx: 0,
      dy: 0,
    };

    boss = {
      x: canvas.width / 2,
      y: 100,
      size: BOSS_SIZE,
      health: levelConfig.bossHealth,
      maxHealth: levelConfig.bossHealth,
      phase: 0,
    };

    projectiles = [];
    playerProjectiles = [];
    patternIndex = 0;
    patternCooldown = levelConfig.patternDelay;
    shootCooldown = 0;
    updateHealthBars();
    updateLevelDisplay();
  }

  function updateHealthBars() {
    const playerPercent = (player.health / PLAYER_MAX_HEALTH) * 100;
    const bossPercent = (boss.health / boss.maxHealth) * 100;
    playerHealthBar.style.width = playerPercent + "%";
    bossHealthBar.style.width = bossPercent + "%";
  }

  function updateLevelDisplay() {
    const levelDisplay = document.getElementById("level-display");
    const upgradeDisplay = document.getElementById("upgrade-display");
    levelDisplay.textContent = `Level ${levelConfig.level}: ${levelConfig.name}`;

    const upgrades = [];
    if (levelConfig.bulletCount > 1)
      upgrades.push(`${levelConfig.bulletCount}x Shot`);
    if (levelConfig.shootCooldown <= 10) upgrades.push("Rapid Fire");
    upgradeDisplay.textContent =
      upgrades.length > 0 ? upgrades.join(" + ") : "Standard Shot";
  }

  function handleInput() {
    player.dx = 0;
    player.dy = 0;

    if (keys["ArrowLeft"] || keys["a"]) player.dx = -player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.dx = player.speed;
    if (keys["ArrowUp"] || keys["w"]) player.dy = -player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.dy = player.speed;

    if (player.dx !== 0 && player.dy !== 0) {
      player.dx *= 0.707;
      player.dy *= 0.707;
    }

    if (keys[" "] && shootCooldown <= 0) {
      shoot();
      shootCooldown = levelConfig.shootCooldown;
    }
    if (shootCooldown > 0) shootCooldown--;
  }

  function shoot() {
    const bulletCount = levelConfig.bulletCount;
    if (bulletCount === 1) {
      playerProjectiles.push({
        x: player.x,
        y: player.y,
        size: PLAYER_PROJECTILE_SIZE,
      });
    } else if (bulletCount === 2) {
      playerProjectiles.push(
        {
          x: player.x - 8,
          y: player.y,
          size: PLAYER_PROJECTILE_SIZE,
        },
        {
          x: player.x + 8,
          y: player.y,
          size: PLAYER_PROJECTILE_SIZE,
        },
      );
    } else if (bulletCount === 3) {
      playerProjectiles.push(
        {
          x: player.x - 12,
          y: player.y,
          size: PLAYER_PROJECTILE_SIZE,
        },
        {
          x: player.x,
          y: player.y,
          size: PLAYER_PROJECTILE_SIZE,
        },
        {
          x: player.x + 12,
          y: player.y,
          size: PLAYER_PROJECTILE_SIZE,
        },
      );
    }
  }

  function updatePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    player.x = Math.max(
      player.size,
      Math.min(canvas.width - player.size, player.x),
    );
    player.y = Math.max(
      player.size,
      Math.min(canvas.height - player.size, player.y),
    );
  }

  function updateBoss() {
    boss.x += Math.sin(Date.now() / 1000) * 2;
    boss.x = Math.max(boss.size, Math.min(canvas.width - boss.size, boss.x));

    if (patternCooldown <= 0) {
      patterns[patternIndex].execute();
      patternIndex = (patternIndex + 1) % patterns.length;
      patternCooldown = levelConfig.patternDelay;
    } else {
      patternCooldown--;
    }
  }

  function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const proj = projectiles[i];
      proj.x += proj.dx;
      proj.y += proj.dy;

      if (
        proj.x < 0 ||
        proj.x > canvas.width ||
        proj.y < 0 ||
        proj.y > canvas.height
      ) {
        projectiles.splice(i, 1);
        continue;
      }

      const dist = Math.hypot(proj.x - player.x, proj.y - player.y);
      if (dist < player.size + proj.size) {
        player.health -= 10;
        projectiles.splice(i, 1);
        updateHealthBars();
        if (player.health <= 0) {
          endGame(false);
        }
      }
    }
  }

  function updatePlayerProjectiles() {
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
      const proj = playerProjectiles[i];
      proj.y -= PLAYER_PROJECTILE_SPEED;

      if (proj.y < 0) {
        playerProjectiles.splice(i, 1);
        continue;
      }

      const dist = Math.hypot(proj.x - boss.x, proj.y - boss.y);
      if (dist < boss.size / 2 + proj.size) {
        boss.health -= 5;
        playerProjectiles.splice(i, 1);
        updateHealthBars();
        if (boss.health <= 0) {
          endGame(true);
        }
      }
    }
  }

  function draw() {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff3366";
    ctx.shadowColor = "#ff3366";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, boss.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#00ff88";
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffaa00";
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 10;
    projectiles.forEach((proj) => {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size / 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#00d4ff";
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 8;
    playerProjectiles.forEach((proj) => {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size / 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  function gameLoop() {
    if (!gameRunning) return;

    handleInput();
    updatePlayer();
    updateBoss();
    updateProjectiles();
    updatePlayerProjectiles();
    draw();

    animationId = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    currentLevel = 0;
    initGame();
    gameRunning = true;
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameLoop();
  }

  function nextLevel() {
    currentLevel++;
    if (currentLevel >= LEVEL_CONFIG.length) {
      endGame(true, true);
      return;
    }
    initGame();
    gameRunning = true;
    gameOverScreen.classList.add("hidden");
    gameLoop();
  }

  function endGame(victory, finalVictory = false) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    gameOverScreen.classList.remove("hidden");

    const nextBtn = document.getElementById("next-level-btn");
    const playAgainBtn = document.getElementById("play-again-btn");

    if (victory && !finalVictory) {
      gameOverTitle.textContent = "Level Complete!";
      gameOverMessage.textContent = `${levelConfig.name} defeated! Prepare for the next challenge...`;
      nextBtn.classList.remove("hidden");
      playAgainBtn.classList.add("hidden");
    } else if (finalVictory) {
      gameOverTitle.textContent = "Ultimate Victory!";
      gameOverMessage.textContent =
        "You have defeated all guardians and proven your worth!";
      nextBtn.classList.add("hidden");
      playAgainBtn.classList.remove("hidden");
    } else {
      gameOverTitle.textContent = "Defeated";
      gameOverMessage.textContent = `${levelConfig.name} has proven too powerful...`;
      nextBtn.classList.add("hidden");
      playAgainBtn.classList.remove("hidden");
    }
  }

  function restartGame() {
    if (gameRunning) {
      cancelAnimationFrame(animationId);
    }
    startGame();
  }

  const nextLevelBtn = document.getElementById("next-level-btn");

  startBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", restartGame);
  nextLevelBtn.addEventListener("click", nextLevel);
  restartBtn.addEventListener("click", restartGame);

  backBtn.addEventListener("click", () => {
    if (gameRunning) {
      gameRunning = false;
      cancelAnimationFrame(animationId);
    }
    window.location.href = "../../index.html";
  });

  document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });
})();
