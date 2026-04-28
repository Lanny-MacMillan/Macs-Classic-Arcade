const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const startBtn = document.getElementById("start-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const backBtn = document.getElementById("back-btn");
const restartBtn = document.getElementById("restart-btn");

canvas.width = 600;
canvas.height = 700;

const GRID_SIZE = 50;
const ROWS = 14;
const COLS = 12;

let gameState = {
  running: false,
  lives: 3,
  level: 1,
  score: 0,
};

let player = {
  x: 5,
  y: 13,
  size: GRID_SIZE - 10,
};

let lanes = [];

function createLanes() {
  lanes = [
    { y: 0, type: "goal", color: "#4CAF50" },
    { y: 1, type: "safe", color: "#8BC34A", obstacles: [] },
    {
      y: 2,
      type: "road",
      color: "#424242",
      obstacles: [],
      speed: -2,
      direction: -1,
    },
    {
      y: 3,
      type: "road",
      color: "#616161",
      obstacles: [],
      speed: 1.5,
      direction: 1,
    },
    {
      y: 4,
      type: "road",
      color: "#424242",
      obstacles: [],
      speed: -2.5,
      direction: -1,
    },
    {
      y: 5,
      type: "road",
      color: "#616161",
      obstacles: [],
      speed: 2,
      direction: 1,
    },
    {
      y: 6,
      type: "road",
      color: "#424242",
      obstacles: [],
      speed: -3,
      direction: -1,
    },
    { y: 7, type: "safe", color: "#8BC34A", obstacles: [] },
    {
      y: 8,
      type: "road",
      color: "#424242",
      obstacles: [],
      speed: 2.5,
      direction: 1,
    },
    {
      y: 9,
      type: "road",
      color: "#616161",
      obstacles: [],
      speed: -2,
      direction: -1,
    },
    {
      y: 10,
      type: "road",
      color: "#424242",
      obstacles: [],
      speed: 3,
      direction: 1,
    },
    {
      y: 11,
      type: "road",
      color: "#616161",
      obstacles: [],
      speed: -1.5,
      direction: -1,
    },
    {
      y: 12,
      type: "road",
      color: "#424242",
      obstacles: [],
      speed: 2,
      direction: 1,
    },
    { y: 13, type: "safe", color: "#8BC34A", obstacles: [] },
  ];

  initializeObstacles();
}

function initializeObstacles() {
  lanes.forEach((lane) => {
    if (lane.type === "road") {
      const baseCount = 2 + Math.floor(gameState.level / 2);
      const count = Math.min(baseCount, 4);
      lane.obstacles = [];

      for (let i = 0; i < count; i++) {
        lane.obstacles.push({
          x: ((i * COLS) / count) * GRID_SIZE + Math.random() * 100,
          width: GRID_SIZE * (1.5 + Math.random()),
          height: GRID_SIZE - 10,
        });
      }
    }
  });
}

function resetPlayer() {
  player.x = 5;
  player.y = 13;
}

function startGame() {
  gameState.running = true;
  gameState.lives = 3;
  gameState.level = 1;
  gameState.score = 0;
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  resetPlayer();
  createLanes();
  updateUI();
  gameLoop();
}

function endGame(won) {
  gameState.running = false;
  gameOverScreen.classList.remove("hidden");

  if (won) {
    document.getElementById("game-over-title").textContent = "You Win!";
    document.getElementById("game-over-message").textContent =
      `Level ${gameState.level} Complete!`;
  } else {
    document.getElementById("game-over-title").textContent = "Game Over";
    document.getElementById("game-over-message").textContent =
      `Final Level: ${gameState.level}`;
  }
}

function updateUI() {
  document.getElementById("lives").textContent = gameState.lives;
  document.getElementById("level").textContent = gameState.level;
}

function drawLanes() {
  lanes.forEach((lane) => {
    ctx.fillStyle = lane.color;
    ctx.fillRect(0, lane.y * GRID_SIZE, canvas.width, GRID_SIZE);

    if (lane.type === "goal") {
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 20px Courier New";
      ctx.textAlign = "center";
      ctx.fillText("GOAL", canvas.width / 2, lane.y * GRID_SIZE + 32);
    }
  });
}

function drawObstacles() {
  lanes.forEach((lane) => {
    if (lane.obstacles) {
      lane.obstacles.forEach((obstacle) => {
        ctx.fillStyle = lane.type === "road" ? "#ff5252" : "#2196F3";
        ctx.fillRect(
          obstacle.x,
          lane.y * GRID_SIZE + 5,
          obstacle.width,
          obstacle.height,
        );

        ctx.fillStyle = "#fff";
        ctx.fillRect(obstacle.x + 5, lane.y * GRID_SIZE + 10, 8, 6);
        ctx.fillRect(
          obstacle.x + obstacle.width - 13,
          lane.y * GRID_SIZE + 10,
          8,
          6,
        );
      });
    }
  });
}

function drawPlayer() {
  const px = player.x * GRID_SIZE + 5;
  const py = player.y * GRID_SIZE + 5;

  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(px, py, player.size, player.size);

  ctx.fillStyle = "#2E7D32";
  ctx.fillRect(px + 10, py + 10, 10, 10);
  ctx.fillRect(px + 25, py + 10, 10, 10);

  ctx.fillStyle = "#fff";
  ctx.fillRect(px + 12, py + 12, 4, 4);
  ctx.fillRect(px + 27, py + 12, 4, 4);
}

function updateObstacles() {
  lanes.forEach((lane) => {
    if (lane.obstacles) {
      lane.obstacles.forEach((obstacle) => {
        obstacle.x += lane.speed * (1 + gameState.level * 0.1);

        if (lane.direction > 0 && obstacle.x > canvas.width) {
          obstacle.x = -obstacle.width;
        } else if (lane.direction < 0 && obstacle.x + obstacle.width < 0) {
          obstacle.x = canvas.width;
        }
      });
    }
  });
}

function checkCollision() {
  const currentLane = lanes[player.y];

  if (currentLane.obstacles) {
    const playerLeft = player.x * GRID_SIZE;
    const playerRight = playerLeft + player.size;
    const playerTop = player.y * GRID_SIZE;
    const playerBottom = playerTop + player.size;

    for (let obstacle of currentLane.obstacles) {
      const obsLeft = obstacle.x;
      const obsRight = obstacle.x + obstacle.width;
      const obsTop = currentLane.y * GRID_SIZE;
      const obsBottom = obsTop + obstacle.height;

      if (
        playerRight > obsLeft &&
        playerLeft < obsRight &&
        playerBottom > obsTop &&
        playerTop < obsBottom
      ) {
        return true;
      }
    }
  }

  return false;
}

function handleCollision() {
  gameState.lives--;
  updateUI();

  if (gameState.lives <= 0) {
    endGame(false);
  } else {
    resetPlayer();
  }
}

function checkWin() {
  if (player.y === 0) {
    gameState.level++;
    updateUI();
    resetPlayer();
    createLanes();
  }
}

function handleKeyPress(e) {
  if (!gameState.running) return;

  const key = e.key.toLowerCase();

  if ((key === "arrowup" || key === "w") && player.y > 0) {
    player.y--;
  } else if ((key === "arrowdown" || key === "s") && player.y < ROWS - 1) {
    player.y++;
  } else if ((key === "arrowleft" || key === "a") && player.x > 0) {
    player.x--;
  } else if ((key === "arrowright" || key === "d") && player.x < COLS - 1) {
    player.x++;
  }

  checkWin();
}

function gameLoop() {
  if (!gameState.running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLanes();
  updateObstacles();
  drawObstacles();
  drawPlayer();

  if (checkCollision()) {
    handleCollision();
  }

  requestAnimationFrame(gameLoop);
}

startBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", () => {
  if (gameState.running) {
    gameState.running = false;
  }
  startGame();
});

backBtn.addEventListener("click", () => {
  window.parent.postMessage({ action: "backToArcade" }, "*");
});

document.addEventListener("keydown", handleKeyPress);

function initFrogger(container) {
  if (container) {
    container.appendChild(document.querySelector(".game-wrapper"));
  }
  createLanes();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { initFrogger };
}
