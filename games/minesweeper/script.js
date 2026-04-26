const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 20, cols: 20, mines: 80 },
};

let currentDifficulty = "easy";
let ROWS = DIFFICULTIES.easy.rows;
let COLS = DIFFICULTIES.easy.cols;
let MINE_COUNT = DIFFICULTIES.easy.mines;

let board = [];
let gameState = "playing";
let revealedCount = 0;
let flagCount = 0;

function initGame(container) {
  if (container) {
    const boardElement = container.querySelector("#board");
    const resetBtn = container.querySelector("#reset-btn");
    const backBtn = container.querySelector("#back-btn");

    if (boardElement) {
      resetGame();
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", resetGame);
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.href = "../../index.html";
      });
    }

    setupDifficultyButtons(container);
  } else {
    resetGame();

    document.getElementById("reset-btn").addEventListener("click", resetGame);
    document.getElementById("back-btn").addEventListener("click", () => {
      window.location.href = "../../index.html";
    });

    setupDifficultyButtons();
  }
}

function setupDifficultyButtons(container) {
  const parent = container || document;

  const easyBtn = parent.querySelector("#easy-btn");
  const mediumBtn = parent.querySelector("#medium-btn");
  const hardBtn = parent.querySelector("#hard-btn");

  if (easyBtn) {
    easyBtn.addEventListener("click", () => setDifficulty("easy"));
  }
  if (mediumBtn) {
    mediumBtn.addEventListener("click", () => setDifficulty("medium"));
  }
  if (hardBtn) {
    hardBtn.addEventListener("click", () => setDifficulty("hard"));
  }
}

function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  const config = DIFFICULTIES[difficulty];

  ROWS = config.rows;
  COLS = config.cols;
  MINE_COUNT = config.mines;

  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.getElementById(`${difficulty}-btn`).classList.add("active");

  updateBoardGridSize();
  resetGame();
}

function updateBoardGridSize() {
  const boardElement = document.getElementById("board");
  if (boardElement) {
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  }
}

function createBoard() {
  board = [];

  for (let row = 0; row < ROWS; row++) {
    board[row] = [];
    for (let col = 0; col < COLS; col++) {
      board[row][col] = {
        isMine: false,
        revealed: false,
        flagged: false,
        adjacentMines: 0,
      };
    }
  }

  placeMines();
  calculateAdjacentMines();
}

function placeMines() {
  let minesPlaced = 0;

  while (minesPlaced < MINE_COUNT) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * COLS);

    if (!board[row][col].isMine) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }
}

function calculateAdjacentMines() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!board[row][col].isMine) {
        board[row][col].adjacentMines = countAdjacentMines(row, col);
      }
    }
  }
}

function countAdjacentMines(row, col) {
  let count = 0;

  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c].isMine) {
        count++;
      }
    }
  }

  return count;
}

function renderBoard() {
  const boardElement = document.getElementById("board");
  boardElement.innerHTML = "";
  boardElement.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = createCellElement(row, col);
      boardElement.appendChild(cell);
    }
  }

  updateDisplay();
}

function createCellElement(row, col) {
  const cell = document.createElement("button");
  cell.className = "cell";
  cell.dataset.row = row;
  cell.dataset.col = col;

  const cellData = board[row][col];

  if (cellData.revealed) {
    cell.classList.add("revealed");

    if (cellData.isMine) {
      cell.classList.add("mine");
      cell.textContent = "💣";
    } else if (cellData.adjacentMines > 0) {
      cell.textContent = cellData.adjacentMines;
      cell.dataset.count = cellData.adjacentMines;
    }
  } else if (cellData.flagged) {
    cell.classList.add("flagged");
    cell.textContent = "!";
  }

  cell.addEventListener("click", () => handleLeftClick(row, col));
  cell.addEventListener("contextmenu", (e) => handleRightClick(e, row, col));

  return cell;
}

function handleLeftClick(row, col) {
  if (gameState !== "playing") return;

  const cell = board[row][col];

  if (cell.revealed || cell.flagged) return;

  if (cell.isMine) {
    revealCell(row, col);
    gameOver(false);
  } else {
    revealCell(row, col);

    if (cell.adjacentMines === 0) {
      revealAdjacentCells(row, col);
    }

    checkWin();
  }

  renderBoard();
}

function handleRightClick(e, row, col) {
  e.preventDefault();

  if (gameState !== "playing") return;

  const cell = board[row][col];

  if (cell.revealed) return;

  if (cell.flagged) {
    cell.flagged = false;
    flagCount--;
  } else {
    cell.flagged = true;
    flagCount++;
  }

  renderBoard();
}

function revealCell(row, col) {
  const cell = board[row][col];

  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;

  if (!cell.isMine) {
    revealedCount++;
  }
}

function revealAdjacentCells(row, col) {
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        const cell = board[r][c];

        if (!cell.revealed && !cell.flagged && !cell.isMine) {
          revealCell(r, c);

          if (cell.adjacentMines === 0) {
            revealAdjacentCells(r, c);
          }
        }
      }
    }
  }
}

function checkWin() {
  const totalSafeCells = ROWS * COLS - MINE_COUNT;

  if (revealedCount === totalSafeCells) {
    gameOver(true);
  }
}

function gameOver(won) {
  gameState = won ? "won" : "lost";

  if (!won) {
    revealAllMines();
  }

  renderBoard();
}

function revealAllMines() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col].isMine) {
        board[row][col].revealed = true;
      }
    }
  }
}

function updateDisplay() {
  const mineCountElement = document.getElementById("mine-count");
  const gameStatusElement = document.getElementById("game-status");

  mineCountElement.textContent = MINE_COUNT - flagCount;

  if (gameState === "won") {
    gameStatusElement.textContent = "Won!";
    gameStatusElement.className = "value won";
  } else if (gameState === "lost") {
    gameStatusElement.textContent = "Lost!";
    gameStatusElement.className = "value lost";
  } else {
    gameStatusElement.textContent = "Playing";
    gameStatusElement.className = "value";
  }
}

function resetGame() {
  gameState = "playing";
  revealedCount = 0;
  flagCount = 0;

  createBoard();
  renderBoard();
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initGame());
  } else {
    initGame();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { initGame };
}
