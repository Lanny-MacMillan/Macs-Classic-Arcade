(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const playerScoreElement = document.getElementById("player-score");
  const opponentScoreElement = document.getElementById("opponent-score");
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

  const PADDLE_WIDTH = 12;
  const PADDLE_HEIGHT = 100;
  const BALL_SIZE = 10;
  const PADDLE_SPEED = 6;
  const WINNING_SCORE = 10;

  const DIFFICULTY_SETTINGS = {
    easy: { ballSpeed: 5, aiSpeed: 4.5, label: "Easy" },
    medium: { ballSpeed: 7, aiSpeed: 6, label: "Medium" },
    hard: { ballSpeed: 9, aiSpeed: 7.5, label: "Hard" },
  };

  let currentDifficulty = "easy";
  let gameRunning = false;
  let animationId;

  let leftPaddle = {
    x: 20,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
  };

  let rightPaddle = {
    x: canvas.width - 20 - PADDLE_WIDTH,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
  };

  let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: 5,
    dy: 5,
  };

  let playerScore = 0;
  let opponentScore = 0;

  const keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false,
  };

  function updateAI() {
    const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
    const ballCenter = ball.y;
    const reactionZone = 30;
    const aiSpeed = DIFFICULTY_SETTINGS[currentDifficulty].aiSpeed;

    if (ball.dx > 0) {
      if (ballCenter < paddleCenter - reactionZone) {
        rightPaddle.y -= aiSpeed;
      } else if (ballCenter > paddleCenter + reactionZone) {
        rightPaddle.y += aiSpeed;
      }
    }

    if (rightPaddle.y < 0) {
      rightPaddle.y = 0;
    }
    if (rightPaddle.y > canvas.height - rightPaddle.height) {
      rightPaddle.y = canvas.height - rightPaddle.height;
    }
  }

  function init() {
    leftPaddle.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    rightPaddle.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    resetBall();
    playerScore = 0;
    opponentScore = 0;
    updateScores();
  }

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    const ballSpeed = DIFFICULTY_SETTINGS[currentDifficulty].ballSpeed;
    const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6;
    const direction = Math.random() < 0.5 ? 1 : -1;
    ball.dx = Math.cos(angle) * ballSpeed * direction;
    ball.dy = Math.sin(angle) * ballSpeed;
  }

  function updateScores() {
    playerScoreElement.textContent = playerScore;
    opponentScoreElement.textContent = opponentScore;
  }

  function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }

  function drawCircle(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCenterLine() {
    ctx.setLineDash([10, 15]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawCenterLine();
    drawRect(
      leftPaddle.x,
      leftPaddle.y,
      leftPaddle.width,
      leftPaddle.height,
      "#00ff88",
    );
    drawRect(
      rightPaddle.x,
      rightPaddle.y,
      rightPaddle.width,
      rightPaddle.height,
      "#00ff88",
    );
    drawCircle(ball.x, ball.y, ball.size, "#00d4ff");
  }

  function updatePaddles() {
    if ((keys.w || keys.ArrowUp) && leftPaddle.y > 0) {
      leftPaddle.y -= PADDLE_SPEED;
    }
    if (
      (keys.s || keys.ArrowDown) &&
      leftPaddle.y < canvas.height - leftPaddle.height
    ) {
      leftPaddle.y += PADDLE_SPEED;
    }

    updateAI();
  }

  function checkPaddleCollision(paddle) {
    if (
      ball.x - ball.size < paddle.x + paddle.width &&
      ball.x + ball.size > paddle.x &&
      ball.y + ball.size > paddle.y &&
      ball.y - ball.size < paddle.y + paddle.height
    ) {
      const hitPoint =
        (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
      const angle = hitPoint * (Math.PI / 4);

      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      const direction = paddle === leftPaddle ? 1 : -1;

      ball.dx = Math.cos(angle) * speed * direction;
      ball.dy = Math.sin(angle) * speed;

      ball.x =
        paddle === leftPaddle
          ? paddle.x + paddle.width + ball.size
          : paddle.x - ball.size;

      const speedIncrease = 1.05;
      ball.dx *= speedIncrease;
      ball.dy *= speedIncrease;
    }
  }

  function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y - ball.size <= 0 || ball.y + ball.size >= canvas.height) {
      ball.dy = -ball.dy;
    }

    checkPaddleCollision(leftPaddle);
    checkPaddleCollision(rightPaddle);

    if (ball.x - ball.size < 0) {
      opponentScore++;
      updateScores();
      checkWin();
      if (gameRunning) {
        resetBall();
      }
    } else if (ball.x + ball.size > canvas.width) {
      playerScore++;
      updateScores();
      checkWin();
      if (gameRunning) {
        resetBall();
      }
    }
  }

  function checkWin() {
    if (playerScore >= WINNING_SCORE) {
      endGame("You Win!");
    } else if (opponentScore >= WINNING_SCORE) {
      endGame("You Lose!");
    }
  }

  function endGame(message) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    gameOverTitle.textContent = message;
    gameOverMessage.textContent = `Final Score - Player: ${playerScore} | Opponent: ${opponentScore}`;
    gameOverScreen.classList.remove("hidden");
  }

  function gameLoop() {
    if (!gameRunning) return;

    updatePaddles();
    updateBall();
    draw();

    animationId = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    gameRunning = true;
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameLoop();
  }

  function restartGame() {
    if (gameRunning) {
      cancelAnimationFrame(animationId);
    }
    init();
    startGame();
  }

  document.addEventListener("keydown", (e) => {
    if (e.key in keys) {
      e.preventDefault();
      keys[e.key] = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key in keys) {
      e.preventDefault();
      keys[e.key] = false;
    }
  });

  startBtn.addEventListener("click", () => {
    console.log("Start button clicked!");
    init();
    startGame();
  });

  const difficultyButtons = document.querySelectorAll(".difficulty-btn");
  console.log("Found difficulty buttons:", difficultyButtons.length);
  if (difficultyButtons.length > 0) {
    difficultyButtons.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        console.log("Difficulty button clicked:", this.dataset.difficulty);
        e.stopPropagation();
        e.preventDefault();
        currentDifficulty = this.dataset.difficulty;
        difficultyButtons.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
      });
    });
  }

  playAgainBtn.addEventListener("click", () => {
    init();
    startGame();
  });

  restartBtn.addEventListener("click", restartGame);

  backBtn.addEventListener("click", () => {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  });

  init();
  draw();

  window.initPong = function (container) {
    if (container) {
      container.appendChild(canvas);
    }
    init();
    return {
      start: startGame,
      reset: restartGame,
    };
  };
})();
