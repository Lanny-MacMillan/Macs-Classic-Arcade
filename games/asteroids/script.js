(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreElement = document.getElementById("score");
  const livesElement = document.getElementById("lives");
  const startScreen = document.getElementById("start-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
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
  let lives = 3;
  let ship;
  let bullets = [];
  let asteroids = [];
  let keys = {};

  class Vector {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    add(v) {
      this.x += v.x;
      this.y += v.y;
    }

    multiply(scalar) {
      this.x *= scalar;
      this.y *= scalar;
    }

    magnitude() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
      const mag = this.magnitude();
      if (mag > 0) {
        this.x /= mag;
        this.y /= mag;
      }
    }
  }

  class Ship {
    constructor() {
      this.pos = new Vector(canvas.width / 2, canvas.height / 2);
      this.vel = new Vector(0, 0);
      this.angle = -Math.PI / 2;
      this.radius = 15;
      this.thrust = 0.15;
      this.friction = 0.99;
      this.rotationSpeed = 0.08;
      this.invulnerable = false;
      this.invulnerableTime = 0;
    }

    rotate(dir) {
      this.angle += dir * this.rotationSpeed;
    }

    accelerate() {
      const thrust = new Vector(
        Math.cos(this.angle) * this.thrust,
        Math.sin(this.angle) * this.thrust,
      );
      this.vel.add(thrust);

      const maxSpeed = 8;
      if (this.vel.magnitude() > maxSpeed) {
        this.vel.normalize();
        this.vel.multiply(maxSpeed);
      }
    }

    update() {
      this.pos.add(this.vel);
      this.vel.multiply(this.friction);

      this.pos.x = (this.pos.x + canvas.width) % canvas.width;
      this.pos.y = (this.pos.y + canvas.height) % canvas.height;

      if (this.invulnerable) {
        this.invulnerableTime--;
        if (this.invulnerableTime <= 0) {
          this.invulnerable = false;
        }
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.angle);

      if (
        this.invulnerable &&
        Math.floor(this.invulnerableTime / 5) % 2 === 0
      ) {
        ctx.globalAlpha = 0.5;
      }

      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.radius, 0);
      ctx.lineTo(-this.radius, this.radius / 2);
      ctx.lineTo(-this.radius / 2, 0);
      ctx.lineTo(-this.radius, -this.radius / 2);
      ctx.closePath();
      ctx.stroke();

      if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
        ctx.strokeStyle = "#ff8800";
        ctx.beginPath();
        ctx.moveTo(-this.radius / 2, this.radius / 3);
        ctx.lineTo(-this.radius - 5, 0);
        ctx.lineTo(-this.radius / 2, -this.radius / 3);
        ctx.stroke();
      }

      ctx.restore();
    }

    shoot() {
      const bullet = new Bullet(
        this.pos.x + Math.cos(this.angle) * this.radius,
        this.pos.y + Math.sin(this.angle) * this.radius,
        this.angle,
      );
      bullets.push(bullet);
    }
  }

  class Bullet {
    constructor(x, y, angle) {
      this.pos = new Vector(x, y);
      this.vel = new Vector(Math.cos(angle) * 10, Math.sin(angle) * 10);
      this.radius = 2;
      this.life = 60;
    }

    update() {
      this.pos.add(this.vel);
      this.pos.x = (this.pos.x + canvas.width) % canvas.width;
      this.pos.y = (this.pos.y + canvas.height) % canvas.height;
      this.life--;
    }

    draw() {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Asteroid {
    constructor(x, y, size) {
      this.pos = new Vector(x, y);
      this.size = size;
      this.radius = size === "large" ? 50 : size === "medium" ? 30 : 15;

      const angle = Math.random() * Math.PI * 2;
      const speed = size === "large" ? 1 : size === "medium" ? 1.5 : 2;
      this.vel = new Vector(Math.cos(angle) * speed, Math.sin(angle) * speed);

      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.05;

      this.vertices = [];
      const numVertices = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < numVertices; i++) {
        const angle = (i / numVertices) * Math.PI * 2;
        const offset = this.radius * (0.7 + Math.random() * 0.3);
        this.vertices.push({
          x: Math.cos(angle) * offset,
          y: Math.sin(angle) * offset,
        });
      }
    }

    update() {
      this.pos.add(this.vel);
      this.rotation += this.rotationSpeed;

      this.pos.x = (this.pos.x + canvas.width) % canvas.width;
      this.pos.y = (this.pos.y + canvas.height) % canvas.height;
    }

    draw() {
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.rotation);

      ctx.strokeStyle = "#888";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
      for (let i = 1; i < this.vertices.length; i++) {
        ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    }

    split() {
      if (this.size === "large") {
        return [
          new Asteroid(this.pos.x, this.pos.y, "medium"),
          new Asteroid(this.pos.x, this.pos.y, "medium"),
        ];
      } else if (this.size === "medium") {
        return [
          new Asteroid(this.pos.x, this.pos.y, "small"),
          new Asteroid(this.pos.x, this.pos.y, "small"),
        ];
      }
      return [];
    }
  }

  function initGame() {
    score = 0;
    lives = 3;
    ship = new Ship();
    bullets = [];
    asteroids = [];

    for (let i = 0; i < 4; i++) {
      spawnAsteroid();
    }

    updateUI();
  }

  function spawnAsteroid() {
    let x, y;
    do {
      x = Math.random() * canvas.width;
      y = Math.random() * canvas.height;
    } while (ship && Math.hypot(x - ship.pos.x, y - ship.pos.y) < 150);

    asteroids.push(new Asteroid(x, y, "large"));
  }

  function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
  }

  function checkCollision(obj1, obj2) {
    const dx = obj1.pos.x - obj2.pos.x;
    const dy = obj1.pos.y - obj2.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.radius + obj2.radius;
  }

  function gameLoop() {
    if (!gameRunning) return;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
      ship.rotate(-1);
    }
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
      ship.rotate(1);
    }
    if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
      ship.accelerate();
    }

    ship.update();
    ship.draw();

    bullets = bullets.filter((bullet) => bullet.life > 0);
    bullets.forEach((bullet) => {
      bullet.update();
      bullet.draw();
    });

    asteroids.forEach((asteroid) => {
      asteroid.update();
      asteroid.draw();
    });

    for (let i = bullets.length - 1; i >= 0; i--) {
      for (let j = asteroids.length - 1; j >= 0; j--) {
        if (checkCollision(bullets[i], asteroids[j])) {
          const newAsteroids = asteroids[j].split();
          asteroids.splice(j, 1);
          asteroids.push(...newAsteroids);
          bullets.splice(i, 1);

          score +=
            asteroids[j]?.size === "large"
              ? 20
              : asteroids[j]?.size === "medium"
                ? 50
                : 100;
          updateUI();
          break;
        }
      }
    }

    if (!ship.invulnerable) {
      for (let i = asteroids.length - 1; i >= 0; i--) {
        if (checkCollision(ship, asteroids[i])) {
          lives--;
          updateUI();

          if (lives <= 0) {
            endGame();
          } else {
            ship = new Ship();
            ship.invulnerable = true;
            ship.invulnerableTime = 90;
          }
          break;
        }
      }
    }

    if (asteroids.length === 0) {
      for (let i = 0; i < 4 + Math.floor(score / 500); i++) {
        spawnAsteroid();
      }
    }

    animationId = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameRunning = true;
    initGame();
    gameLoop();
  }

  function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    finalScoreElement.textContent = `Final Score: ${score}`;
    gameOverScreen.classList.remove("hidden");
  }

  function resetGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    startScreen.classList.remove("hidden");
    gameOverScreen.classList.add("hidden");
    keys = {};
  }

  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (gameRunning && e.key === " ") {
      e.preventDefault();
      ship.shoot();
    }
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  startBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", resetGame);

  backBtn.addEventListener("click", () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "returnToArcade" }, "*");
    } else {
      window.location.href = "../../index.html";
    }
  });

  window.initAsteroids = function (container) {
    return {
      start: startGame,
      stop: () => {
        gameRunning = false;
        cancelAnimationFrame(animationId);
      },
    };
  };
})();
