(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreElement = document.getElementById("score");
  const speedElement = document.getElementById("speed");
  const startScreen = document.getElementById("start-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  const finalScoreElement = document.getElementById("final-score");
  const startBtn = document.getElementById("start-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const restartBtn = document.getElementById("restart-btn");
  const backBtn = document.getElementById("back-btn");

  canvas.width = 800;
  canvas.height = 600;

  const PLAYER_WIDTH = 50;
  const PLAYER_HEIGHT = 50;
  const PLAYER_SPEED = 7;
  const OBSTACLE_WIDTH = 40;
  const OBSTACLE_MIN_HEIGHT = 30;
  const OBSTACLE_MAX_HEIGHT = 80;
  const INITIAL_SPAWN_RATE = 90;
  const INITIAL_FALL_SPEED = 3;
  const SPEED_INCREASE_RATE = 0.0002;

  let gameRunning = false;
  let animationId;
  let score = 0;
  let fallSpeed = INITIAL_FALL_SPEED;
  let spawnRate = INITIAL_SPAWN_RATE;
  let frameCount = 0;

  let player = {
    x: canvas.width / 2 - PLAYER_WIDTH / 2,
    y: canvas.height - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dx: 0,
  };

  let obstacles = [];

  const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    a: false,
    d: false,
  };

  function spawnObstacle() {
    const height =
      Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT) +
      OBSTACLE_MIN_HEIGHT;
    const x = Math.random() * (canvas.width - OBSTACLE_WIDTH);

    obstacles.push({
      x: x,
      y: -height,
      width: OBSTACLE_WIDTH,
      height: height,
    });
  }

  function updatePlayer() {
    if (keys.ArrowLeft || keys.a) {
      player.dx = -PLAYER_SPEED;
    } else if (keys.ArrowRight || keys.d) {
      player.dx = PLAYER_SPEED;
    } else {
      player.dx = 0;
    }

    player.x += player.dx;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width)
      player.x = canvas.width - player.width;
  }

  function updateObstacles() {
    obstacles.forEach((obstacle) => {
      obstacle.y += fallSpeed;
    });

    obstacles = obstacles.filter((obstacle) => obstacle.y < canvas.height);

    if (frameCount % Math.floor(spawnRate) === 0) {
      spawnObstacle();
    }

    fallSpeed += SPEED_INCREASE_RATE;
    spawnRate = Math.max(30, spawnRate - 0.008);
  }

  function checkCollision() {
    for (let obstacle of obstacles) {
      if (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
      ) {
        return true;
      }
    }
    return false;
  }

  function updateScore() {
    score++;
    scoreElement.textContent = score;
    const speedMultiplier = (fallSpeed / INITIAL_FALL_SPEED).toFixed(1);
    speedElement.textContent = speedMultiplier + "x";
  }

  function drawPlayer() {
    ctx.fillStyle = "#00d4ff";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);
  }

  function drawObstacles() {
    obstacles.forEach((obstacle) => {
      ctx.fillStyle = "#ff006e";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameRunning) {
      drawPlayer();
      drawObstacles();
    }
  }

  function gameLoop() {
    if (!gameRunning) return;

    updatePlayer();
    updateObstacles();

    if (checkCollision()) {
      endGame();
      return;
    }

    if (frameCount % 5 === 0) {
      updateScore();
    }

    frameCount++;
    draw();
    animationId = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    gameRunning = true;
    score = 0;
    fallSpeed = INITIAL_FALL_SPEED;
    spawnRate = INITIAL_SPAWN_RATE;
    frameCount = 0;
    obstacles = [];
    player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
    scoreElement.textContent = "0";
    speedElement.textContent = "1x";
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameLoop();
  }

  function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    finalScoreElement.textContent = `You survived ${score} frames with ${speedElement.textContent} speed!`;
    gameOverScreen.classList.remove("hidden");
  }

  function restartGame() {
    gameOverScreen.classList.add("hidden");
    startGame();
  }

  function init() {
    startScreen.classList.remove("hidden");
    draw();
  }

  document.addEventListener("keydown", (e) => {
    if (e.key in keys) {
      keys[e.key] = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key in keys) {
      keys[e.key] = false;
    }
  });

  startBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", restartGame);
  restartBtn.addEventListener("click", restartGame);

  backBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
  });

  init();

  window.initAvoider = function (container) {
    if (container) {
      container.appendChild(canvas);
    }
    init();
  };
})();
