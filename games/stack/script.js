(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreElement = document.getElementById("score");
  const bestScoreElement = document.getElementById("best-score");
  const finalScoreElement = document.getElementById("final-score");
  const startScreen = document.getElementById("start-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  const startBtn = document.getElementById("start-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const restartBtn = document.getElementById("restart-btn");
  const backBtn = document.getElementById("back-btn");

  canvas.width = 500;
  canvas.height = 600;

  const BLOCK_HEIGHT = 40;
  const INITIAL_BLOCK_WIDTH = 200;
  const BASE_SPEED = 3;
  const SPEED_INCREMENT = 0.3;
  const PERFECT_THRESHOLD = 5;

  let gameRunning = false;
  let animationId;
  let score = 0;
  let bestScore = localStorage.getItem("stackBestScore") || 0;
  let blocks = [];
  let currentBlock = null;
  let gameSpeed = BASE_SPEED;

  bestScoreElement.textContent = bestScore;

  function initGame() {
    blocks = [
      {
        x: canvas.width / 2 - INITIAL_BLOCK_WIDTH / 2,
        y: canvas.height - BLOCK_HEIGHT,
        width: INITIAL_BLOCK_WIDTH,
      },
    ];
    score = 0;
    gameSpeed = BASE_SPEED;
    scoreElement.textContent = score;
    spawnBlock();
  }

  function spawnBlock() {
    const lastBlock = blocks[blocks.length - 1];
    const direction = Math.random() > 0.5 ? 1 : -1;

    currentBlock = {
      x: direction > 0 ? -lastBlock.width : canvas.width,
      y: lastBlock.y - BLOCK_HEIGHT,
      width: lastBlock.width,
      direction: direction,
      speed: gameSpeed,
    };
  }

  function dropBlock() {
    if (!currentBlock || !gameRunning) return;

    const lastBlock = blocks[blocks.length - 1];
    const overlapLeft = Math.max(currentBlock.x, lastBlock.x);
    const overlapRight = Math.min(
      currentBlock.x + currentBlock.width,
      lastBlock.x + lastBlock.width,
    );
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      endGame();
      return;
    }

    const offset = Math.abs(currentBlock.x - lastBlock.x);
    const isPerfect = offset <= PERFECT_THRESHOLD;

    if (isPerfect) {
      currentBlock.x = lastBlock.x;
      currentBlock.width = lastBlock.width;
    } else {
      currentBlock.x = overlapLeft;
      currentBlock.width = overlapWidth;
    }

    blocks.push({
      x: currentBlock.x,
      y: currentBlock.y,
      width: currentBlock.width,
    });

    score++;
    scoreElement.textContent = score;

    if (score % 5 === 0) {
      gameSpeed += SPEED_INCREMENT;
    }

    if (currentBlock.width < 30) {
      endGame();
      return;
    }

    if (currentBlock.y < 150) {
      const shiftAmount = 150 - currentBlock.y;
      blocks.forEach((block) => {
        block.y += shiftAmount;
      });
    }

    currentBlock = null;
    spawnBlock();
  }

  function updateGame() {
    if (!currentBlock) return;

    currentBlock.x += currentBlock.speed * currentBlock.direction;

    if (currentBlock.direction > 0) {
      if (currentBlock.x > canvas.width) {
        currentBlock.x = canvas.width;
        currentBlock.direction *= -1;
      }
    } else {
      if (currentBlock.x + currentBlock.width < 0) {
        currentBlock.x = -currentBlock.width;
        currentBlock.direction *= -1;
      }
    }
  }

  function drawGame() {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");

    blocks.forEach((block, index) => {
      const alpha = Math.max(0.3, 1 - index * 0.02);
      ctx.fillStyle = `rgba(102, 126, 234, ${alpha})`;
      ctx.fillRect(block.x, block.y, block.width, BLOCK_HEIGHT);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(block.x, block.y, block.width, BLOCK_HEIGHT);
    });

    if (currentBlock) {
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(
        currentBlock.x,
        currentBlock.y,
        currentBlock.width,
        BLOCK_HEIGHT,
      );

      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        currentBlock.x,
        currentBlock.y,
        currentBlock.width,
        BLOCK_HEIGHT,
      );
    }
  }

  function gameLoop() {
    if (!gameRunning) return;

    updateGame();
    drawGame();
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

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("stackBestScore", bestScore);
      bestScoreElement.textContent = bestScore;
    }

    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove("hidden");
  }

  function resetGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    startGame();
  }

  startBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", resetGame);

  backBtn.addEventListener("click", () => {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && gameRunning) {
      e.preventDefault();
      dropBlock();
    }
  });

  canvas.addEventListener("click", () => {
    if (gameRunning) {
      dropBlock();
    }
  });

  window.initStack = function (container) {
    const iframe = document.createElement("iframe");
    iframe.src = "./games/stack/index.html";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    container.appendChild(iframe);
  };
})();
