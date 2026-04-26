const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("final-score");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const backBtn = document.getElementById("back-btn");

canvas.width = 500;
canvas.height = 600;

const GRAVITY = 0.5;
const JUMP_STRENGTH = -9;
const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const PIPE_SPEED = 2.5;
const SPAWN_INTERVAL = 1800;

let gameState = {
  player: {
    x: 100,
    y: 250,
    width: 40,
    height: 40,
    velocity: 0,
  },
  pipes: [],
  score: 0,
  gameRunning: false,
  gameOver: false,
  lastSpawn: 0,
};

function initFlappy(container) {
  if (container) {
    container.appendChild(document.querySelector(".game-wrapper"));
  }
  init();
}

function init() {
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", resetGame);
  backBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
  });

  document.addEventListener("keydown", handleKeyPress);
  canvas.addEventListener("click", handleClick);
}

function handleKeyPress(e) {
  if (e.code === "Space" && gameState.gameRunning && !gameState.gameOver) {
    e.preventDefault();
    jump();
  }
}

function handleClick() {
  if (gameState.gameRunning && !gameState.gameOver) {
    jump();
  }
}

function jump() {
  gameState.player.velocity = JUMP_STRENGTH;
}

function startGame() {
  startScreen.classList.add("hidden");
  gameState.gameRunning = true;
  gameState.gameOver = false;
  gameState.lastSpawn = Date.now();
  gameLoop();
}

function resetGame() {
  gameState = {
    player: {
      x: 100,
      y: 250,
      width: 40,
      height: 40,
      velocity: 0,
    },
    pipes: [],
    score: 0,
    gameRunning: true,
    gameOver: false,
    lastSpawn: Date.now(),
  };

  gameOverScreen.classList.add("hidden");
  scoreDisplay.textContent = "0";
  gameLoop();
}

function updatePlayer() {
  gameState.player.velocity += GRAVITY;
  gameState.player.y += gameState.player.velocity;

  if (gameState.player.y + gameState.player.height > canvas.height) {
    gameState.player.y = canvas.height - gameState.player.height;
    endGame();
  }

  if (gameState.player.y < 0) {
    gameState.player.y = 0;
    gameState.player.velocity = 0;
  }
}

function spawnPipe() {
  const now = Date.now();
  if (now - gameState.lastSpawn > SPAWN_INTERVAL) {
    const minHeight = 50;
    const maxHeight = canvas.height - PIPE_GAP - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    gameState.pipes.push({
      x: canvas.width,
      topHeight: topHeight,
      bottomY: topHeight + PIPE_GAP,
      passed: false,
    });

    gameState.lastSpawn = now;
  }
}

function updatePipes() {
  gameState.pipes.forEach((pipe) => {
    pipe.x -= PIPE_SPEED;

    if (!pipe.passed && pipe.x + PIPE_WIDTH < gameState.player.x) {
      pipe.passed = true;
      gameState.score++;
      scoreDisplay.textContent = gameState.score;
    }
  });

  gameState.pipes = gameState.pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0);
}

function checkCollision() {
  const player = gameState.player;

  for (let pipe of gameState.pipes) {
    if (player.x + player.width > pipe.x && player.x < pipe.x + PIPE_WIDTH) {
      if (
        player.y < pipe.topHeight ||
        player.y + player.height > pipe.bottomY
      ) {
        endGame();
        return;
      }
    }
  }
}

function endGame() {
  if (!gameState.gameOver) {
    gameState.gameOver = true;
    gameState.gameRunning = false;
    finalScoreDisplay.textContent = gameState.score;
    gameOverScreen.classList.remove("hidden");
  }
}

function drawPlayer() {
  ctx.save();

  const rotation = Math.min(
    Math.max(gameState.player.velocity * 0.05, -0.5),
    0.5,
  );
  ctx.translate(
    gameState.player.x + gameState.player.width / 2,
    gameState.player.y + gameState.player.height / 2,
  );
  ctx.rotate(rotation);

  ctx.fillStyle = "#FFD700";
  ctx.fillRect(
    -gameState.player.width / 2,
    -gameState.player.height / 2,
    gameState.player.width,
    gameState.player.height,
  );

  ctx.fillStyle = "#FFA500";
  ctx.fillRect(
    -gameState.player.width / 2 + 25,
    -gameState.player.height / 2 + 10,
    10,
    10,
  );

  ctx.fillStyle = "#000";
  ctx.fillRect(
    -gameState.player.width / 2 + 8,
    -gameState.player.height / 2 + 12,
    6,
    6,
  );

  ctx.restore();
}

function drawPipes() {
  gameState.pipes.forEach((pipe) => {
    ctx.fillStyle = "#2ECC40";
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
    ctx.fillRect(
      pipe.x,
      pipe.bottomY,
      PIPE_WIDTH,
      canvas.height - pipe.bottomY,
    );

    ctx.strokeStyle = "#228B22";
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
    ctx.strokeRect(
      pipe.x,
      pipe.bottomY,
      PIPE_WIDTH,
      canvas.height - pipe.bottomY,
    );

    ctx.fillStyle = "#228B22";
    ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, PIPE_WIDTH + 10, 30);
    ctx.fillRect(pipe.x - 5, pipe.bottomY, PIPE_WIDTH + 10, 30);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#90EE90";
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

  drawPipes();
  drawPlayer();
}

function gameLoop() {
  if (!gameState.gameRunning) return;

  updatePlayer();
  spawnPipe();
  updatePipes();
  checkCollision();
  draw();

  requestAnimationFrame(gameLoop);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { initFlappy };
} else {
  init();
}
