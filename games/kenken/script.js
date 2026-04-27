(function () {
  const kenkenGrid = document.getElementById("kenken-grid");
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
      size: 4,
      solution: [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 3, 4, 1],
        [4, 1, 2, 3],
      ],
      cages: [
        {
          cells: [
            [0, 0],
            [0, 1],
          ],
          target: 3,
          op: "-",
        },
        {
          cells: [
            [0, 2],
            [0, 3],
          ],
          target: 7,
          op: "+",
        },
        { cells: [[1, 0]], target: 3, op: null },
        {
          cells: [
            [1, 1],
            [2, 1],
          ],
          target: 7,
          op: "+",
        },
        {
          cells: [
            [1, 2],
            [1, 3],
          ],
          target: 3,
          op: "-",
        },
        { cells: [[2, 0]], target: 2, op: null },
        {
          cells: [
            [2, 2],
            [2, 3],
          ],
          target: 5,
          op: "+",
        },
        {
          cells: [
            [3, 0],
            [3, 1],
          ],
          target: 5,
          op: "+",
        },
        {
          cells: [
            [3, 2],
            [3, 3],
          ],
          target: 5,
          op: "+",
        },
      ],
    },
    {
      size: 4,
      solution: [
        [2, 1, 4, 3],
        [4, 3, 2, 1],
        [1, 4, 3, 2],
        [3, 2, 1, 4],
      ],
      cages: [
        {
          cells: [
            [0, 0],
            [1, 0],
          ],
          target: 2,
          op: "÷",
        },
        {
          cells: [
            [0, 1],
            [0, 2],
          ],
          target: 5,
          op: "+",
        },
        {
          cells: [
            [0, 3],
            [1, 3],
          ],
          target: 4,
          op: "-",
        },
        {
          cells: [
            [1, 1],
            [1, 2],
          ],
          target: 6,
          op: "+",
        },
        {
          cells: [
            [2, 0],
            [2, 1],
          ],
          target: 5,
          op: "+",
        },
        {
          cells: [
            [2, 2],
            [3, 2],
          ],
          target: 4,
          op: "-",
        },
        { cells: [[2, 3]], target: 2, op: null },
        {
          cells: [
            [3, 0],
            [3, 1],
          ],
          target: 5,
          op: "+",
        },
        { cells: [[3, 3]], target: 4, op: null },
      ],
    },
    {
      size: 5,
      solution: [
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 1],
        [3, 4, 5, 1, 2],
        [4, 5, 1, 2, 3],
        [5, 1, 2, 3, 4],
      ],
      cages: [
        {
          cells: [
            [0, 0],
            [1, 0],
          ],
          target: 3,
          op: "+",
        },
        {
          cells: [
            [0, 1],
            [0, 2],
          ],
          target: 5,
          op: "+",
        },
        {
          cells: [
            [0, 3],
            [0, 4],
          ],
          target: 9,
          op: "+",
        },
        {
          cells: [
            [1, 1],
            [1, 2],
          ],
          target: 7,
          op: "+",
        },
        {
          cells: [
            [1, 3],
            [2, 3],
          ],
          target: 6,
          op: "+",
        },
        { cells: [[1, 4]], target: 1, op: null },
        {
          cells: [
            [2, 0],
            [3, 0],
          ],
          target: 7,
          op: "+",
        },
        {
          cells: [
            [2, 1],
            [2, 2],
          ],
          target: 9,
          op: "+",
        },
        {
          cells: [
            [2, 4],
            [3, 4],
          ],
          target: 5,
          op: "+",
        },
        {
          cells: [
            [3, 1],
            [3, 2],
            [4, 1],
          ],
          target: 8,
          op: "+",
        },
        { cells: [[3, 3]], target: 2, op: null },
        { cells: [[4, 0]], target: 5, op: null },
        {
          cells: [
            [4, 2],
            [4, 3],
          ],
          target: 5,
          op: "+",
        },
        { cells: [[4, 4]], target: 4, op: null },
      ],
    },
  ];

  let currentPuzzle = null;
  let userGrid = [];
  let selectedCell = null;

  function initKenKen(container) {
    if (container) {
      return;
    }
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
      window.location.href = "../../index.html";
    });

    document.addEventListener("keydown", handleKeyPress);
  }

  function loadRandomPuzzle() {
    const randomIndex = Math.floor(Math.random() * puzzles.length);
    currentPuzzle = puzzles[randomIndex];
    initGrid();
    messageEl.textContent = "";
    messageEl.className = "message";
  }

  function initGrid() {
    const size = currentPuzzle.size;
    userGrid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));

    renderGrid();
  }

  function renderGrid() {
    kenkenGrid.innerHTML = "";
    const size = currentPuzzle.size;
    const cellSize = Math.min(80, Math.floor(400 / size));

    kenkenGrid.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
    kenkenGrid.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;

    const cageMap = {};
    currentPuzzle.cages.forEach((cage, idx) => {
      cage.cells.forEach(([r, c]) => {
        cageMap[`${r},${c}`] = { idx, cage };
      });
    });

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = row;
        cell.dataset.col = col;

        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.addEventListener("input", (e) => {
          const val = e.target.value;
          if (
            val &&
            (isNaN(val) || parseInt(val) < 1 || parseInt(val) > size)
          ) {
            e.target.value = "";
          } else {
            userGrid[row][col] = val ? parseInt(val) : 0;
          }
        });

        input.addEventListener("focus", (e) => {
          selectCell(row, col);
        });

        input.addEventListener("click", (e) => {
          e.stopPropagation();
        });

        const cageInfo = cageMap[`${row},${col}`];
        if (
          cageInfo &&
          cageInfo.cage.cells[0][0] === row &&
          cageInfo.cage.cells[0][1] === col
        ) {
          const label = document.createElement("div");
          label.className = "cell-label";
          label.textContent = cageInfo.cage.op
            ? `${cageInfo.cage.target}${cageInfo.cage.op}`
            : `${cageInfo.cage.target}`;
          cell.appendChild(label);
        }

        applyCageBorders(cell, row, col, cageMap);

        cell.appendChild(input);
        kenkenGrid.appendChild(cell);
      }
    }
  }

  function applyCageBorders(cell, row, col, cageMap) {
    const currentCage = cageMap[`${row},${col}`]?.idx;
    const topCage = cageMap[`${row - 1},${col}`]?.idx;
    const rightCage = cageMap[`${row},${col + 1}`]?.idx;
    const bottomCage = cageMap[`${row + 1},${col}`]?.idx;
    const leftCage = cageMap[`${row},${col - 1}`]?.idx;

    if (currentCage === topCage) cell.style.borderTop = "1px solid #ccc";
    if (currentCage === rightCage) cell.style.borderRight = "1px solid #ccc";
    if (currentCage === bottomCage) cell.style.borderBottom = "1px solid #ccc";
    if (currentCage === leftCage) cell.style.borderLeft = "1px solid #ccc";
  }

  function selectCell(row, col) {
    document
      .querySelectorAll(".cell")
      .forEach((c) => c.classList.remove("selected"));
    const cell = kenkenGrid.querySelector(
      `[data-row="${row}"][data-col="${col}"]`,
    );
    if (cell) {
      cell.classList.add("selected");
      selectedCell = { row, col };
      const input = cell.querySelector("input");
      if (input) {
        input.focus();
      }
    }
  }

  function handleKeyPress(e) {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const size = currentPuzzle.size;

    if (e.key === "ArrowUp" && row > 0) {
      e.preventDefault();
      selectCell(row - 1, col);
    } else if (e.key === "ArrowDown" && row < size - 1) {
      e.preventDefault();
      selectCell(row + 1, col);
    } else if (e.key === "ArrowLeft" && col > 0) {
      e.preventDefault();
      selectCell(row, col - 1);
    } else if (e.key === "ArrowRight" && col < size - 1) {
      e.preventDefault();
      selectCell(row, col + 1);
    }
  }

  function checkSolution() {
    const size = currentPuzzle.size;
    let isValid = true;

    document.querySelectorAll(".cell").forEach((c) => {
      c.classList.remove("correct", "incorrect");
    });

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (userGrid[i][j] === 0) {
          isValid = false;
          const cell = kenkenGrid.querySelector(
            `[data-row="${i}"][data-col="${j}"]`,
          );
          cell.classList.add("incorrect");
        }
      }
    }

    if (!isValid) {
      messageEl.textContent = "Please fill all cells!";
      messageEl.className = "message error";
      return;
    }

    for (let i = 0; i < size; i++) {
      const rowSet = new Set(userGrid[i]);
      if (rowSet.size !== size) {
        isValid = false;
        for (let j = 0; j < size; j++) {
          const cell = kenkenGrid.querySelector(
            `[data-row="${i}"][data-col="${j}"]`,
          );
          cell.classList.add("incorrect");
        }
      }

      const colVals = [];
      for (let j = 0; j < size; j++) {
        colVals.push(userGrid[j][i]);
      }
      const colSet = new Set(colVals);
      if (colSet.size !== size) {
        isValid = false;
        for (let j = 0; j < size; j++) {
          const cell = kenkenGrid.querySelector(
            `[data-row="${j}"][data-col="${i}"]`,
          );
          cell.classList.add("incorrect");
        }
      }
    }

    currentPuzzle.cages.forEach((cage) => {
      if (!validateCage(cage)) {
        isValid = false;
        cage.cells.forEach(([r, c]) => {
          const cell = kenkenGrid.querySelector(
            `[data-row="${r}"][data-col="${c}"]`,
          );
          cell.classList.add("incorrect");
        });
      }
    });

    if (isValid) {
      messageEl.textContent = "Perfect! You solved it!";
      messageEl.className = "message success";
      document.querySelectorAll(".cell").forEach((c) => {
        c.classList.remove("incorrect");
        c.classList.add("correct");
      });
    } else {
      messageEl.textContent = "Not quite right. Keep trying!";
      messageEl.className = "message error";
    }
  }

  function validateCage(cage) {
    const values = cage.cells.map(([r, c]) => userGrid[r][c]);

    if (values.some((v) => v === 0)) return false;

    if (!cage.op) {
      return values[0] === cage.target;
    }

    if (cage.op === "+") {
      return values.reduce((a, b) => a + b, 0) === cage.target;
    }

    if (cage.op === "×" || cage.op === "*") {
      return values.reduce((a, b) => a * b, 1) === cage.target;
    }

    if (cage.op === "-") {
      const [a, b] = values;
      return Math.abs(a - b) === cage.target;
    }

    if (cage.op === "÷" || cage.op === "/") {
      const [a, b] = values;
      return Math.max(a, b) / Math.min(a, b) === cage.target;
    }

    return false;
  }

  function clearGrid() {
    const size = currentPuzzle.size;
    userGrid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));

    document.querySelectorAll(".cell input").forEach((input) => {
      input.value = "";
    });

    document.querySelectorAll(".cell").forEach((c) => {
      c.classList.remove("correct", "incorrect", "selected");
    });

    selectedCell = null;
    messageEl.textContent = "";
    messageEl.className = "message";
  }

  if (typeof window.initKenKen === "undefined") {
    window.initKenKen = initKenKen;
    initKenKen();
  }
})();
