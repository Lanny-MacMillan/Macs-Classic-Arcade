(function () {
  const GRID_SIZE = 5;

  const state = {
    grid: [],
    moves: 0,
    gameWon: false,
  };

  function initGame() {
    state.moves = 0;
    state.gameWon = false;
    state.grid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(false));

    generateSolvablePuzzle();
    renderBoard();
    updateMoveCounter();
    clearMessage();
  }

  function generateSolvablePuzzle() {
    const clicks = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < clicks; i++) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      toggleCellAndNeighbors(row, col, false);
    }
  }

  function renderBoard() {
    const board = document.querySelector(".game-board");
    board.innerHTML = "";

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        if (state.grid[row][col]) {
          cell.classList.add("on");
        }
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener("click", handleCellClick);
        board.appendChild(cell);
      }
    }
  }

  function handleCellClick(e) {
    if (state.gameWon) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    toggleCellAndNeighbors(row, col, true);
    state.moves++;

    renderBoard();
    updateMoveCounter();
    checkWin();
  }

  function toggleCellAndNeighbors(row, col, countMove) {
    toggleCell(row, col);
    toggleCell(row - 1, col);
    toggleCell(row + 1, col);
    toggleCell(row, col - 1);
    toggleCell(row, col + 1);
  }

  function toggleCell(row, col) {
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      state.grid[row][col] = !state.grid[row][col];
    }
  }

  function checkWin() {
    const allOff = state.grid.every((row) => row.every((cell) => !cell));

    if (allOff) {
      state.gameWon = true;
      showMessage(`You Won in ${state.moves} moves!`);
    }
  }

  function updateMoveCounter() {
    document.querySelector(".move-value").textContent = state.moves;
  }

  function showMessage(text) {
    document.querySelector(".game-message").textContent = text;
  }

  function clearMessage() {
    document.querySelector(".game-message").textContent = "";
  }

  function resetGame() {
    initGame();
  }

  function goBackToArcade() {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  }

  document.querySelector(".reset-btn").addEventListener("click", resetGame);
  document.getElementById("back-btn").addEventListener("click", goBackToArcade);

  initGame();
})();
