const game = new Chess();
let selectedSquare = null;
let validMoves = [];
let gameMode = "2player";
let difficulty = "medium";
let isAiThinking = false;

const pieceSymbols = {
  p: "♟",
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  P: "♙",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
};

const pieceValues = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function init() {
  renderBoard();
  updateTurnIndicator();
  updateGameStatus();
  setupEventListeners();
}

function renderBoard() {
  const board = game.board();
  const chessboard = document.getElementById("chessboard");
  chessboard.innerHTML = "";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      const squareNotation = getSquareNotation(row, col);
      const piece = board[row][col];

      square.classList.add("square");
      square.classList.add((row + col) % 2 === 0 ? "light" : "dark");
      square.dataset.square = squareNotation;

      if (piece) {
        square.textContent = pieceSymbols[piece.type.toLowerCase()] || "";
        square.classList.add("has-piece");
        if (piece.color === "w") {
          square.style.color = "#fff";
          square.style.textShadow = "2px 2px 4px rgba(0,0,0,0.8)";
        } else {
          square.style.color = "#000";
          square.style.textShadow = "1px 1px 2px rgba(255,255,255,0.3)";
        }
      }

      if (selectedSquare === squareNotation) {
        square.classList.add("selected");
      }

      if (validMoves.includes(squareNotation)) {
        square.classList.add("valid-move");
      }

      square.addEventListener("click", () => handleSquareClick(squareNotation));
      chessboard.appendChild(square);
    }
  }
}

function getSquareNotation(row, col) {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  return files[col] + ranks[row];
}

function handleSquareClick(square) {
  if (isAiThinking) return;
  if (gameMode === "ai" && game.turn() === "b") return;

  const piece = game.get(square);
  const currentTurn = game.turn();

  if (selectedSquare) {
    if (validMoves.includes(square)) {
      makeMove(selectedSquare, square);
    } else if (piece && piece.color === currentTurn) {
      selectSquare(square);
    } else {
      deselectSquare();
    }
  } else {
    if (piece && piece.color === currentTurn) {
      selectSquare(square);
    }
  }
}

function selectSquare(square) {
  selectedSquare = square;
  validMoves = game
    .moves({ square: square, verbose: true })
    .map((move) => move.to);
  renderBoard();
}

function deselectSquare() {
  selectedSquare = null;
  validMoves = [];
  renderBoard();
}

function makeMove(from, to) {
  const move = game.move({ from: from, to: to, promotion: "q" });

  if (move) {
    selectedSquare = null;
    validMoves = [];
    renderBoard();
    updateTurnIndicator();
    updateGameStatus();
    addMoveToHistory(move);

    if (gameMode === "ai" && game.turn() === "b" && !game.game_over()) {
      setTimeout(makeAiMove, 500);
    }
  }
}

function updateTurnIndicator() {
  const turnElement = document.getElementById("current-turn");
  turnElement.textContent = game.turn() === "w" ? "White" : "Black";
  turnElement.style.color = game.turn() === "w" ? "#667eea" : "#764ba2";
}

function updateGameStatus() {
  const statusElement = document.getElementById("game-status");

  if (game.in_checkmate()) {
    const winner = game.turn() === "w" ? "Black" : "White";
    statusElement.textContent = `Checkmate! ${winner} wins!`;
    statusElement.style.color = "#f5576c";
    statusElement.style.fontWeight = "bold";
  } else if (game.in_draw()) {
    statusElement.textContent = "Game drawn";
    statusElement.style.color = "#ff9800";
  } else if (game.in_stalemate()) {
    statusElement.textContent = "Stalemate";
    statusElement.style.color = "#ff9800";
  } else if (game.in_check()) {
    statusElement.textContent = "Check!";
    statusElement.style.color = "#f5576c";
    statusElement.style.fontWeight = "bold";
  } else {
    statusElement.textContent = "Game in progress";
    statusElement.style.color = "#4caf50";
    statusElement.style.fontWeight = "normal";
  }
}

function addMoveToHistory(move) {
  const historyElement = document.getElementById("move-history");
  const moveNumber = Math.ceil(game.history().length / 2);
  const moveEntry = document.createElement("div");
  moveEntry.classList.add("move-entry");

  if (move.color === "w") {
    moveEntry.textContent = `${moveNumber}. ${move.san}`;
  } else {
    const lastEntry = historyElement.lastElementChild;
    if (lastEntry) {
      lastEntry.textContent += ` ${move.san}`;
      return;
    } else {
      moveEntry.textContent = `${moveNumber}. ... ${move.san}`;
    }
  }

  historyElement.appendChild(moveEntry);
  historyElement.scrollTop = historyElement.scrollHeight;
}

function resetGame() {
  game.reset();
  selectedSquare = null;
  validMoves = [];
  isAiThinking = false;
  document.getElementById("move-history").innerHTML = "";
  renderBoard();
  updateTurnIndicator();
  updateGameStatus();
}

function evaluateMove(move) {
  let score = 0;

  if (move.captured) {
    score += pieceValues[move.captured] * 10;
  }

  const testGame = new Chess(game.fen());
  testGame.move(move);

  if (testGame.in_checkmate()) {
    score += 1000;
  } else if (testGame.in_check()) {
    score += 50;
  }

  const centerSquares = ["d4", "d5", "e4", "e5"];
  if (centerSquares.includes(move.to)) {
    score += 5;
  }

  const developmentRanks = ["3", "4", "5", "6"];
  if (developmentRanks.includes(move.to[1])) {
    score += 2;
  }

  return score;
}

function makeAiMove() {
  if (game.game_over()) return;

  isAiThinking = true;
  const statusElement = document.getElementById("game-status");
  statusElement.textContent = "AI is thinking...";
  statusElement.style.color = "#764ba2";

  const moves = game.moves({ verbose: true });

  const movesWithScores = moves.map((move) => ({
    move: move,
    score: evaluateMove(move),
  }));

  movesWithScores.sort((a, b) => b.score - a.score);

  let selectedMove;
  if (difficulty === "easy") {
    const topMoves = movesWithScores.slice(0, Math.ceil(moves.length * 0.5));
    selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)].move;
  } else if (difficulty === "medium") {
    const randomFactor = Math.random();
    if (randomFactor < 0.7) {
      const topMoves = movesWithScores.slice(0, 5);
      selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)].move;
    } else {
      selectedMove = movesWithScores[0].move;
    }
  } else {
    const randomFactor = Math.random();
    if (randomFactor < 0.9) {
      selectedMove = movesWithScores[0].move;
    } else {
      const topMoves = movesWithScores.slice(0, 3);
      selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)].move;
    }
  }

  game.move(selectedMove);

  isAiThinking = false;
  renderBoard();
  updateTurnIndicator();
  updateGameStatus();
  addMoveToHistory(selectedMove);
}

function setupEventListeners() {
  document.getElementById("reset-btn").addEventListener("click", resetGame);

  document.getElementById("back-btn").addEventListener("click", () => {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  });

  document.querySelectorAll('input[name="game-mode"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      gameMode = e.target.value;
      const difficultyContainer = document.getElementById(
        "difficulty-container",
      );
      difficultyContainer.style.display = gameMode === "ai" ? "block" : "none";
      resetGame();
    });
  });

  document.getElementById("difficulty").addEventListener("change", (e) => {
    difficulty = e.target.value;
  });
}

init();
