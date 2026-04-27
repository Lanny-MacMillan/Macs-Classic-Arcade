const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const backBtn = document.getElementById("back-btn");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("final-score");

canvas.width = 500;
canvas.height = 700;

const COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF"];
const COLOR_NAMES = ["RED", "CYAN", "YELLOW", "GREEN"];
const GRAVITY = 0.4;
const JUMP_FORCE = -6;
const OBSTACLE_SPEED = 1.5;

let gameState = "start";
let score = 0;
let player;
let obstacles = [];
let colorSwitchers = [];
let gameLoop;
let keys = {};

class Player {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height - 150;
    this.radius = 10;
    this.velocity = 0;
    this.color = COLORS[0];
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  update() {
    this.velocity += GRAVITY;
    this.y += this.velocity;

    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.velocity = 0;
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.velocity = 0;
    }
  }

  jump() {
    this.velocity = JUMP_FORCE;
  }

  switchColor() {
    const currentIndex = COLORS.indexOf(this.color);
    this.color = COLORS[(currentIndex + 1) % COLORS.length];
  }
}

class Obstacle {
  constructor(y, type = "circle") {
    this.x = canvas.width / 2;
    if (type === "cross") {
      const offset = 60 + Math.random() * 40;
      this.x += Math.random() > 0.5 ? offset : -offset;
    }
    this.y = y;
    this.radius = 80;
    this.lineWidth = 15;
    this.rotation = 0;
    this.rotationSpeed = 0.02;
    this.type = type;
    this.passed = false;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.type === "circle") {
      this.drawCircle();
    } else if (this.type === "cross") {
      this.drawCross();
    } else if (this.type === "square") {
      this.drawSquare();
    }

    ctx.restore();
  }

  drawCircle() {
    const segments = 4;
    const anglePerSegment = (Math.PI * 2) / segments;

    for (let i = 0; i < segments; i++) {
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        this.radius,
        i * anglePerSegment,
        (i + 1) * anglePerSegment,
      );
      ctx.strokeStyle = COLORS[i];
      ctx.lineWidth = this.lineWidth;
      ctx.stroke();
    }
  }

  drawCross() {
    const armLength = this.radius;
    const armWidth = this.lineWidth;

    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);

      ctx.fillStyle = COLORS[i];
      ctx.fillRect(0, -armWidth / 2, armLength, armWidth);

      ctx.restore();
    }
  }

  drawSquare() {
    const size = this.radius * 1.4;
    const half = size / 2;

    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.moveTo(-half, -half);
    ctx.lineTo(half, -half);
    ctx.strokeStyle = COLORS[0];
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(half, -half);
    ctx.lineTo(half, half);
    ctx.strokeStyle = COLORS[1];
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(half, half);
    ctx.lineTo(-half, half);
    ctx.strokeStyle = COLORS[2];
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-half, half);
    ctx.lineTo(-half, -half);
    ctx.strokeStyle = COLORS[3];
    ctx.stroke();
  }

  update() {
    this.y += OBSTACLE_SPEED;
    this.rotation += this.rotationSpeed;
  }

  checkCollision(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;

    if (this.type === "circle") {
      return this.checkCircleCollision(player, dx, dy);
    } else if (this.type === "cross") {
      return this.checkCrossCollision(player, dx, dy);
    } else if (this.type === "square") {
      return this.checkSquareCollision(player, dx, dy);
    }
  }

  checkCircleCollision(player, dx, dy) {
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (
      distance >= this.radius - this.lineWidth / 2 &&
      distance <= this.radius + this.lineWidth / 2
    ) {
      const angle = Math.atan2(dy, dx) - this.rotation;
      const normalizedAngle =
        ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const segment = Math.floor(normalizedAngle / (Math.PI / 2));
      const segmentColor = COLORS[segment];

      if (segmentColor !== player.color) {
        return true;
      }
    }

    if (!this.passed && this.y > player.y + 50) {
      this.passed = true;
      score++;
      scoreDisplay.textContent = score;
    }

    return false;
  }

  checkCrossCollision(player, dx, dy) {
    const angle = Math.atan2(dy, dx) - this.rotation;
    const normalizedAngle =
      ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const segment = Math.floor(normalizedAngle / (Math.PI / 2));

    const distance = Math.sqrt(dx * dx + dy * dy);
    const armLength = this.radius;
    const armWidth = this.lineWidth;

    if (distance < armLength) {
      const rotatedX =
        dx * Math.cos(-this.rotation) - dy * Math.sin(-this.rotation);
      const rotatedY =
        dx * Math.sin(-this.rotation) + dy * Math.cos(-this.rotation);

      if (Math.abs(rotatedX) < armLength && Math.abs(rotatedY) < armWidth / 2) {
        const segmentColor = rotatedX > 0 ? COLORS[0] : COLORS[2];
        if (segmentColor !== player.color) return true;
      }

      if (Math.abs(rotatedY) < armLength && Math.abs(rotatedX) < armWidth / 2) {
        const segmentColor = rotatedY > 0 ? COLORS[3] : COLORS[1];
        if (segmentColor !== player.color) return true;
      }
    }

    return false;
  }

  checkSquareCollision(player, dx, dy) {
    const size = this.radius * 1.4;
    const half = size / 2;

    const rotatedX =
      dx * Math.cos(-this.rotation) - dy * Math.sin(-this.rotation);
    const rotatedY =
      dx * Math.sin(-this.rotation) + dy * Math.cos(-this.rotation);

    const lineThickness = this.lineWidth;
    const buffer = player.radius + lineThickness / 2;

    if (
      Math.abs(rotatedX) <= half + buffer &&
      Math.abs(rotatedY) <= half + buffer
    ) {
      const distToTop = Math.abs(rotatedY + half);
      const distToBottom = Math.abs(rotatedY - half);
      const distToLeft = Math.abs(rotatedX + half);
      const distToRight = Math.abs(rotatedX - half);

      const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);

      if (minDist < buffer) {
        let hitColor;
        
        if (minDist === distToTop && Math.abs(rotatedX) <= half) {
          hitColor = COLORS[0];
        } else if (minDist === distToRight && Math.abs(rotatedY) <= half) {
          hitColor = COLORS[1];
        } else if (minDist === distToBottom && Math.abs(rotatedX) <= half) {
          hitColor = COLORS[2];
        } else if (minDist === distToLeft && Math.abs(rotatedY) <= half) {
          hitColor = COLORS[3];
        }

        if (hitColor && hitColor !== player.color) {
          return true;
        }
      }
    }

    return false;
  }

  isOffScreen() {
    return this.y > canvas.height + this.radius;
  }
}

