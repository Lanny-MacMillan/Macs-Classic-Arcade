const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER1 = 1;
const PLAYER2 = 2;

let board = [];
let currentPlayer = PLAYER1;
let gameOver = false;
let gameMode = null;
let difficulty = null;
let isAIThinking = false;

function initConnectFour(container) {
  if (container) {
    const boardElement = container.querySelector("#board");
    if (boardElement) {
      initGame(boardElement);
    }
  } else {
    initGame();
  }
}

function initGame(customBoard) {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
  currentPlayer = PLAYER1;
  gameOver = false;

  const boardElement = customBoard || document.getElementById("board");
  boardElement.innerHTML = "";

  for (let col = 0; col < COLS; col++) {
    const column = document.createElement("div");
    column.className = "column";
    column.dataset.col = col;
    column.addEventListener("click", handleColumnClick);

    for (let row = 0; row < ROWS; row++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      column.appendChild(cell);
    }

    boardElement.appendChild(column);
  }

  updateTurnDisplay();
}

function handleColumnClick(e) {
  if (gameOver || isAIThinking) return;
  if (gameMode === "ai" && currentPlayer === PLAYER2) return;

  const col = parseInt(e.currentTarget.dataset.col);
  makeMove(col);
}

function makeMove(col) {
  const row = getLowestEmptyRow(col);

  if (row === -1) return false;

  board[row][col] = currentPlayer;
  updateCell(row, col);

  if (checkWin(row, col)) {
    gameOver = true;
    highlightWinningCells();
    if (gameMode === "ai") {
      updateTurnDisplay(
        currentPlayer === PLAYER1 ? "You Win!" : "Computer Wins!",
      );
    } else {
      updateTurnDisplay(`Player ${currentPlayer} Wins!`);
    }
    return true;
  }

  if (isBoardFull()) {
    gameOver = true;
    updateTurnDisplay("It's a Draw!");
    return true;
  }

  currentPlayer = currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
  updateTurnDisplay();

  if (gameMode === "ai" && currentPlayer === PLAYER2 && !gameOver) {
    setTimeout(makeAIMove, 500);
  }

  return true;
}

function getLowestEmptyRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY) {
      return row;
    }
  }
  return -1;
}

function updateCell(row, col) {
  const cell = document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`,
  );
  if (cell) {
    cell.classList.add(`player${currentPlayer}`);
  }
}

function checkWin(row, col) {
  return (
    checkDirection(row, col, 0, 1) ||
    checkDirection(row, col, 1, 0) ||
    checkDirection(row, col, 1, 1) ||
    checkDirection(row, col, 1, -1)
  );
}

function checkDirection(row, col, rowDir, colDir) {
  let count = 1;
  const player = board[row][col];

  count += countInDirection(row, col, rowDir, colDir, player);
  count += countInDirection(row, col, -rowDir, -colDir, player);

  return count >= 4;
}

function countInDirection(row, col, rowDir, colDir, player) {
  let count = 0;
  let r = row + rowDir;
  let c = col + colDir;

  while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
    count++;
    r += rowDir;
    c += colDir;
  }

  return count;
}

function highlightWinningCells() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] === currentPlayer) {
        if (isPartOfWinningLine(row, col)) {
          const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`,
          );
          if (cell) {
            cell.classList.add("winning");
          }
        }
      }
    }
  }
}

function isPartOfWinningLine(row, col) {
  return (
    checkDirection(row, col, 0, 1) ||
    checkDirection(row, col, 1, 0) ||
    checkDirection(row, col, 1, 1) ||
    checkDirection(row, col, 1, -1)
  );
}

function isBoardFull() {
  return board[0].every((cell) => cell !== EMPTY);
}

function updateTurnDisplay(message) {
  const display = document.getElementById("turn-display");
  if (display) {
    if (message) {
      display.textContent = message;
    } else if (gameMode === "ai") {
      display.textContent =
        currentPlayer === PLAYER1 ? "Your Turn" : "Computer Thinking...";
    } else {
      display.textContent = `Player ${currentPlayer}'s Turn`;
    }
  }
}

function makeAIMove() {
  if (gameOver) return;

  isAIThinking = true;
  updateTurnDisplay();

  let col;
  switch (difficulty) {
    case "easy":
      col = getRandomMove();
      break;
    case "medium":
      col = getMediumMove();
      break;
    case "hard":
      col = getHardMove();
      break;
    default:
      col = getRandomMove();
  }

  if (col !== -1) {
    makeMove(col);
  }

  isAIThinking = false;
}

function getRandomMove() {
  const validCols = [];
  for (let col = 0; col < COLS; col++) {
    if (getLowestEmptyRow(col) !== -1) {
      validCols.push(col);
    }
  }
  return validCols.length > 0
    ? validCols[Math.floor(Math.random() * validCols.length)]
    : -1;
}

function getMediumMove() {
  const winMove = findWinningMove(PLAYER2);
  if (winMove !== -1) return winMove;

  const blockMove = findWinningMove(PLAYER1);
  if (blockMove !== -1) return blockMove;

  return getRandomMove();
}

function getHardMove() {
  const winMove = findWinningMove(PLAYER2);
  if (winMove !== -1) return winMove;

  const blockMove = findWinningMove(PLAYER1);
  if (blockMove !== -1) return blockMove;

  const centerCol = Math.floor(COLS / 2);
  if (getLowestEmptyRow(centerCol) !== -1) {
    if (Math.random() < 0.5) return centerCol;
  }

  let bestCol = -1;
  let bestScore = -Infinity;

  for (let col = 0; col < COLS; col++) {
    const row = getLowestEmptyRow(col);
    if (row === -1) continue;

    board[row][col] = PLAYER2;
    const score = evaluatePosition(row, col);
    board[row][col] = EMPTY;

    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }

  return bestCol !== -1 ? bestCol : getRandomMove();
}

function findWinningMove(player) {
  for (let col = 0; col < COLS; col++) {
    const row = getLowestEmptyRow(col);
    if (row === -1) continue;

    board[row][col] = player;
    const isWin = checkWin(row, col);
    board[row][col] = EMPTY;

    if (isWin) return col;
  }
  return -1;
}

function evaluatePosition(row, col) {
  let score = 0;

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [rowDir, colDir] of directions) {
    let count = 1;
    let openEnds = 0;

    for (let dir of [1, -1]) {
      let r = row + rowDir * dir;
      let c = col + colDir * dir;
      let consecutive = 0;

      while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        if (board[r][c] === PLAYER2) {
          consecutive++;
        } else if (board[r][c] === EMPTY) {
          openEnds++;
          break;
        } else {
          break;
        }
        r += rowDir * dir;
        c += colDir * dir;
      }
      count += consecutive;
    }

    if (count >= 3) score += count * 10;
    if (openEnds > 0) score += openEnds * 5;
  }

  return score;
}

function resetGame() {
  gameMode = null;
  difficulty = null;
  document.getElementById("mode-selection").style.display = "block";
  document.getElementById("game-area").style.display = "none";
  document.getElementById("difficulty-selection").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const modeButtons = document.querySelectorAll(".mode-btn");
  const difficultyButtons = document.querySelectorAll(".difficulty-btn");
  const resetBtn = document.getElementById("reset-btn");

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      gameMode = btn.dataset.mode;

      if (gameMode === "ai") {
        document.getElementById("difficulty-selection").style.display = "block";
      } else {
        startGame();
      }
    });
  });

  difficultyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      difficulty = btn.dataset.difficulty;
      startGame();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", resetGame);
  }
});

function startGame() {
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  initGame();
}
