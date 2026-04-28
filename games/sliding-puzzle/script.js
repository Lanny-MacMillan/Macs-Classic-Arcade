function initSlidingPuzzle(container) {
  const gameBoard = container.querySelector("#game-board");
  const moveCountEl = container.querySelector("#move-count");
  const gameMessageEl = container.querySelector("#game-message");
  const resetBtn = container.querySelector("#reset-btn");
  const backBtn = container.querySelector("#back-btn");

  let board = [];
  let emptyPos = { row: 3, col: 3 };
  let moveCount = 0;
  let isWon = false;

  function createBoard() {
    board = [];
    let num = 1;
    for (let i = 0; i < 4; i++) {
      board[i] = [];
      for (let j = 0; j < 4; j++) {
        if (i === 3 && j === 3) {
          board[i][j] = 0;
        } else {
          board[i][j] = num++;
        }
      }
    }
    emptyPos = { row: 3, col: 3 };
  }

  function isSolvable(arr) {
    let inversions = 0;
    let flat = arr.flat().filter((n) => n !== 0);

    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) {
          inversions++;
        }
      }
    }

    return inversions % 2 === 0;
  }

  function shuffleBoard() {
    do {
      for (let i = 0; i < 200; i++) {
        const validMoves = getValidMoves();
        const randomMove =
          validMoves[Math.floor(Math.random() * validMoves.length)];
        swapTiles(randomMove.row, randomMove.col, false);
      }
    } while (!isSolvable(board));
  }

  function getValidMoves() {
    const moves = [];
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ];

    directions.forEach((dir) => {
      const newRow = emptyPos.row + dir.row;
      const newCol = emptyPos.col + dir.col;

      if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
        moves.push({ row: newRow, col: newCol });
      }
    });

    return moves;
  }

  function swapTiles(row, col, countMove = true) {
    board[emptyPos.row][emptyPos.col] = board[row][col];
    board[row][col] = 0;
    emptyPos = { row, col };

    if (countMove) {
      moveCount++;
      moveCountEl.textContent = moveCount;
    }
  }

  function isAdjacent(row, col) {
    const rowDiff = Math.abs(row - emptyPos.row);
    const colDiff = Math.abs(col - emptyPos.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  function checkWin() {
    let num = 1;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i === 3 && j === 3) {
          return board[i][j] === 0;
        }
        if (board[i][j] !== num++) {
          return false;
        }
      }
    }
    return true;
  }

  function handleTileClick(row, col) {
    if (isWon) return;

    if (isAdjacent(row, col)) {
      swapTiles(row, col);
      render();

      if (checkWin()) {
        isWon = true;
        gameMessageEl.textContent = `You Won in ${moveCount} moves!`;
      }
    }
  }

  function render() {
    gameBoard.innerHTML = "";

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const tile = document.createElement("div");
        tile.className = "tile";

        if (board[i][j] === 0) {
          tile.classList.add("empty");
        } else {
          tile.textContent = board[i][j];
          tile.addEventListener("click", () => handleTileClick(i, j));
        }

        gameBoard.appendChild(tile);
      }
    }
  }

  function resetGame() {
    moveCount = 0;
    isWon = false;
    moveCountEl.textContent = "0";
    gameMessageEl.textContent = "";
    createBoard();
    shuffleBoard();
    render();
  }

  resetBtn.addEventListener("click", resetGame);

  backBtn.addEventListener("click", () => {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  });

  resetGame();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initSlidingPuzzle(document);
  });
} else {
  initSlidingPuzzle(document);
}
