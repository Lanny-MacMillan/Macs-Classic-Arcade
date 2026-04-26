(function () {
  const state = {
    board: Array(9).fill(null),
    currentPlayer: "X",
    gameActive: true,
    gameMode: "2player",
    winningCombos: [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ],
  };

  function createBoard() {
    const boardElement = document.querySelector(".game-board");
    boardElement.innerHTML = "";

    state.board.forEach((_, index) => {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.dataset.index = index;
      cell.addEventListener("click", () => handleCellClick(index));
      boardElement.appendChild(cell);
    });
  }

  function handleCellClick(index) {
    if (!state.gameActive || state.board[index]) return;
    if (state.gameMode === "computer" && state.currentPlayer === "O") return;

    makeMove(index);
  }

  function makeMove(index) {
    state.board[index] = state.currentPlayer;
    updateBoard();

    const winner = checkWinner();
    if (winner) {
      handleGameEnd(winner);
    } else if (state.board.every((cell) => cell !== null)) {
      handleGameEnd(null);
    } else {
      state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
      updateStatus();

      if (state.gameMode === "computer" && state.currentPlayer === "O") {
        setTimeout(() => computerMove(), 500);
      }
    }
  }

  function computerMove() {
    if (!state.gameActive) return;

    const bestMove = findBestMove();
    if (bestMove !== -1) {
      makeMove(bestMove);
    }
  }

  function findBestMove() {
    const available = state.board
      .map((cell, idx) => (cell === null ? idx : null))
      .filter((idx) => idx !== null);

    if (available.length === 0) return -1;

    for (const idx of available) {
      state.board[idx] = "O";
      if (checkWinner()) {
        state.board[idx] = null;
        return idx;
      }
      state.board[idx] = null;
    }

    for (const idx of available) {
      state.board[idx] = "X";
      if (checkWinner()) {
        state.board[idx] = null;
        return idx;
      }
      state.board[idx] = null;
    }

    if (available.includes(4)) return 4;

    const corners = [0, 2, 6, 8].filter((idx) => available.includes(idx));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return available[Math.floor(Math.random() * available.length)];
  }

  function checkWinner() {
    for (const combo of state.winningCombos) {
      const [a, b, c] = combo;
      if (
        state.board[a] &&
        state.board[a] === state.board[b] &&
        state.board[a] === state.board[c]
      ) {
        return { player: state.board[a], combo };
      }
    }
    return null;
  }

  function handleGameEnd(winner) {
    state.gameActive = false;
    const statusElement = document.querySelector(".game-status");

    if (winner) {
      statusElement.textContent = `Player ${winner.player} Wins!`;
      highlightWinningCells(winner.combo);
    } else {
      statusElement.textContent = "It's a Draw!";
    }

    disableBoard();
  }

  function highlightWinningCells(combo) {
    const cells = document.querySelectorAll(".cell");
    combo.forEach((index) => {
      cells[index].classList.add("winning");
    });
  }

  function disableBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => (cell.disabled = true));
  }

  function updateBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
      const value = state.board[index];
      cell.textContent = value || "";
      cell.className = "cell";
      if (value) {
        cell.classList.add(value.toLowerCase());
        cell.disabled = true;
      }
    });
  }

  function updateStatus() {
    const statusElement = document.querySelector(".game-status");
    if (state.gameMode === "computer" && state.currentPlayer === "O") {
      statusElement.textContent = "Computer's Turn";
    } else {
      statusElement.textContent = `Player ${state.currentPlayer}'s Turn`;
    }
  }

  function setGameMode(mode) {
    state.gameMode = mode;
    const modeButtons = document.querySelectorAll(".mode-btn");
    modeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });
    resetGame();
  }

  function resetGame() {
    state.board = Array(9).fill(null);
    state.currentPlayer = "X";
    state.gameActive = true;

    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.textContent = "";
      cell.className = "cell";
      cell.disabled = false;
    });

    updateStatus();
  }

  function goBackToArcade() {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  }

  createBoard();
  updateStatus();

  document.querySelector(".reset-btn").addEventListener("click", resetGame);
  document.getElementById("back-btn").addEventListener("click", goBackToArcade);

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => setGameMode(btn.dataset.mode));
  });
})();
