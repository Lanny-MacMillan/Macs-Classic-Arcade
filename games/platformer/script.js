(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startScreen = document.getElementById("start-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  const gameOverMessage = document.getElementById("game-over-message");
  const startBtn = document.getElementById("start-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const backBtn = document.getElementById("back-btn");
  const mainBackBtn = document.getElementById("main-back-btn");
  const coinsElement = document.getElementById("coins");
  const totalCoinsElement = document.getElementById("total-coins");
  const levelElement = document.getElementById("level");

  canvas.width = 800;
  canvas.height = 600;

  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const MOVE_SPEED = 5;
  const PLAYER_SIZE = 30;

  let gameActive = false;
  let keys = {};
  let coins = 0;
  let currentLevel = 1;
  let switchActive = false;

  const player = {
    x: 100,
    y: 100,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
  };

  const levels = [
    {
      platforms: [
        { x: 0, y: 550, width: 300, height: 50 },
        { x: 350, y: 450, width: 150, height: 20 },
        { x: 550, y: 350, width: 150, height: 20 },
        { x: 200, y: 300, width: 200, height: 20 },
        { x: 450, y: 200, width: 150, height: 20 },
        { x: 650, y: 250, width: 150, height: 20 },
      ],
      collectibles: [
        { x: 400, y: 410, size: 15, collected: false },
        { x: 600, y: 310, size: 15, collected: false },
        { x: 280, y: 260, size: 15, collected: false },
      ],
      hazards: [],
      switchPos: { x: 700, y: 210 },
      spawnX: 50,
      spawnY: 480,
    },
    {
      platforms: [
        { x: 0, y: 550, width: 200, height: 50 },
        { x: 250, y: 450, width: 120, height: 20 },
        { x: 420, y: 380, width: 120, height: 20 },
        { x: 590, y: 300, width: 120, height: 20 },
        { x: 420, y: 220, width: 120, height: 20 },
        { x: 250, y: 150, width: 120, height: 20 },
        { x: 420, y: 100, width: 120, height: 20 },
        { x: 590, y: 80, width: 210, height: 20 },
      ],
      collectibles: [
        { x: 290, y: 410, size: 15, collected: false },
        { x: 460, y: 340, size: 15, collected: false },
        { x: 630, y: 260, size: 15, collected: false },
        { x: 460, y: 180, size: 15, collected: false },
      ],
      hazards: [
        { x: 200, y: 530, width: 50, height: 20 },
        { x: 370, y: 360, width: 50, height: 20 },
      ],
      switchPos: { x: 700, y: 40 },
      spawnX: 50,
      spawnY: 480,
    },
    {
      platforms: [
        { x: 0, y: 550, width: 150, height: 50 },
        { x: 200, y: 480, width: 100, height: 20 },
        { x: 350, y: 420, width: 100, height: 20 },
        { x: 500, y: 360, width: 100, height: 20 },
        { x: 650, y: 300, width: 150, height: 20 },
        { x: 500, y: 240, width: 100, height: 20 },
        { x: 350, y: 180, width: 100, height: 20 },
        { x: 200, y: 120, width: 100, height: 20 },
        { x: 0, y: 60, width: 150, height: 20 },
      ],
      collectibles: [
        { x: 230, y: 440, size: 15, collected: false },
        { x: 530, y: 320, size: 15, collected: false },
        { x: 380, y: 140, size: 15, collected: false },
        { x: 230, y: 80, size: 15, collected: false },
        { x: 700, y: 260, size: 15, collected: false },
      ],
      hazards: [
        { x: 150, y: 530, width: 50, height: 20 },
        { x: 300, y: 400, width: 50, height: 20 },
        { x: 450, y: 340, width: 50, height: 20 },
        { x: 600, y: 280, width: 50, height: 20 },
      ],
      switchPos: { x: 50, y: 20 },
      spawnX: 50,
      spawnY: 480,
    },
    {
      platforms: [
        { x: 0, y: 550, width: 120, height: 50 },
        { x: 170, y: 480, width: 80, height: 20 },
        { x: 300, y: 410, width: 80, height: 20 },
        { x: 430, y: 340, width: 80, height: 20 },
        { x: 560, y: 270, width: 80, height: 20 },
        { x: 690, y: 200, width: 110, height: 20 },
        { x: 560, y: 130, width: 80, height: 20 },
        { x: 430, y: 80, width: 80, height: 20 },
        { x: 300, y: 130, width: 80, height: 20 },
        { x: 170, y: 200, width: 80, height: 20 },
        { x: 0, y: 270, width: 120, height: 20 },
      ],
      collectibles: [
        { x: 190, y: 440, size: 15, collected: false },
        { x: 450, y: 300, size: 15, collected: false },
        { x: 720, y: 160, size: 15, collected: false },
        { x: 320, y: 90, size: 15, collected: false },
        { x: 50, y: 230, size: 15, collected: false },
        { x: 580, y: 230, size: 15, collected: false },
      ],
      hazards: [
        { x: 120, y: 530, width: 50, height: 20 },
        { x: 250, y: 390, width: 50, height: 20 },
        { x: 380, y: 320, width: 50, height: 20 },
        { x: 510, y: 250, width: 50, height: 20 },
        { x: 640, y: 180, width: 50, height: 20 },
        { x: 380, y: 60, width: 50, height: 20 },
      ],
      switchPos: { x: 50, y: 230 },
      spawnX: 50,
      spawnY: 480,
    },
    {
      platforms: [
        { x: 0, y: 550, width: 100, height: 50 },
        { x: 150, y: 490, width: 70, height: 15 },
        { x: 270, y: 430, width: 70, height: 15 },
        { x: 390, y: 370, width: 70, height: 15 },
        { x: 510, y: 310, width: 70, height: 15 },
        { x: 630, y: 250, width: 70, height: 15 },
        { x: 730, y: 190, width: 70, height: 15 },
        { x: 630, y: 130, width: 70, height: 15 },
        { x: 510, y: 80, width: 70, height: 15 },
        { x: 390, y: 130, width: 70, height: 15 },
        { x: 270, y: 190, width: 70, height: 15 },
        { x: 150, y: 250, width: 70, height: 15 },
        { x: 30, y: 310, width: 70, height: 15 },
      ],
      collectibles: [
        { x: 180, y: 450, size: 15, collected: false },
        { x: 420, y: 330, size: 15, collected: false },
        { x: 660, y: 210, size: 15, collected: false },
        { x: 760, y: 150, size: 15, collected: false },
        { x: 540, y: 40, size: 15, collected: false },
        { x: 300, y: 150, size: 15, collected: false },
        { x: 60, y: 270, size: 15, collected: false },
      ],
      hazards: [
        { x: 100, y: 530, width: 50, height: 20 },
        { x: 220, y: 410, width: 50, height: 20 },
        { x: 340, y: 350, width: 50, height: 20 },
        { x: 460, y: 290, width: 50, height: 20 },
        { x: 580, y: 230, width: 50, height: 20 },
        { x: 700, y: 170, width: 30, height: 20 },
        { x: 580, y: 110, width: 50, height: 20 },
        { x: 460, y: 60, width: 50, height: 20 },
        { x: 340, y: 110, width: 50, height: 20 },
        { x: 220, y: 170, width: 50, height: 20 },
        { x: 100, y: 230, width: 50, height: 20 },
      ],
      switchPos: { x: 60, y: 270 },
      spawnX: 50,
      spawnY: 480,
    },
  ];

  let platforms = [];
  let collectibles = [];
  let hazards = [];
  let switchPos = {};

  function init() {
    startScreen.classList.remove("hidden");
    gameOverScreen.classList.add("hidden");
    canvas.style.display = "none";
  }

  function loadLevel(levelNum) {
    const level = levels[levelNum - 1];
    platforms = JSON.parse(JSON.stringify(level.platforms));
    collectibles = JSON.parse(JSON.stringify(level.collectibles));
    hazards = JSON.parse(JSON.stringify(level.hazards));
    switchPos = { ...level.switchPos };
    switchActive = false;
    coins = 0;

    player.x = level.spawnX;
    player.y = level.spawnY;
    player.velocityX = 0;
    player.velocityY = 0;

    coinsElement.textContent = coins;
    totalCoinsElement.textContent = collectibles.length;
    levelElement.textContent = levelNum;
  }

  function startGame() {
    gameActive = true;
    currentLevel = 1;
    loadLevel(currentLevel);

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    canvas.style.display = "block";

    gameLoop();
  }

  function nextLevel() {
    currentLevel++;
    if (currentLevel > levels.length) {
      endGame(true, true);
    } else {
      loadLevel(currentLevel);
    }
  }

  function endGame(won, allLevels = false) {
    gameActive = false;
    gameOverScreen.classList.remove("hidden");
    if (won && allLevels) {
      gameOverMessage.textContent = `You beat all 5 levels! Great job!`;
    } else if (won) {
      gameOverMessage.textContent = `Level ${currentLevel} complete!`;
    } else {
      gameOverMessage.textContent = `Game Over! Made it to Level ${currentLevel}`;
    }
  }

  function update() {
    if (!gameActive) return;

    if (keys["ArrowLeft"] || keys["a"]) {
      player.velocityX = -MOVE_SPEED;
    } else if (keys["ArrowRight"] || keys["d"]) {
      player.velocityX = MOVE_SPEED;
    } else {
      player.velocityX = 0;
    }

    if ((keys[" "] || keys["ArrowUp"] || keys["w"]) && player.onGround) {
      player.velocityY = JUMP_FORCE;
    }

    player.onGround = false;
    player.velocityY += GRAVITY;

    player.x += player.velocityX;
    player.y += player.velocityY;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width)
      player.x = canvas.width - player.width;

    platforms.forEach((platform) => {
      if (
        player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y < platform.y + platform.height &&
        player.y + player.height > platform.y
      ) {
        if (
          player.velocityY > 0 &&
          player.y + player.height - player.velocityY <= platform.y
        ) {
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.onGround = true;
        } else if (
          player.velocityY < 0 &&
          player.y - player.velocityY >= platform.y + platform.height
        ) {
          player.y = platform.y + platform.height;
          player.velocityY = 0;
        } else if (player.velocityX > 0) {
          player.x = platform.x - player.width;
        } else if (player.velocityX < 0) {
          player.x = platform.x + platform.width;
        }
      }
    });

    collectibles.forEach((collectible) => {
      if (!collectible.collected) {
        if (
          player.x < collectible.x + collectible.size &&
          player.x + player.width > collectible.x &&
          player.y < collectible.y + collectible.size &&
          player.y + player.height > collectible.y
        ) {
          collectible.collected = true;
          coins++;
          coinsElement.textContent = coins;

          if (coins === collectibles.length) {
            switchActive = true;
          }
        }
      }
    });

    hazards.forEach((hazard) => {
      if (
        player.x < hazard.x + hazard.width &&
        player.x + player.width > hazard.x &&
        player.y < hazard.y + hazard.height &&
        player.y + player.height > hazard.y
      ) {
        endGame(false);
      }
    });

    if (switchActive) {
      if (
        player.x < switchPos.x + 40 &&
        player.x + player.width > switchPos.x &&
        player.y < switchPos.y + 40 &&
        player.y + player.height > switchPos.y
      ) {
        nextLevel();
      }
    }

    if (player.y > canvas.height) {
      endGame(false);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#8B4513";
    platforms.forEach((platform) => {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    ctx.fillStyle = "#FF0000";
    hazards.forEach((hazard) => {
      ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);

      ctx.fillStyle = "#8B0000";
      const spikeCount = Math.floor(hazard.width / 10);
      for (let i = 0; i < spikeCount; i++) {
        ctx.beginPath();
        ctx.moveTo(hazard.x + i * 10, hazard.y + hazard.height);
        ctx.lineTo(hazard.x + i * 10 + 5, hazard.y);
        ctx.lineTo(hazard.x + i * 10 + 10, hazard.y + hazard.height);
        ctx.fill();
      }
      ctx.fillStyle = "#FF0000";
    });

    ctx.fillStyle = "#FFD700";
    collectibles.forEach((collectible) => {
      if (!collectible.collected) {
        ctx.beginPath();
        ctx.arc(
          collectible.x + collectible.size / 2,
          collectible.y + collectible.size / 2,
          collectible.size / 2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    });

    if (switchActive) {
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(switchPos.x, switchPos.y, 40, 40);
      ctx.fillStyle = "#00AA00";
      ctx.fillRect(switchPos.x + 10, switchPos.y + 10, 20, 20);
    }

    ctx.fillStyle = "#FF4444";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  function gameLoop() {
    if (!gameActive) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " " || e.key === "ArrowUp") {
      e.preventDefault();
    }
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  startBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", startGame);
  backBtn.addEventListener("click", () => {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  });
  mainBackBtn.addEventListener("click", () => {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  });

  init();

  window.initPlatformer = function (container) {
    if (container) {
      container.appendChild(document.querySelector(".game-wrapper"));
    }
    init();
  };
})();
