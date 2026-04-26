class CheckersGame {
  constructor() {
    this.board = [];
    this.currentPlayer = 1;
    this.selectedPiece = null;
    this.validMoves = [];
    this.moveHistory = [];
    this.gameOver = false;
    this.mustCapture = false;
    this.multiJumpInProgress = false;
    this.gameMode = null;
    this.aiThinking = false;
    this.gameStarted = false;

    this.attachEventListeners();
    this.showStartScreen();
  }

  showStartScreen() {
    document.getElementById("startScreen").classList.remove("hidden");
    document.getElementById("gameContainer").classList.add("hidden");
    this.gameStarted = false;
  }

  startGame(mode) {
    this.gameMode = mode;
    this.gameStarted = true;
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("gameContainer").classList.remove("hidden");

    this.initBoard();
    this.render();
  }

  initBoard() {
    this.board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          if (row < 3) {
            this.board[row][col] = { player: 2, king: false };
          } else if (row > 4) {
            this.board[row][col] = { player: 1, king: false };
          }
        }
      }
    }

    this.currentPlayer = 1;
    this.selectedPiece = null;
    this.validMoves = [];
    this.moveHistory = [];
    this.gameOver = false;
    this.mustCapture = false;
    this.multiJumpInProgress = false;

    const moveList = document.getElementById("moveList");
    if (moveList) {
      moveList.innerHTML = "";
    }
  }

  render() {
    const boardElement = document.getElementById("gameBoard");
    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = "square";
        square.dataset.row = row;
        square.dataset.col = col;

        if ((row + col) % 2 === 0) {
          square.classList.add("light");
        } else {
          square.classList.add("dark");
        }

        if (
          this.selectedPiece &&
          this.selectedPiece.row === row &&
          this.selectedPiece.col === col
        ) {
          square.classList.add("selected");
        }

        const isValidMove = this.validMoves.some(
          (move) => move.row === row && move.col === col,
        );
        if (isValidMove) {
          const move = this.validMoves.find(
            (m) => m.row === row && m.col === col,
          );
          if (move.isCapture) {
            square.classList.add("must-capture");
          } else {
            square.classList.add("valid-move");
          }
        }

        const piece = this.board[row][col];
        if (piece) {
          const pieceElement = document.createElement("div");
          pieceElement.className = `piece player${piece.player}`;
          if (piece.king) {
            pieceElement.classList.add("king");
          }
          square.appendChild(pieceElement);
        }

        boardElement.appendChild(square);
      }
    }

    this.updateStatus();
  }

  updateStatus() {
    const playerTurn = document.getElementById("playerTurn");
    const playerLabel =
      this.gameMode === "ai" && this.currentPlayer === 2
        ? "Computer"
        : `Player ${this.currentPlayer}`;
    playerTurn.textContent = playerLabel;
    playerTurn.className = `player-indicator ${this.currentPlayer === 2 ? "player2" : ""}`;

    const message = document.getElementById("gameMessage");
    if (this.gameOver) {
      const winner = this.currentPlayer;
      const winnerLabel =
        this.gameMode === "ai" && winner === 2
          ? "Computer"
          : `Player ${winner}`;
      message.textContent = `${winnerLabel} Wins!`;
      message.className = "message winner";
    } else if (this.mustCapture && this.selectedPiece) {
      message.textContent = "Capture required!";
      message.className = "message";
    } else {
      message.textContent = "";
      message.className = "message";
    }
  }

  attachEventListeners() {
    const modeBtns = document.querySelectorAll(".mode-btn");
    modeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        this.startGame(mode);
      });
    });

    const gameBoard = document.getElementById("gameBoard");
    if (gameBoard) {
      gameBoard.addEventListener("click", (e) => {
        if (this.gameOver || this.aiThinking || !this.gameStarted) return;

        const square = e.target.closest(".square");
        if (!square) return;

        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);

        this.handleSquareClick(row, col);
      });
    }

    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.showStartScreen();
      });
    }

    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.parent.postMessage({ action: "backToArcade" }, "*");
      });
    }
  }

  handleSquareClick(row, col) {
    const piece = this.board[row][col];

    if (this.multiJumpInProgress) {
      const isValidMove = this.validMoves.some(
        (move) => move.row === row && move.col === col,
      );
      if (isValidMove) {
        this.executeMove(row, col);
      }
      return;
    }

    if (piece && piece.player === this.currentPlayer) {
      this.selectPiece(row, col);
    } else if (this.selectedPiece) {
      const isValidMove = this.validMoves.some(
        (move) => move.row === row && move.col === col,
      );
      if (isValidMove) {
        this.executeMove(row, col);
      }
    }
  }

  selectPiece(row, col) {
    const piece = this.board[row][col];
    if (!piece || piece.player !== this.currentPlayer) return;

    const allCaptures = this.getAllCaptureMoves(this.currentPlayer);
    const hasMandatoryCapture = allCaptures.length > 0;

    if (hasMandatoryCapture) {
      const pieceCaptures = this.getCaptureMoves(row, col);
      if (pieceCaptures.length === 0) {
        this.selectedPiece = null;
        this.validMoves = [];
        this.render();
        return;
      }
    }

    this.selectedPiece = { row, col };
    this.validMoves = this.getValidMoves(row, col);
    this.mustCapture = hasMandatoryCapture;
    this.render();
  }

  getValidMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return [];

    const allCaptures = this.getAllCaptureMoves(this.currentPlayer);

    if (allCaptures.length > 0) {
      return this.getCaptureMoves(row, col);
    }

    return this.getNormalMoves(row, col);
  }

  getNormalMoves(row, col) {
    const piece = this.board[row][col];
    const moves = [];
    const directions = this.getDirections(piece);

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol, isCapture: false });
      }
    }

    return moves;
  }

  getCaptureMoves(row, col) {
    const piece = this.board[row][col];
    const captures = [];
    const directions = this.getDirections(piece);

    for (const [dr, dc] of directions) {
      const jumpRow = row + dr;
      const jumpCol = col + dc;
      const landRow = row + dr * 2;
      const landCol = col + dc * 2;

      if (this.isValidPosition(landRow, landCol)) {
        const jumpPiece = this.board[jumpRow][jumpCol];
        const landPiece = this.board[landRow][landCol];

        if (jumpPiece && jumpPiece.player !== piece.player && !landPiece) {
          captures.push({
            row: landRow,
            col: landCol,
            isCapture: true,
            capturedRow: jumpRow,
            capturedCol: jumpCol,
          });
        }
      }
    }

    return captures;
  }

  getAllCaptureMoves(player) {
    const allCaptures = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.player === player) {
          const captures = this.getCaptureMoves(row, col);
          if (captures.length > 0) {
            allCaptures.push(...captures);
          }
        }
      }
    }
    return allCaptures;
  }

  getDirections(piece) {
    if (piece.king) {
      return [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ];
    } else if (piece.player === 1) {
      return [
        [-1, -1],
        [-1, 1],
      ];
    } else {
      return [
        [1, -1],
        [1, 1],
      ];
    }
  }

  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  executeMove(targetRow, targetCol) {
    const move = this.validMoves.find(
      (m) => m.row === targetRow && m.col === targetCol,
    );
    if (!move) return;

    const fromRow = this.selectedPiece.row;
    const fromCol = this.selectedPiece.col;
    const piece = this.board[fromRow][fromCol];

    this.board[targetRow][targetCol] = piece;
    this.board[fromRow][fromCol] = null;

    const playerLabel =
      this.gameMode === "ai" && this.currentPlayer === 2
        ? "Computer"
        : `P${this.currentPlayer}`;
    let moveNotation = `${playerLabel}: (${fromRow},${fromCol}) → (${targetRow},${targetCol})`;

    if (move.isCapture) {
      this.board[move.capturedRow][move.capturedCol] = null;
      moveNotation += " [CAPTURE]";
    }

    if (
      (piece.player === 1 && targetRow === 0) ||
      (piece.player === 2 && targetRow === 7)
    ) {
      piece.king = true;
      moveNotation += " [KING]";
    }

    this.addMoveToHistory(moveNotation);

    if (move.isCapture) {
      const additionalCaptures = this.getCaptureMoves(targetRow, targetCol);
      if (additionalCaptures.length > 0) {
        this.selectedPiece = { row: targetRow, col: targetCol };
        this.validMoves = additionalCaptures;
        this.multiJumpInProgress = true;
        this.render();

        if (this.gameMode === "ai" && this.currentPlayer === 2) {
          setTimeout(() => this.makeAIMove(), 500);
        }
        return;
      }
    }

    this.selectedPiece = null;
    this.validMoves = [];
    this.multiJumpInProgress = false;
    this.mustCapture = false;

    if (this.checkWinCondition()) {
      this.gameOver = true;
      this.render();
      return;
    }

    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.render();

    if (this.gameMode === "ai" && this.currentPlayer === 2 && !this.gameOver) {
      setTimeout(() => this.makeAIMove(), 500);
    }
  }

  checkWinCondition() {
    const opponent = this.currentPlayer === 1 ? 2 : 1;
    let hasOpponentPieces = false;
    let hasOpponentMoves = false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.player === opponent) {
          hasOpponentPieces = true;
          const captures = this.getCaptureMoves(row, col);
          const normalMoves = this.getNormalMoves(row, col);
          if (captures.length > 0 || normalMoves.length > 0) {
            hasOpponentMoves = true;
            break;
          }
        }
      }
      if (hasOpponentMoves) break;
    }

    return !hasOpponentPieces || !hasOpponentMoves;
  }

  addMoveToHistory(moveText) {
    this.moveHistory.push(moveText);
    const moveList = document.getElementById("moveList");
    const moveItem = document.createElement("div");
    moveItem.className = "move-item";
    moveItem.textContent = `${this.moveHistory.length}. ${moveText}`;
    moveList.appendChild(moveItem);
    moveList.scrollTop = moveList.scrollHeight;
  }

  makeAIMove() {
    if (this.gameOver || this.currentPlayer !== 2) return;

    this.aiThinking = true;

    let bestMove;

    if (this.multiJumpInProgress && this.selectedPiece) {
      const continueMoves = this.validMoves.map((move) => ({
        fromRow: this.selectedPiece.row,
        fromCol: this.selectedPiece.col,
        toRow: move.row,
        toCol: move.col,
        isCapture: move.isCapture,
        capturedRow: move.capturedRow,
        capturedCol: move.capturedCol,
      }));

      if (continueMoves.length > 0) {
        bestMove = this.selectBestMove(continueMoves);
      } else {
        this.aiThinking = false;
        return;
      }
    } else {
      const allMoves = this.getAllPossibleMoves(2);

      if (allMoves.length === 0) {
        this.aiThinking = false;
        return;
      }

      bestMove = this.selectBestMove(allMoves);
      this.selectedPiece = { row: bestMove.fromRow, col: bestMove.fromCol };
      this.validMoves = this.getValidMoves(bestMove.fromRow, bestMove.fromCol);
    }

    this.executeMove(bestMove.toRow, bestMove.toCol);

    if (!this.multiJumpInProgress) {
      this.aiThinking = false;
    }
  }

  getAllPossibleMoves(player) {
    const moves = [];
    const allCaptures = this.getAllCaptureMoves(player);

    if (allCaptures.length > 0) {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = this.board[row][col];
          if (piece && piece.player === player) {
            const captureMoves = this.getCaptureMoves(row, col);
            captureMoves.forEach((move) => {
              moves.push({
                fromRow: row,
                fromCol: col,
                toRow: move.row,
                toCol: move.col,
                isCapture: true,
                capturedRow: move.capturedRow,
                capturedCol: move.capturedCol,
              });
            });
          }
        }
      }
    } else {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = this.board[row][col];
          if (piece && piece.player === player) {
            const normalMoves = this.getNormalMoves(row, col);
            normalMoves.forEach((move) => {
              moves.push({
                fromRow: row,
                fromCol: col,
                toRow: move.row,
                toCol: move.col,
                isCapture: false,
              });
            });
          }
        }
      }
    }

    return moves;
  }

  selectBestMove(moves) {
    const captureMoves = moves.filter((m) => m.isCapture);
    if (captureMoves.length > 0) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }

    const scoredMoves = moves.map((move) => ({
      move,
      score: this.evaluateMove(move),
    }));

    scoredMoves.sort((a, b) => b.score - a.score);

    const topMoves = scoredMoves.filter(
      (m) => m.score === scoredMoves[0].score,
    );
    const selected = topMoves[Math.floor(Math.random() * topMoves.length)];

    return selected.move;
  }

  evaluateMove(move) {
    let score = 0;
    const piece = this.board[move.fromRow][move.fromCol];

    if (move.toRow === 7) {
      score += 10;
    }

    if (piece.king) {
      score += 2;
    }

    score += move.toRow;

    const centerDistance = Math.abs(3.5 - move.toCol);
    score -= centerDistance * 0.5;

    return score;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new CheckersGame();
});
