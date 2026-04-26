(function () {
  const state = {
    grid: [],
    score: 0,
    gameOver: false,
    won: false,
    size: 4,
    tiles: new Map(),
    nextTileId: 0,
  };

  let cellSize = 0;
  let cellGap = 10;

  function initGame() {
    state.grid = Array(state.size)
      .fill(null)
      .map(() => Array(state.size).fill(0));
    state.score = 0;
    state.gameOver = false;
    state.won = false;
    state.tiles.clear();
    state.nextTileId = 0;

    setupBoard();
    addRandomTile(true);
    addRandomTile(true);
    renderGame();
  }

  function setupBoard() {
    const board = document.querySelector(".game-board");
    board.innerHTML = "";

    for (let i = 0; i < state.size; i++) {
      for (let j = 0; j < state.size; j++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        board.appendChild(cell);
      }
    }

    const firstCell = board.querySelector(".cell");
    if (firstCell) {
      cellSize = firstCell.offsetWidth;
    }
  }

  function addRandomTile(isNew = false) {
    const emptyCells = [];
    for (let i = 0; i < state.size; i++) {
      for (let j = 0; j < state.size; j++) {
        if (state.grid[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { row, col } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const value = Math.random() < 0.9 ? 2 : 4;
      state.grid[row][col] = value;

      const tileId = state.nextTileId++;
      state.tiles.set(tileId, { row, col, value, isNew });
    }
  }

  function getTilePosition(row, col) {
    return {
      x: col * (cellSize + cellGap),
      y: row * (cellSize + cellGap),
    };
  }

  function renderGame() {
    const board = document.querySelector(".game-board");
    const scoreValue = document.querySelector(".score-value");
    const message = document.querySelector(".game-message");

    const existingTiles = board.querySelectorAll(".tile");
    const existingTileIds = new Set(
      Array.from(existingTiles).map((t) => parseInt(t.dataset.id)),
    );

    state.tiles.forEach((tile, id) => {
      let tileEl = board.querySelector(`[data-id="${id}"]`);
      const pos = getTilePosition(tile.row, tile.col);

      if (!tileEl) {
        tileEl = document.createElement("div");
        tileEl.className = `tile tile-${tile.value}`;
        if (tile.isNew) {
          tileEl.classList.add("new");
        }
        tileEl.textContent = tile.value;
        tileEl.dataset.id = id;
        tileEl.style.width = `${cellSize}px`;
        tileEl.style.height = `${cellSize}px`;
        tileEl.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        board.appendChild(tileEl);
      } else {
        tileEl.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        if (tileEl.className !== `tile tile-${tile.value}`) {
          tileEl.className = `tile tile-${tile.value}`;
          tileEl.textContent = tile.value;
        }
        existingTileIds.delete(id);
      }
    });

    existingTileIds.forEach((id) => {
      const tileEl = board.querySelector(`[data-id="${id}"]`);
      if (tileEl) tileEl.remove();
    });

    scoreValue.textContent = state.score;

    if (state.won) {
      message.textContent = "You Win!";
      message.className = "game-message won";
    } else if (state.gameOver) {
      message.textContent = "Game Over!";
      message.className = "game-message lost";
    } else {
      message.textContent = "";
      message.className = "game-message";
    }
  }

  function move(direction) {
    if (state.gameOver) return;

    let moved = false;
    const oldGrid = state.grid.map((row) => [...row]);

    state.tiles.forEach((tile) => {
      tile.isNew = false;
    });

    if (direction === "left") {
      moved = moveLeft();
    } else if (direction === "right") {
      moved = moveRight();
    } else if (direction === "up") {
      moved = moveUp();
    } else if (direction === "down") {
      moved = moveDown();
    }

    if (moved) {
      updateTilePositions();
      renderGame();

      setTimeout(() => {
        addRandomTile(true);
        renderGame();
      }, 150);

      checkGameOver();
    }
  }

  function updateTilePositions() {
    const newTiles = new Map();
    let newId = 0;

    for (let i = 0; i < state.size; i++) {
      for (let j = 0; j < state.size; j++) {
        if (state.grid[i][j] !== 0) {
          newTiles.set(newId++, {
            row: i,
            col: j,
            value: state.grid[i][j],
            isNew: false,
          });
        }
      }
    }

    state.tiles = newTiles;
    state.nextTileId = newId;
  }

  function moveLeft() {
    let moved = false;
    for (let i = 0; i < state.size; i++) {
      const row = state.grid[i].filter((val) => val !== 0);
      const merged = [];
      let skip = false;

      for (let j = 0; j < row.length; j++) {
        if (skip) {
          skip = false;
          continue;
        }

        if (j < row.length - 1 && row[j] === row[j + 1]) {
          merged.push(row[j] * 2);
          state.score += row[j] * 2;
          if (row[j] * 2 === 2048 && !state.won) {
            state.won = true;
          }
          skip = true;
        } else {
          merged.push(row[j]);
        }
      }

      while (merged.length < state.size) {
        merged.push(0);
      }

      if (JSON.stringify(state.grid[i]) !== JSON.stringify(merged)) {
        moved = true;
      }
      state.grid[i] = merged;
    }
    return moved;
  }

  function moveRight() {
    reverseRows();
    const moved = moveLeft();
    reverseRows();
    return moved;
  }

  function moveUp() {
    transpose();
    const moved = moveLeft();
    transpose();
    return moved;
  }

  function moveDown() {
    transpose();
    reverseRows();
    const moved = moveLeft();
    reverseRows();
    transpose();
    return moved;
  }

  function transpose() {
    const newGrid = Array(state.size)
      .fill(null)
      .map(() => Array(state.size).fill(0));
    for (let i = 0; i < state.size; i++) {
      for (let j = 0; j < state.size; j++) {
        newGrid[j][i] = state.grid[i][j];
      }
    }
    state.grid = newGrid;
  }

  function reverseRows() {
    state.grid = state.grid.map((row) => row.reverse());
  }

  function checkGameOver() {
    for (let i = 0; i < state.size; i++) {
      for (let j = 0; j < state.size; j++) {
        if (state.grid[i][j] === 0) return;
        if (j < state.size - 1 && state.grid[i][j] === state.grid[i][j + 1])
          return;
        if (i < state.size - 1 && state.grid[i][j] === state.grid[i + 1][j])
          return;
      }
    }
    state.gameOver = true;
  }

  function handleKeyPress(e) {
    if (state.gameOver && !state.won) return;

    const keyMap = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
    };

    if (keyMap[e.key]) {
      e.preventDefault();
      move(keyMap[e.key]);
    }
  }

  function resetGame() {
    initGame();
  }

  function goBackToArcade() {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  }

  document.addEventListener("keydown", handleKeyPress);
  document.querySelector(".reset-btn").addEventListener("click", resetGame);
  document.getElementById("back-btn").addEventListener("click", goBackToArcade);

  initGame();
})();
