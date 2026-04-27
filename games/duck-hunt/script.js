const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const roundDisplay = document.getElementById("round");
const scoreDisplay = document.getElementById("score");
const ammoDisplay = document.getElementById("ammo");
const finalScoreDisplay = document.getElementById("final-score");
const finalRoundDisplay = document.getElementById("final-round");
const ducksHitDisplay = document.getElementById("ducks-hit");
const victoryScoreDisplay = document.getElementById("victory-score");
const roundNotification = document.getElementById("round-notification");
const roundNotificationText = document.getElementById(
  "round-notification-text",
);
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const victoryScreen = document.getElementById("victory-screen");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const victoryRestartBtn = document.getElementById("victory-restart-btn");
const backBtn = document.getElementById("back-btn");

canvas.width = 700;
canvas.height = 500;

const DUCK_SIZE = 40;
const SPAWN_INTERVAL = 1500;
const BASE_DUCK_SPEED = 1.5;
const MAX_DUCKS = 3;
const MAX_ROUNDS = 10;
const DUCKS_PER_ROUND = 10;

let gameState = {
  ducks: [],
  score: 0,
  round: 1,
  ammo: 10,
  ducksHit: 0,
  roundDucksHit: 0,
  totalDucksSpawned: 0,
  gameRunning: false,
  lastSpawn: 0,
};

class Duck {
  constructor(round) {
    this.x = Math.random() < 0.5 ? -DUCK_SIZE : canvas.width;
    this.y = Math.random() * (canvas.height - 100) + 50;
    this.size = DUCK_SIZE;
    const speedMultiplier = 1 + (round - 1) * 0.08;
    this.speedX =
      (this.x < 0 ? 1 : -1) *
      (BASE_DUCK_SPEED + Math.random() * 0.5) *
      speedMultiplier;
    this.speedY = (Math.random() - 0.5) * 1 * speedMultiplier;
    this.hit = false;
    this.falling = false;
    this.fallSpeed = 0;
  }

  update() {
    if (this.falling) {
      this.fallSpeed += 0.3;
      this.y += this.fallSpeed;
      return this.y > canvas.height;
    }

    this.x += this.speedX;
    this.y += this.speedY;

    if (this.y < 50) {
      this.y = 50;
      this.speedY *= -1;
    }
    if (this.y > canvas.height - 50) {
      this.y = canvas.height - 50;
      this.speedY *= -1;
    }

    return this.x < -DUCK_SIZE || this.x > canvas.width + DUCK_SIZE;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.speedX < 0) {
      ctx.scale(-1, 1);
    }

    if (this.falling) {
      ctx.rotate(Math.PI);
    }

    ctx.fillStyle = this.hit ? "#8B4513" : "#2E8B57";
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);

    ctx.fillStyle = this.hit ? "#654321" : "#228B22";
    ctx.beginPath();
    ctx.arc(-this.size / 3, -this.size / 3, this.size / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.moveTo(this.size / 2, 0);
    ctx.lineTo(this.size / 2 + 15, -5);
    ctx.lineTo(this.size / 2 + 15, 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.hit ? "red" : "black";
    ctx.beginPath();
    ctx.arc(-this.size / 3 + 2, -this.size / 3 - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  contains(x, y) {
    return (
      x > this.x - this.size / 2 &&
      x < this.x + this.size / 2 &&
      y > this.y - this.size / 2 &&
      y < this.y + this.size / 2
    );
  }
}

function initDuckHunt(container) {
  if (container) {
    container.appendChild(document.querySelector(".game-wrapper"));
  }
  init();
}

function init() {
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", resetGame);
  victoryRestartBtn.addEventListener("click", resetGame);
  backBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
  });

  canvas.addEventListener("click", handleShoot);
}

function startGame() {
  startScreen.classList.add("hidden");
  gameState.gameRunning = true;
  gameState.ducks = [];
  gameState.lastSpawn = Date.now() - SPAWN_INTERVAL;
  updateDisplay();
  showRoundNotification(gameState.round);
  gameLoop();
}

