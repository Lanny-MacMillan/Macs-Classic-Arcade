(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreElement = document.getElementById("score");
  const levelElement = document.getElementById("level");
  const startScreen = document.getElementById("start-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  const startBtn = document.getElementById("start-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const restartBtn = document.getElementById("restart-btn");
  const backBtn = document.getElementById("back-btn");

  canvas.width = 800;
  canvas.height = 600;

  let ball,
    paddle,
    bricks,
    score,
    level,
    gameRunning,
    animationId,
    levelTransition;

  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 15;
  const BALL_RADIUS = 8;
  const BRICK_COLS = 10;
  const BRICK_WIDTH = 70;
  const BRICK_HEIGHT = 25;
  const BRICK_PADDING = 10;
  const BRICK_OFFSET_TOP = 60;
  const BRICK_OFFSET_LEFT = 35;
  const BASE_SPEED = 4;
  const MAX_LEVEL = 10;

  const BRICK_COLORS = ["#ff006e", "#fb5607", "#ffbe0b", "#8338ec", "#3a86ff"];

  function init() {
    level = 1;
    score = 0;
    gameRunning = false;
    levelTransition = false;
    initLevel();
    updateScore();
    updateLevel();
  }

  function initLevel() {
    const speedMultiplier = 1 + (level - 1) * 0.15;
    const brickRows = Math.min(4 + level, 8);

    ball = {
      x: canvas.width / 2,
      y: canvas.height - 100,
      dx: BASE_SPEED * speedMultiplier,
      dy: -BASE_SPEED * speedMultiplier,
      radius: BALL_RADIUS,
    };

    paddle = {
      x: canvas.width / 2 - PADDLE_WIDTH / 2,
      y: canvas.height - 30,
      width: Math.max(PADDLE_WIDTH - (level - 1) * 5, 60),
      height: PADDLE_HEIGHT,
      speed: 8,
    };

    bricks = [];
    for (let row = 0; row < brickRows; row++) {
      bricks[row] = [];
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks[row][col] = {
          x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
          status: 1,
          color: BRICK_COLORS[row % BRICK_COLORS.length],
        };
      }
    }
  }

  function updateScore() {
    scoreElement.textContent = score;
  }

  function updateLevel() {
    levelElement.textContent = level;
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#00ff88";
    ctx.fill();
    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 5);
    ctx.fillStyle = "#00d4ff";
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 0;
    ctx.closePath();
  }

  function drawBricks() {
    for (let row = 0; row < bricks.length; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const brick = bricks[row][col];
        if (brick.status === 1) {
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT, 5);
          ctx.fillStyle = brick.color;
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
  }

  function collisionDetection() {
    let bricksLeft = 0;

    for (let row = 0; row < bricks.length; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const brick = bricks[row][col];
        if (brick.status === 1) {
          bricksLeft++;

          if (
            ball.x > brick.x &&
            ball.x < brick.x + BRICK_WIDTH &&
            ball.y > brick.y &&
            ball.y < brick.y + BRICK_HEIGHT
          ) {
            ball.dy = -ball.dy;
            brick.status = 0;
            score += 10 * level;
            updateScore();
            bricksLeft--;
          }
        }
      }
    }

    if (bricksLeft === 0 && !levelTransition) {
      levelTransition = true;
      nextLevel();
    }
  }

  function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
    }

    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
    }

    if (ball.y + ball.radius > canvas.height) {
      endGame(false);
      return;
    }

    if (
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      const hitPos = (ball.x - paddle.x) / paddle.width;
      const angle = ((hitPos - 0.5) * Math.PI) / 3;
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = speed * Math.sin(angle);
      ball.dy = -Math.abs(speed * Math.cos(angle));
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();

    if (levelTransition) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Level Complete!", canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = "24px Arial";
      ctx.fillStyle = "#00d4ff";
      ctx.fillText(
        `Starting Level ${level}...`,
        canvas.width / 2,
        canvas.height / 2 + 30,
      );
    }
  }

  function gameLoop() {
    if (!gameRunning) return;

    moveBall();
    collisionDetection();
    draw();

    animationId = requestAnimationFrame(gameLoop);
  }

  function nextLevel() {
    gameRunning = false;

    setTimeout(() => {
      if (level >= MAX_LEVEL) {
        endGame(true, true);
        return;
      }

      level++;
      updateLevel();
      initLevel();
      levelTransition = false;
      gameRunning = true;
    }, 2000);
  }

  function startGame() {
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameRunning = true;
    gameLoop();
  }

  function endGame(won, allLevels = false) {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    const title = document.getElementById("game-over-title");
    const message = document.getElementById("game-over-message");

    if (won) {
      if (allLevels) {
        title.textContent = "Game Complete!";
        title.style.color = "#ffb800";
        message.textContent = `You beat all ${MAX_LEVEL} levels! Final Score: ${score}`;
      } else {
        title.textContent = "You Win!";
        title.style.color = "#00ff88";
        message.textContent = `Level ${level} Complete! Score: ${score}`;
      }
    } else {
      title.textContent = "Game Over";
      title.style.color = "#ff4c4c";
      message.textContent = `Level: ${level} | Score: ${score}`;
    }

    gameOverScreen.classList.remove("hidden");
  }

  function resetGame() {
    cancelAnimationFrame(animationId);
    init();
    draw();
    startScreen.classList.remove("hidden");
    gameOverScreen.classList.add("hidden");
  }

  const keys = {};

  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  function updatePaddle() {
    if ((keys["ArrowLeft"] || keys["a"] || keys["A"]) && paddle.x > 0) {
      paddle.x -= paddle.speed;
    }
    if (
      (keys["ArrowRight"] || keys["d"] || keys["D"]) &&
      paddle.x + paddle.width < canvas.width
    ) {
      paddle.x += paddle.speed;
    }

    requestAnimationFrame(updatePaddle);
  }

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    if (mouseX > 0 && mouseX < canvas.width) {
      paddle.x = mouseX - paddle.width / 2;

      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
      }
    }
  });

  startBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", () => {
    resetGame();
    startGame();
  });
  restartBtn.addEventListener("click", resetGame);
  backBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
  });

  init();
  draw();
  updatePaddle();

  window.initBreakout = function (container) {
    if (container) {
      container.appendChild(canvas);
    }
    init();
    draw();
  };
})();
