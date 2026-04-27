(function () {
  const board = document.getElementById("game-board");
  const blackScoreEl = document.getElementById("black-score");
  const whiteScoreEl = document.getElementById("white-score");
  const turnDisplayEl = document.getElementById("turn-display");
  const gameOverScreen = document.getElementById("game-over-screen");
  const gameOverMessage = document.getElementById("game-over-message");
  const playAgainBtn = document.getElementById("play-again-btn");
  const resetBtn = document.getElementById("reset-btn");
  const backBtn = document.getElementById("back-btn");
  const modeSelection = document.getElementById("mode-selection");
  const difficultySelection = document.getElementById("difficulty-selection");
  const gameArea = document.getElementById("game-area");

  const BOARD_SIZE = 8;
  const BLACK = 1;
  const WHITE = 2;
  const EMPTY = 0;

  const DIRECTIONS = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  let gameState = [];
  let currentPlayer = BLACK;
  let gameActive = true;
  let gameMode = null;
  let difficulty = null;
  let isAIThinking = false;

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const mode = e.target.dataset.mode;
      gameMode = mode;

      document
        .querySelectorAll(".mode-btn")
        .forEach((b) => b.classList.remove("selected"));
      e.target.classList.add("selected");

      if (mode === "computer") {
        difficultySelection.classList.remove("hidden");
      } else {
        difficultySelection.classList.add("hidden");
        startGame();
      }
    });
  });

  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      difficulty = e.target.dataset.difficulty;
      document
        .querySelectorAll(".difficulty-btn")
        .forEach((b) => b.classList.remove("selected"));
      e.target.classList.add("selected");
      startGame();
    });
  });

  function startGame() {
    modeSelection.classList.add("hidden");
    gameArea.classList.remove("hidden");
    initGame();
  }

  function initGame() {
    gameState = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(EMPTY));

    const mid = BOARD_SIZE / 2;
    gameState[mid - 1][mid - 1] = WHITE;
    gameState[mid - 1][mid] = BLACK;
    gameState[mid][mid - 1] = BLACK;
    gameState[mid][mid] = WHITE;

    currentPlayer = BLACK;
    gameActive = true;
    isAIThinking = false;

    renderBoard();
    updateScores();
    updateTurnDisplay();
  }

  function renderBoard() {
    board.innerHTML = "";

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = row;
        cell.dataset.col = col;

        const piece = gameState[row][col];
        if (piece !== EMPTY) {
          const pieceEl = document.createElement("div");
          pieceEl.className = `piece ${piece === BLACK ? "black" : "white"}`;
          cell.appendChild(pieceEl);
        }

        if (gameActive && isValidMove(row, col, currentPlayer)) {
          cell.classList.add("valid-move");
        }

        cell.addEventListener("click", () => handleCellClick(row, col));
        board.appendChild(cell);
      }
    }
  }

  function handleCellClick(row, col) {
    if (!gameActive || gameState[row][col] !== EMPTY) return;
    if (isAIThinking) return;
    if (gameMode === "computer" && currentPlayer === WHITE) return;
    if (!isValidMove(row, col, currentPlayer)) return;

    makeMove(row, col);
  }

  function makeMove(row, col) {
    const flippedPieces = getFlippedPieces(row, col, currentPlayer);
    if (flippedPieces.length === 0) return;

    gameState[row][col] = currentPlayer;

    flippedPieces.forEach(([r, c]) => {
      gameState[r][c] = currentPlayer;
    });

    updateScores();
    switchPlayer();
    renderBoard();

    if (!hasValidMoves(currentPlayer)) {
      switchPlayer();
      if (!hasValidMoves(currentPlayer)) {
        endGame();
        return;
      } else {
        renderBoard();
      }
    }

    if (gameMode === "computer" && currentPlayer === WHITE && gameActive) {
      setTimeout(makeAIMove, 500);
    }
  }

  function makeAIMove() {
    if (!gameActive) return;

    isAIThinking = true;
    const move = getAIMove();
    isAIThinking = false;

    if (move) {
      makeMove(move.row, move.col);
    }
  }

  function getAIMove() {
    const validMoves = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (isValidMove(row, col, WHITE)) {
          validMoves.push({ row, col });
        }
      }
    }

    if (validMoves.length === 0) return null;

    if (difficulty === "easy") {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    if (difficulty === "medium") {
      let bestMove = validMoves[0];
      let maxFlips = 0;

      for (const move of validMoves) {
        const flips = getFlippedPieces(move.row, move.col, WHITE).length;
        if (flips > maxFlips) {
          maxFlips = flips;
          bestMove = move;
        }
      }

      return bestMove;
    }

    if (difficulty === "hard") {
      const corners = [
        [0, 0],
        [0, 7],
        [7, 0],
        [7, 7],
      ];
      const dangerZones = [
        [0, 1],
        [1, 0],
        [1, 1],
        [0, 6],
        [1, 6],
        [1, 7],
        [6, 0],
        [6, 1],
        [7, 1],
        [6, 6],
        [6, 7],
        [7, 6],
      ];

      for (const [r, c] of corners) {
        if (validMoves.some((m) => m.row === r && m.col === c)) {
          return { row: r, col: c };
        }
      }

      const safeEdges = validMoves.filter((move) => {
        const { row, col } = move;
        const isEdge = row === 0 || row === 7 || col === 0 || col === 7;
        const isDanger = dangerZones.some((d) => d[0] === row && d[1] === col);
        return isEdge && !isDanger;
      });

      if (safeEdges.length > 0) {
        let bestMove = safeEdges[0];
        let maxFlips = 0;

        for (const move of safeEdges) {
          const flips = getFlippedPieces(move.row, move.col, WHITE).length;
          if (flips > maxFlips) {
            maxFlips = flips;
            bestMove = move;
          }
        }

        return bestMove;
      }

      const safeMoves = validMoves.filter((move) => {
        return !dangerZones.some((d) => d[0] === move.row && d[1] === move.col);
      });

      const movesToConsider = safeMoves.length > 0 ? safeMoves : validMoves;

      let bestMove = movesToConsider[0];
      let maxFlips = 0;

      for (const move of movesToConsider) {
        const flips = getFlippedPieces(move.row, move.col, WHITE).length;
        if (flips > maxFlips) {
          maxFlips = flips;
          bestMove = move;
        }
      }

      return bestMove;
    }

    return validMoves[0];
  }

  function isValidMove(row, col, player) {
    if (gameState[row][col] !== EMPTY) return false;
    return getFlippedPieces(row, col, player).length > 0;
  }

  function getFlippedPieces(row, col, player) {
    const flipped = [];
    const opponent = player === BLACK ? WHITE : BLACK;

    for (const [dr, dc] of DIRECTIONS) {
      const temp = [];
      let r = row + dr;
      let c = col + dc;

      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (gameState[r][c] === EMPTY) break;
        if (gameState[r][c] === opponent) {
          temp.push([r, c]);
        } else if (gameState[r][c] === player) {
          flipped.push(...temp);
          break;
        }
        r += dr;
        c += dc;
      }
    }

    return flipped;
  }

  function hasValidMoves(player) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (isValidMove(row, col, player)) {
          return true;
        }
      }
    }
    return false;
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    updateTurnDisplay();
  }

  function updateTurnDisplay() {
    if (gameMode === "computer") {
      turnDisplayEl.textContent =
        currentPlayer === BLACK ? "Your Turn" : "Computer's Turn";
    } else {
      turnDisplayEl.textContent =
        currentPlayer === BLACK ? "Black's Turn" : "White's Turn";
    }
    turnDisplayEl.style.background =
      currentPlayer === BLACK
        ? "rgba(0, 0, 0, 0.5)"
        : "rgba(255, 255, 255, 0.2)";
  }

  function updateScores() {
    let blackCount = 0;
    let whiteCount = 0;

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (gameState[row][col] === BLACK) blackCount++;
        if (gameState[row][col] === WHITE) whiteCount++;
      }
    }

    blackScoreEl.textContent = blackCount;
    whiteScoreEl.textContent = whiteCount;
  }

  function endGame() {
    gameActive = false;
    const blackScore = parseInt(blackScoreEl.textContent);
    const whiteScore = parseInt(whiteScoreEl.textContent);

    let message = "";
    if (gameMode === "computer") {
      if (blackScore > whiteScore) {
        message = `You win ${blackScore} to ${whiteScore}!`;
      } else if (whiteScore > blackScore) {
        message = `Computer wins ${whiteScore} to ${blackScore}!`;
      } else {
        message = `It's a tie! ${blackScore} to ${whiteScore}`;
      }
    } else {
      if (blackScore > whiteScore) {
        message = `Black wins ${blackScore} to ${whiteScore}!`;
      } else if (whiteScore > blackScore) {
        message = `White wins ${whiteScore} to ${blackScore}!`;
      } else {
        message = `It's a tie! ${blackScore} to ${whiteScore}`;
      }
    }

    gameOverMessage.textContent = message;
    gameOverScreen.classList.remove("hidden");
  }

  function resetGame() {
    gameOverScreen.classList.add("hidden");
    gameArea.classList.add("hidden");
    modeSelection.classList.remove("hidden");
    difficultySelection.classList.add("hidden");

    document
      .querySelectorAll(".mode-btn, .difficulty-btn")
      .forEach((b) => b.classList.remove("selected"));

    gameMode = null;
    difficulty = null;
  }

  playAgainBtn.addEventListener("click", resetGame);
  resetBtn.addEventListener("click", resetGame);
  backBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
  });

  window.initOthello = function (container) {
    if (container) {
      container.innerHTML = "";
      const wrapper = document.querySelector(".game-wrapper");
      if (wrapper) {
        container.appendChild(wrapper);
      }
    }
  };
})();
