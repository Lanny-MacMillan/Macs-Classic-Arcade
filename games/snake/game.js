(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreElement = document.getElementById("score");
  const restartBtn = document.getElementById("restart-btn");
  const backBtn = document.getElementById("back-btn");
  const startBtn = document.getElementById("start-btn");
  const startScreen = document.getElementById("start-screen");

  const GRID_SIZE = 20;
  const CANVAS_SIZE = 400;
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  let snake = [];
  let direction = { x: 1, y: 0 };
  let food = {};
  let score = 0;
  let gameLoop = null;
  let gameSpeed = 150;
  let gameStarted = false;

  function init() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    direction = { x: 1, y: 0 };
    score = 0;
    updateScore();
    spawnFood();
    draw();

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, gameSpeed);
    gameStarted = true;
  }

  function startGame() {
    startScreen.classList.add("hidden");
    init();
  }

  function spawnFood() {
    food = {
      x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
    };

    if (snake.some((segment) => segment.x === food.x && segment.y === food.y)) {
      spawnFood();
    }
  }

  function update() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (
      head.x < 0 ||
      head.x >= CANVAS_SIZE / GRID_SIZE ||
      head.y < 0 ||
      head.y >= CANVAS_SIZE / GRID_SIZE ||
      snake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      updateScore();
      spawnFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.fillStyle = "#00ff00";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ff00";
    snake.forEach((segment) => {
      ctx.fillRect(
        segment.x * GRID_SIZE,
        segment.y * GRID_SIZE,
        GRID_SIZE - 2,
        GRID_SIZE - 2,
      );
    });

    ctx.fillStyle = "#ff0000";
    ctx.shadowColor = "#ff0000";
    ctx.fillRect(
      food.x * GRID_SIZE,
      food.y * GRID_SIZE,
      GRID_SIZE - 2,
      GRID_SIZE - 2,
    );
    ctx.shadowBlur = 0;
  }

  function gameOver() {
    clearInterval(gameLoop);
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.fillStyle = "#ff0000";
    ctx.font = "40px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    ctx.font = "20px Courier New";
    ctx.fillStyle = "#fff";
    ctx.fillText(
      `Final Score: ${score}`,
      CANVAS_SIZE / 2,
      CANVAS_SIZE / 2 + 40,
    );
  }

  function updateScore() {
    scoreElement.textContent = score;
  }

  function handleKeyPress(e) {
    if (!gameStarted) return;

    const key = e.key.toLowerCase();

    if ((key === "arrowup" || key === "w") && direction.y === 0) {
      direction = { x: 0, y: -1 };
    } else if ((key === "arrowdown" || key === "s") && direction.y === 0) {
      direction = { x: 0, y: 1 };
    } else if ((key === "arrowleft" || key === "a") && direction.x === 0) {
      direction = { x: -1, y: 0 };
    } else if ((key === "arrowright" || key === "d") && direction.x === 0) {
      direction = { x: 1, y: 0 };
    }
  }

  function resetGame() {
    gameStarted = false;
    startScreen.classList.remove("hidden");
    if (gameLoop) clearInterval(gameLoop);
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    direction = { x: 1, y: 0 };
    score = 0;
    updateScore();
    spawnFood();
    draw();
  }

  function goBackToArcade() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ action: "backToArcade" }, "*");
    }
  }

  document.addEventListener("keydown", handleKeyPress);
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", resetGame);
  backBtn.addEventListener("click", goBackToArcade);

  spawnFood();
  draw();
})();