class ColorSwitcher {
  constructor(y) {
    this.x = canvas.width / 2;
    this.y = y;
    this.radius = 15;
    this.colors = [...COLORS];
    this.rotation = 0;
    this.rotationSpeed = 0.05;
    this.used = false;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const segments = this.colors.length;
    const anglePerSegment = (Math.PI * 2) / segments;

    for (let i = 0; i < segments; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(
        0,
        0,
        this.radius,
        i * anglePerSegment,
        (i + 1) * anglePerSegment,
      );
      ctx.closePath();
      ctx.fillStyle = this.colors[i];
      ctx.fill();
    }

    ctx.restore();
  }

  update() {
    this.y += OBSTACLE_SPEED;
    this.rotation += this.rotationSpeed;
  }

  checkCollision(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius + player.radius && !this.used) {
      this.used = true;
      player.switchColor();
    }
  }

  isOffScreen() {
    return this.y > canvas.height + this.radius;
  }
}

function init() {
  score = 0;
  scoreDisplay.textContent = score;
  player = new Player();
  obstacles = [];
  colorSwitchers = [];

  for (let i = 0; i < 3; i++) {
    obstacles.push(new Obstacle(-250 - i * 400));
    if (i < 2) {
      colorSwitchers.push(new ColorSwitcher(-400 - i * 400));
    }
  }
}

function spawnObstacle() {
  const lastObstacle = obstacles[obstacles.length - 1];
  if (lastObstacle && lastObstacle.y > -100) {
    const types = ["circle", "cross", "square"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const baseSpacing = -400;
    const variance = Math.random() * 100 - 50;
    obstacles.push(new Obstacle(baseSpacing + variance, randomType));

    if (Math.random() > 0.4) {
      const switcherVariance = Math.random() * 60 - 30;
      colorSwitchers.push(new ColorSwitcher(-200 + switcherVariance));
    }
  }
}

function update() {
  if (gameState !== "playing") return;

  player.update();

  obstacles.forEach((obstacle) => {
    obstacle.update();
    if (obstacle.checkCollision(player)) {
      endGame();
    }
  });

  colorSwitchers.forEach((switcher) => {
    switcher.update();
    switcher.checkCollision(player);
  });

  obstacles = obstacles.filter((obstacle) => !obstacle.isOffScreen());
  colorSwitchers = colorSwitchers.filter((switcher) => !switcher.isOffScreen());

  spawnObstacle();
}

function draw() {
  ctx.fillStyle = "#0f0f23";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  obstacles.forEach((obstacle) => obstacle.draw());
  colorSwitchers.forEach((switcher) => switcher.draw());
  player.draw();

  const colorIndex = COLORS.indexOf(player.color);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("YOUR COLOR: " + COLOR_NAMES[colorIndex], canvas.width / 2, 25);

  ctx.beginPath();
  ctx.arc(canvas.width / 2 + 80, 20, 8, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = "12px Arial";
  ctx.fillStyle = "#888";
  ctx.fillText(
    "Click or Press Space to Jump",
    canvas.width / 2,
    canvas.height - 10,
  );
}

function gameUpdateLoop() {
  update();
  draw();
  gameLoop = requestAnimationFrame(gameUpdateLoop);
}

function startGame() {
  if (gameLoop) {
    cancelAnimationFrame(gameLoop);
  }
  gameState = "playing";
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  init();
  gameUpdateLoop();
}

function endGame() {
  gameState = "gameover";
  cancelAnimationFrame(gameLoop);
  finalScoreDisplay.textContent = score;
  gameOverScreen.classList.remove("hidden");
}

function handleJump() {
  if (gameState === "playing") {
    player.jump();
  }
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
backBtn.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

canvas.addEventListener("click", handleJump);

document.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (e.code === "Space") {
    e.preventDefault();
    handleJump();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

init();
draw();

function initColorSwitch(container) {
  container.innerHTML = `
        <canvas id="gameCanvas"></canvas>
        <div class="game-controls">
            <button id="back-btn" class="control-btn back-btn">Back to Arcade</button>
        </div>
    `;
}
