const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");
const finalScoreEl = document.getElementById("finalScore");
const gameOverEl = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const backBtn = document.getElementById("backBtn");

let gameRunning = false;
let score = 0;
let frameCount = 0;
let obstacles = [];
let gameSpeed = 5;

const player = {
  x: 100,
  y: 0,
  width: 40,
  height: 40,
  velocityY: 0,
  gravity: 0.8,
  jumpPower: -15,
  grounded: false,
};

const ground = canvas.height - 50;

function initGame() {
  gameRunning = true;
  score = 0;
  frameCount = 0;
  obstacles = [];
  gameSpeed = 5;

  player.y = ground - player.height;
  player.velocityY = 0;
  player.grounded = true;

  gameOverEl.classList.add("hidden");
  scoreEl.textContent = "0";
  speedEl.textContent = "1.0";

  gameLoop();
}

function jump() {
  if (player.grounded && gameRunning) {
    player.velocityY = player.jumpPower;
    player.grounded = false;
  }
}

function updatePlayer() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  if (player.y >= ground - player.height) {
    player.y = ground - player.height;
    player.velocityY = 0;
    player.grounded = true;
  }
}

function spawnObstacle() {
  const height = Math.random() > 0.5 ? 40 : 60;
  obstacles.push({
    x: canvas.width,
    y: ground - height,
    width: 30,
    height: height,
  });
}

function updateObstacles() {
  frameCount++;

  if (frameCount % 100 === 0) {
    spawnObstacle();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= gameSpeed;

    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
      score += 10;
      scoreEl.textContent = score;

      if (score % 100 === 0) {
        gameSpeed += 0.5;
        speedEl.textContent = (gameSpeed / 5).toFixed(1);
      }
    }
  }
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

function drawPlayer() {
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "white";
  ctx.fillRect(player.x + 10, player.y + 10, 8, 8);
  ctx.fillRect(player.x + 22, player.y + 10, 8, 8);
}

function drawObstacles() {
  ctx.fillStyle = "#2f3542";
  for (let obstacle of obstacles) {
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }
}

function drawGround() {
  ctx.fillStyle = "#2ed573";
  ctx.fillRect(0, ground, canvas.width, canvas.height - ground);

  ctx.fillStyle = "#1e7e34";
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.fillRect(i - (frameCount % 40), ground, 20, 5);
  }
}

function drawSky() {
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, canvas.width, ground);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(700, 50, 30, 0, Math.PI * 2);
  ctx.fill();
}

function gameOver() {
  gameRunning = false;
  finalScoreEl.textContent = score;
  gameOverEl.classList.remove("hidden");
}

function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawSky();
  drawGround();
  drawPlayer();
  drawObstacles();

  updatePlayer();
  updateObstacles();

  if (checkCollision()) {
    gameOver();
    return;
  }

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    jump();
  }
});

canvas.addEventListener("click", jump);

restartBtn.addEventListener("click", initGame);

backBtn.addEventListener("click", () => {
  window.parent.postMessage({ action: "backToArcade" }, "*");
});

initGame();