function resetGame() {
  gameState = {
    ducks: [],
    score: 0,
    round: 1,
    ammo: 10,
    ducksHit: 0,
    roundDucksHit: 0,
    totalDucksSpawned: 0,
    gameRunning: false,
    lastSpawn: 0,
  };
  updateDisplay();
  gameOverScreen.classList.add("hidden");
  victoryScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
}

function handleShoot(event) {
  if (!gameState.gameRunning || gameState.ammo <= 0) return;

  gameState.ammo--;
  ammoDisplay.textContent = gameState.ammo;

  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width;
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height;

  let hitDuck = false;
  for (let duck of gameState.ducks) {
    if (!duck.hit && duck.contains(x, y)) {
      duck.hit = true;
      duck.falling = true;
      duck.fallSpeed = 0;
      gameState.score += 100;
      gameState.ducksHit++;
      gameState.roundDucksHit++;
      hitDuck = true;
      break;
    }
  }

  if (!hitDuck) {
    gameState.score = Math.max(0, gameState.score - 10);
  }

  updateDisplay();

  if (gameState.ammo <= 0) {
    setTimeout(checkRoundEnd, 2000);
  }
}

function spawnDuck() {
  if (
    gameState.ducks.length < MAX_DUCKS &&
    gameState.totalDucksSpawned < DUCKS_PER_ROUND
  ) {
    gameState.ducks.push(new Duck(gameState.round));
    gameState.totalDucksSpawned++;
  }
}

function updateDisplay() {
  roundDisplay.textContent = gameState.round;
  scoreDisplay.textContent = gameState.score;
  ammoDisplay.textContent = gameState.ammo;
}

function checkRoundEnd() {
  gameState.gameRunning = false;

  if (gameState.roundDucksHit === DUCKS_PER_ROUND) {
    if (gameState.round === MAX_ROUNDS) {
      showVictory();
    } else {
      nextRound();
    }
  } else {
    endGame();
  }
}

function nextRound() {
  gameState.round++;
  gameState.ammo = 10;
  gameState.roundDucksHit = 0;
  gameState.totalDucksSpawned = 0;
  gameState.ducks = [];
  gameState.gameRunning = true;
  gameState.lastSpawn = Date.now() - SPAWN_INTERVAL;
  updateDisplay();
  showRoundNotification(gameState.round);
  gameLoop();
}

function endGame() {
  finalScoreDisplay.textContent = gameState.score;
  finalRoundDisplay.textContent = gameState.round;
  ducksHitDisplay.textContent = gameState.roundDucksHit;
  gameOverScreen.classList.remove("hidden");
}

function showVictory() {
  victoryScoreDisplay.textContent = gameState.score;
  victoryScreen.classList.remove("hidden");
}

function showRoundNotification(round) {
  roundNotificationText.textContent = `Round ${round}`;
  roundNotification.classList.remove("hidden");

  setTimeout(() => {
    roundNotification.classList.add("hidden");
  }, 2000);
}

function drawBackground() {
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);

  ctx.fillStyle = "#90EE90";
  ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

  ctx.fillStyle = "#228B22";
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * canvas.width;
    const y = canvas.height * 0.7 + Math.random() * 50;
    ctx.fillRect(x, y, 5, 30);
  }

  ctx.fillStyle = "white";
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height * 0.4);
    ctx.beginPath();
    ctx.arc(x, y, 15 + Math.random() * 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

function gameLoop() {
  if (!gameState.gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  const now = Date.now();
  if (now - gameState.lastSpawn > SPAWN_INTERVAL) {
    spawnDuck();
    gameState.lastSpawn = now;
  }

  gameState.ducks = gameState.ducks.filter((duck) => {
    const offScreen = duck.update();
    duck.draw();
    return !offScreen;
  });

  if (
    gameState.totalDucksSpawned >= DUCKS_PER_ROUND &&
    gameState.ducks.length === 0 &&
    gameState.roundDucksHit < DUCKS_PER_ROUND
  ) {
    checkRoundEnd();
    return;
  }

  requestAnimationFrame(gameLoop);
}

if (typeof window !== "undefined") {
  init();
}
