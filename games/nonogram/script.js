(function () {
  const puzzleGrid = document.getElementById("puzzle-grid");
  const checkBtn = document.getElementById("check-btn");
  const clearBtn = document.getElementById("clear-btn");
  const newPuzzleBtn = document.getElementById("new-puzzle-btn");
  const backBtn = document.getElementById("back-btn");
  const messageEl = document.getElementById("message");
  const instructionsEl = document.getElementById("instructions");
  const closeInstructionsBtn = document.getElementById("close-instructions");
  const infoBtn = document.getElementById("info-btn");

  const puzzles = [
    {
      size: 5,
      solution: [
        [0, 1, 1, 1, 0],
        [1, 1, 0, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 0, 1, 1],
        [0, 1, 1, 1, 0],
      ],
    },
    {
      size: 5,
      solution: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
      ],
    },
    {
      size: 5,
      solution: [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
      ],
    },
  ];

  let currentPuzzle = null;
  let userGrid = [];

  function initNonogram() {
    loadRandomPuzzle();
    setupEventListeners();
  }

  function setupEventListeners() {
    checkBtn.addEventListener("click", checkSolution);
    clearBtn.addEventListener("click", clearGrid);
    newPuzzleBtn.addEventListener("click", loadRandomPuzzle);
    infoBtn.addEventListener("click", () => {
      instructionsEl.style.display = "block";
    });
    closeInstructionsBtn.addEventListener("click", () => {
      instructionsEl.style.display = "none";
    });
    backBtn.addEventListener("click", () => {
      window.parent.postMessage({ action: "backToArcade" }, "*");
    });
  }

  function loadRandomPuzzle() {
    const randomIndex = Math.floor(Math.random() * puzzles.length);
    currentPuzzle = puzzles[randomIndex];
    initGrid();
    messageEl.textContent = "";
  }

  function initGrid() {
    const size = currentPuzzle.size;
    userGrid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));

    const rowClues = calculateClues(currentPuzzle.solution);
    const colClues = calculateClues(transpose(currentPuzzle.solution));

    renderGrid(size, rowClues, colClues);
  }

  function calculateClues(lines) {
    return lines.map((line) => {
      const clues = [];
      let count = 0;

      for (let cell of line) {
        if (cell === 1) {
          count++;
        } else if (count > 0) {
          clues.push(count);
          count = 0;
        }
      }

      if (count > 0) clues.push(count);
      return clues.length > 0 ? clues : [0];
    });
  }

  function transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
  }

  function renderGrid(size, rowClues, colClues) {
    puzzleGrid.innerHTML = "";

    const maxRowClues = Math.max(...rowClues.map((c) => c.length));
    const maxColClues = Math.max(...colClues.map((c) => c.length));

    puzzleGrid.style.gridTemplateColumns = `repeat(${maxRowClues}, 30px) repeat(${size}, 30px)`;
    puzzleGrid.style.gridTemplateRows = `repeat(${maxColClues}, 30px) repeat(${size}, 30px)`;

    // Top-left corner spacer
    for (let i = 0; i < maxColClues * maxRowClues; i++) {
      const spacer = document.createElement("div");
      spacer.className = "clue-cell empty";
      puzzleGrid.appendChild(spacer);
    }

    // Column clues
    for (let row = 0; row < maxColClues; row++) {
      for (let col = 0; col < size; col++) {
        const clueCell = document.createElement("div");
        clueCell.className = "clue-cell";
        const clueIndex = row - (maxColClues - colClues[col].length);
        clueCell.textContent = clueIndex >= 0 ? colClues[col][clueIndex] : "";
        puzzleGrid.appendChild(clueCell);
      }
    }

    // Row clues and grid cells
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < maxRowClues; col++) {
        const clueCell = document.createElement("div");
        clueCell.className = "clue-cell";
        const clueIndex = col - (maxRowClues - rowClues[row].length);
        clueCell.textContent = clueIndex >= 0 ? rowClues[row][clueIndex] : "";
        puzzleGrid.appendChild(clueCell);
      }

      for (let col = 0; col < size; col++) {
        const cell = document.createElement("div");
        cell.className = "grid-cell";
        cell.dataset.row = row;
        cell.dataset.col = col;

        cell.addEventListener("click", () => toggleCell(row, col, cell));
        cell.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          markCell(row, col, cell);
        });

        puzzleGrid.appendChild(cell);
      }
    }
  }

  function toggleCell(row, col, cellElement) {
    if (userGrid[row][col] === 2) {
      userGrid[row][col] = 0;
      cellElement.classList.remove("marked");
    }

    userGrid[row][col] = userGrid[row][col] === 1 ? 0 : 1;
    cellElement.classList.toggle("filled");
  }

  function markCell(row, col, cellElement) {
    if (userGrid[row][col] === 1) {
      userGrid[row][col] = 0;
      cellElement.classList.remove("filled");
    }

    userGrid[row][col] = userGrid[row][col] === 2 ? 0 : 2;
    cellElement.classList.toggle("marked");
  }

  function clearGrid() {
    const size = currentPuzzle.size;
    userGrid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));

    document.querySelectorAll(".grid-cell").forEach((cell) => {
      cell.classList.remove("filled", "marked");
    });

    messageEl.textContent = "";
  }

  function checkSolution() {
    const size = currentPuzzle.size;
    let correct = true;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const userValue = userGrid[row][col] === 1 ? 1 : 0;
        if (userValue !== currentPuzzle.solution[row][col]) {
          correct = false;
          break;
        }
      }
      if (!correct) break;
    }

    if (correct) {
      messageEl.textContent = "Correct! You solved the puzzle!";
      messageEl.className = "message success";
    } else {
      messageEl.textContent = "Not quite right. Keep trying!";
      messageEl.className = "message error";
    }
  }

  if (typeof window.initNonogram === "undefined") {
    window.initNonogram = initNonogram;
  }

  initNonogram();
})();
