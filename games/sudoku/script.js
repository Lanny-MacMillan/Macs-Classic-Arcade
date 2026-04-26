(function () {
  const puzzles = [
    {
      board: [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
      ],
      solution: [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
      ],
    },
    {
      board: [
        [0, 0, 0, 2, 6, 0, 7, 0, 1],
        [6, 8, 0, 0, 7, 0, 0, 9, 0],
        [1, 9, 0, 0, 0, 4, 5, 0, 0],
        [8, 2, 0, 1, 0, 0, 0, 4, 0],
        [0, 0, 4, 6, 0, 2, 9, 0, 0],
        [0, 5, 0, 0, 0, 3, 0, 2, 8],
        [0, 0, 9, 3, 0, 0, 0, 7, 4],
        [0, 4, 0, 0, 5, 0, 0, 3, 6],
        [7, 0, 3, 0, 1, 8, 0, 0, 0],
      ],
      solution: [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, 5, 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9],
      ],
    },
    {
      board: [
        [0, 0, 0, 6, 0, 0, 4, 0, 0],
        [7, 0, 0, 0, 0, 3, 6, 0, 0],
        [0, 0, 0, 0, 9, 1, 0, 8, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 5, 0, 1, 8, 0, 0, 0, 3],
        [0, 0, 0, 3, 0, 6, 0, 4, 5],
        [0, 4, 0, 2, 0, 0, 0, 6, 0],
        [9, 0, 3, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 1, 0, 0],
      ],
      solution: [
        [5, 8, 1, 6, 7, 2, 4, 3, 9],
        [7, 9, 2, 8, 4, 3, 6, 5, 1],
        [3, 6, 4, 5, 9, 1, 7, 8, 2],
        [4, 3, 8, 9, 5, 7, 2, 1, 6],
        [2, 5, 6, 1, 8, 4, 9, 7, 3],
        [1, 7, 9, 3, 2, 6, 8, 4, 5],
        [8, 4, 5, 2, 1, 9, 3, 6, 7],
        [9, 1, 3, 7, 6, 8, 5, 2, 4],
        [6, 2, 7, 4, 3, 5, 1, 9, 8],
      ],
    },
  ];

  const state = {
    currentPuzzle: 0,
    board: [],
    initialBoard: [],
    solution: [],
    selectedCell: null,
  };

  function init() {
    loadPuzzle(0);
    createBoard();
    attachEventListeners();
  }

  function loadPuzzle(index) {
    const puzzle = puzzles[index];
    state.currentPuzzle = index;
    state.initialBoard = puzzle.board.map((row) => [...row]);
    state.board = puzzle.board.map((row) => [...row]);
    state.solution = puzzle.solution;
    state.selectedCell = null;
  }

  function createBoard() {
    const boardElement = document.querySelector(".sudoku-board");
    boardElement.innerHTML = "";

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = document.createElement("div");
        cell.className = "sudoku-cell";
        cell.dataset.row = row;
        cell.dataset.col = col;

        const value = state.board[row][col];
        if (value !== 0) {
          cell.textContent = value;
          if (state.initialBoard[row][col] !== 0) {
            cell.classList.add("fixed");
          }
        }

        cell.addEventListener("click", () => selectCell(row, col));
        boardElement.appendChild(cell);
      }
    }
  }

  function selectCell(row, col) {
    if (state.initialBoard[row][col] !== 0) {
      return;
    }

    state.selectedCell = { row, col };
    updateBoard();
  }

  function updateBoard() {
    const cells = document.querySelectorAll(".sudoku-cell");
    cells.forEach((cell) => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);

      cell.classList.remove("selected", "invalid");

      if (
        state.selectedCell &&
        state.selectedCell.row === row &&
        state.selectedCell.col === col
      ) {
        cell.classList.add("selected");
      }

      const value = state.board[row][col];
      cell.textContent = value === 0 ? "" : value;

      if (value !== 0 && !isValidPlacement(row, col, value)) {
        cell.classList.add("invalid");
      }
    });

    checkWin();
  }

  function handleKeyPress(e) {
    if (!state.selectedCell) return;

    const { row, col } = state.selectedCell;

    if (state.initialBoard[row][col] !== 0) return;

    if (e.key >= "1" && e.key <= "9") {
      state.board[row][col] = parseInt(e.key);
      updateBoard();
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      state.board[row][col] = 0;
      updateBoard();
    }
  }

  function isValidPlacement(row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (i !== col && state.board[row][i] === num) {
        return false;
      }
    }

    for (let i = 0; i < 9; i++) {
      if (i !== row && state.board[i][col] === num) {
        return false;
      }
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if ((i !== row || j !== col) && state.board[i][j] === num) {
          return false;
        }
      }
    }

    return true;
  }

  function checkWin() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (state.board[row][col] === 0) {
          updateStatus("Select a cell and type 1-9");
          return;
        }
        if (!isValidPlacement(row, col, state.board[row][col])) {
          updateStatus("Invalid entries detected");
          return;
        }
      }
    }

    updateStatus("Congratulations! Puzzle solved!", true);
  }

  function updateStatus(message, isWin = false) {
    const statusElement = document.querySelector(".game-status");
    statusElement.textContent = message;
    statusElement.classList.remove("win", "error");

    if (isWin) {
      statusElement.classList.add("win");
    } else if (message.includes("Invalid")) {
      statusElement.classList.add("error");
    }
  }

  function resetGame() {
    state.board = state.initialBoard.map((row) => [...row]);
    state.selectedCell = null;
    updateBoard();
    updateStatus("Select a cell and type 1-9");
  }

  function newPuzzle() {
    const nextPuzzle = (state.currentPuzzle + 1) % puzzles.length;
    loadPuzzle(nextPuzzle);
    createBoard();
    updateStatus("Select a cell and type 1-9");
  }

  function goBackToArcade() {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  }

  function attachEventListeners() {
    document.addEventListener("keydown", handleKeyPress);
    document.querySelector(".reset-btn").addEventListener("click", resetGame);
    document
      .querySelector(".new-puzzle-btn")
      .addEventListener("click", newPuzzle);
    document
      .getElementById("back-btn")
      .addEventListener("click", goBackToArcade);
  }

  init();
})();
