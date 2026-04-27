(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreElement = document.getElementById("score");
  const waveElement = document.getElementById("wave");
  const ammoElement = document.getElementById("ammo");
  const startScreen = document.getElementById("start-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  const gameOverMessage = document.getElementById("game-over-message");
  const finalScoreElement = document.getElementById("final-score");
  const startBtn = document.getElementById("start-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const restartBtn = document.getElementById("restart-btn");
  const backBtn = document.getElementById("back-btn");

  canvas.width = 800;
  canvas.height = 600;

  let gameRunning = false;
  let animationId;
  let score = 0;
  let wave = 1;
  let ammo = 10;
  let incomingMissiles = [];
  let defenseMissiles = [];
  let explosions = [];
  let cities = [];
  let batteries = [];
  let nextWaveTimeout = null;

  const GROUND_Y = canvas.height - 50;
  const CITY_WIDTH = 40;
  const CITY_HEIGHT = 30;
  const BATTERY_WIDTH = 30;
  const BATTERY_HEIGHT = 20;
  const MISSILE_SPEED = 1.5;
  const DEFENSE_SPEED = 4;
  const EXPLOSION_RADIUS = 50;

  function init() {
    score = 0;
    wave = 1;
    ammo = 10;
    incomingMissiles = [];
    defenseMissiles = [];
    explosions = [];

    cities = [
      { x: 100, y: GROUND_Y, alive: true },
      { x: 200, y: GROUND_Y, alive: true },
      { x: 300, y: GROUND_Y, alive: true },
      { x: 500, y: GROUND_Y, alive: true },
      { x: 600, y: GROUND_Y, alive: true },
      { x: 700, y: GROUND_Y, alive: true },
    ];

    batteries = [
      { x: 50, y: GROUND_Y + 10, alive: true },
      { x: 400, y: GROUND_Y + 10, alive: true },
      { x: 750, y: GROUND_Y + 10, alive: true },
    ];

    updateDisplay();
  }

  function updateDisplay() {
    scoreElement.textContent = score;
    waveElement.textContent = wave;
    ammoElement.textContent = ammo;
  }

  function startGame() {
    init();
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameRunning = true;
    spawnWave();
    gameLoop();
  }

  function spawnWave() {
    const missileCount = Math.min(5 + wave * 2, 20);
    for (let i = 0; i < missileCount; i++) {
      setTimeout(() => {
        if (gameRunning) {
          spawnMissile();
        }
      }, i * 800);
    }
  }

  function spawnMissile() {
    const startX = Math.random() * canvas.width;
    const targetX = Math.random() * canvas.width;

    incomingMissiles.push({
      x: startX,
      y: 0,
      targetX: targetX,
      targetY: GROUND_Y,
      speed: MISSILE_SPEED + wave * 0.1,
      trail: [],
    });
  }

  function launchDefense(targetX, targetY) {
    if (ammo <= 0) return;

    let closestBattery = null;
    let minDist = Infinity;

    for (let battery of batteries) {
      if (!battery.alive) continue;
      const dist = Math.hypot(targetX - battery.x, targetY - battery.y);
      if (dist < minDist) {
        minDist = dist;
        closestBattery = battery;
      }
    }

    if (!closestBattery) return;

    ammo--;
    updateDisplay();

    defenseMissiles.push({
      x: closestBattery.x,
      y: closestBattery.y,
      targetX: targetX,
      targetY: targetY,
      speed: DEFENSE_SPEED,
      trail: [],
    });
  }

  function updateMissiles() {
    for (let i = incomingMissiles.length - 1; i >= 0; i--) {
      const missile = incomingMissiles[i];

      const dx = missile.targetX - missile.x;
      const dy = missile.targetY - missile.y;
      const dist = Math.hypot(dx, dy);

      if (dist < missile.speed) {
        handleMissileImpact(missile);
        incomingMissiles.splice(i, 1);
        continue;
      }

      missile.trail.push({ x: missile.x, y: missile.y });
      if (missile.trail.length > 15) missile.trail.shift();

      missile.x += (dx / dist) * missile.speed;
      missile.y += (dy / dist) * missile.speed;
    }

    for (let i = defenseMissiles.length - 1; i >= 0; i--) {
      const missile = defenseMissiles[i];

      const dx = missile.targetX - missile.x;
      const dy = missile.targetY - missile.y;
      const dist = Math.hypot(dx, dy);

      if (dist < missile.speed) {
        createExplosion(missile.targetX, missile.targetY);
        defenseMissiles.splice(i, 1);
        continue;
      }

      missile.trail.push({ x: missile.x, y: missile.y });
      if (missile.trail.length > 10) missile.trail.shift();

      missile.x += (dx / dist) * missile.speed;
      missile.y += (dy / dist) * missile.speed;
    }
  }

  function handleMissileImpact(missile) {
    createExplosion(missile.targetX, missile.targetY, true);

    for (let city of cities) {
      if (city.alive && Math.abs(city.x - missile.targetX) < CITY_WIDTH) {
        city.alive = false;
      }
    }

    for (let battery of batteries) {
      if (
        battery.alive &&
        Math.abs(battery.x - missile.targetX) < BATTERY_WIDTH
      ) {
        battery.alive = false;
      }
    }
  }

  function createExplosion(x, y, isEnemy = false) {
    explosions.push({
      x: x,
      y: y,
      radius: 0,
      maxRadius: EXPLOSION_RADIUS,
      growing: true,
      life: 60,
      isEnemy: isEnemy,
    });
  }

  function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
      const explosion = explosions[i];

      if (explosion.growing) {
        explosion.radius += 2;
        if (explosion.radius >= explosion.maxRadius) {
          explosion.growing = false;
        }
      } else {
        explosion.life--;
        if (explosion.life <= 0) {
          explosions.splice(i, 1);
          continue;
        }
      }

      if (!explosion.isEnemy) {
        checkExplosionCollisions(explosion);
      }
    }
  }

  function checkExplosionCollisions(explosion) {
    for (let i = incomingMissiles.length - 1; i >= 0; i--) {
      const missile = incomingMissiles[i];
      const dist = Math.hypot(missile.x - explosion.x, missile.y - explosion.y);

      if (dist < explosion.radius) {
        score += 25;
        updateDisplay();
        createExplosion(missile.x, missile.y);
        incomingMissiles.splice(i, 1);
      }
    }
  }

  function checkWaveComplete() {
    if (incomingMissiles.length === 0 && !nextWaveTimeout) {
      const aliveCities = cities.filter((c) => c.alive).length;
      const bonusPoints = aliveCities * 100;
      score += bonusPoints;

      ammo += 5;
      updateDisplay();

      nextWaveTimeout = setTimeout(() => {
        wave++;
        updateDisplay();
        spawnWave();
        nextWaveTimeout = null;
      }, 3000);
    }
  }

  function checkGameOver() {
    const citiesAlive = cities.some((c) => c.alive);
    const batteriesAlive = batteries.some((b) => b.alive);

    if (!citiesAlive || !batteriesAlive) {
      gameOver(false);
    }
  }

  function gameOver(won) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    if (nextWaveTimeout) {
      clearTimeout(nextWaveTimeout);
      nextWaveTimeout = null;
    }

    gameOverMessage.textContent = won
      ? "Victory! All waves defended!"
      : "Cities destroyed!";
    finalScoreElement.textContent = `Final Score: ${score}`;
    gameOverScreen.classList.remove("hidden");
  }

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

    for (let city of cities) {
      if (city.alive) {
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(
          city.x - CITY_WIDTH / 2,
          city.y - CITY_HEIGHT,
          CITY_WIDTH,
          CITY_HEIGHT,
        );
      } else {
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(
          city.x - CITY_WIDTH / 2,
          city.y - CITY_HEIGHT,
          CITY_WIDTH,
          CITY_HEIGHT / 2,
        );
      }
    }

    for (let battery of batteries) {
      if (battery.alive) {
        ctx.fillStyle = "#ffaa00";
        ctx.fillRect(
          battery.x - BATTERY_WIDTH / 2,
          battery.y - BATTERY_HEIGHT,
          BATTERY_WIDTH,
          BATTERY_HEIGHT,
        );
      }
    }

    for (let missile of incomingMissiles) {
      ctx.strokeStyle = "#ff0044";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < missile.trail.length; i++) {
        const point = missile.trail[i];
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.lineTo(missile.x, missile.y);
      ctx.stroke();

      ctx.fillStyle = "#ff0044";
      ctx.beginPath();
      ctx.arc(missile.x, missile.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let missile of defenseMissiles) {
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < missile.trail.length; i++) {
        const point = missile.trail[i];
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.lineTo(missile.x, missile.y);
      ctx.stroke();

      ctx.fillStyle = "#00ffff";
      ctx.beginPath();
      ctx.arc(missile.x, missile.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let explosion of explosions) {
      const alpha = explosion.growing ? 0.8 : explosion.life / 60;
      ctx.fillStyle = explosion.isEnemy
        ? `rgba(255, 100, 0, ${alpha})`
        : `rgba(255, 255, 100, ${alpha})`;
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = explosion.isEnemy
        ? `rgba(255, 0, 0, ${alpha})`
        : `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function gameLoop() {
    if (!gameRunning) return;

    updateMissiles();
    updateExplosions();
    checkWaveComplete();
    checkGameOver();
    draw();

    animationId = requestAnimationFrame(gameLoop);
  }

  canvas.addEventListener("click", (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    launchDefense(x, y);
  });

  startBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", () => {
    if (gameRunning) {
      cancelAnimationFrame(animationId);
      if (nextWaveTimeout) {
        clearTimeout(nextWaveTimeout);
        nextWaveTimeout = null;
      }
    }
    startGame();
  });

  backBtn.addEventListener("click", () => {
    if (gameRunning) {
      cancelAnimationFrame(animationId);
      if (nextWaveTimeout) {
        clearTimeout(nextWaveTimeout);
        nextWaveTimeout = null;
      }
    }
    window.location.href = "../../index.html";
  });

  window.initMissileCommand = function (container) {
    container.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = "./games/missile-command/index.html";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    container.appendChild(iframe);
  };
})();
