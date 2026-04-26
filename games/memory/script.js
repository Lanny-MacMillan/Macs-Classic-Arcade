function initMemoryGame(container) {
  const difficultySettings = {
    easy: { pairs: 8, cols: 4, rows: 4 },
    medium: { pairs: 10, cols: 5, rows: 4 },
    hard: { pairs: 15, cols: 6, rows: 5 },
  };

  let currentDifficulty = "easy";
  let cards = [];
  let flippedCards = [];
  let moves = 0;
  let matchedPairs = 0;
  let isProcessing = false;

  const gameBoard = container
    ? container.querySelector("#game-board")
    : document.getElementById("game-board");
  const movesDisplay = container
    ? container.querySelector("#moves")
    : document.getElementById("moves");
  const pairsDisplay = container
    ? container.querySelector("#pairs")
    : document.getElementById("pairs");
  const winMessage = container
    ? container.querySelector("#win-message")
    : document.getElementById("win-message");
  const finalMovesDisplay = container
    ? container.querySelector("#final-moves")
    : document.getElementById("final-moves");
  const resetBtn = container
    ? container.querySelector("#reset-btn")
    : document.getElementById("reset-btn");
  const backBtn = container
    ? container.querySelector("#back-btn")
    : document.getElementById("back-btn");
  const difficultyBtns = container
    ? container.querySelectorAll(".difficulty-btn")
    : document.querySelectorAll(".difficulty-btn");

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function generateSymbols(count) {
    const symbols = [];
    for (let i = 1; i <= count; i++) {
      symbols.push({ id: i, display: i.toString() });
    }
    return symbols;
  }

  function createCards() {
    const settings = difficultySettings[currentDifficulty];
    const symbols = generateSymbols(settings.pairs);
    const cardPairs = [...symbols, ...symbols];
    const shuffled = shuffleArray(cardPairs);

    cards = shuffled.map((symbol, index) => ({
      id: index,
      symbolId: symbol.id,
      display: symbol.display,
      matched: false,
      flipped: false,
    }));
  }

  function renderCards() {
    gameBoard.innerHTML = "";
    gameBoard.className = `game-board ${currentDifficulty}`;

    cards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "card";
      cardElement.dataset.id = card.id;

      if (card.flipped) cardElement.classList.add("flipped");
      if (card.matched) cardElement.classList.add("matched");

      cardElement.innerHTML = `
                <div class="card-face card-back">?</div>
                <div class="card-face card-front">${card.display}</div>
            `;

      cardElement.addEventListener("click", () => handleCardClick(card.id));
      gameBoard.appendChild(cardElement);
    });
  }

  function handleCardClick(cardId) {
    if (isProcessing) return;

    const card = cards.find((c) => c.id === cardId);

    if (card.flipped || card.matched || flippedCards.length >= 2) return;

    card.flipped = true;
    flippedCards.push(card);
    renderCards();

    if (flippedCards.length === 2) {
      moves++;
      updateStats();
      checkMatch();
    }
  }

  function checkMatch() {
    isProcessing = true;
    const [card1, card2] = flippedCards;

    if (card1.symbolId === card2.symbolId) {
      card1.matched = true;
      card2.matched = true;
      matchedPairs++;
      flippedCards = [];
      isProcessing = false;

      updateStats();
      checkWin();
    } else {
      setTimeout(() => {
        card1.flipped = false;
        card2.flipped = false;
        flippedCards = [];
        isProcessing = false;
        renderCards();
      }, 1000);
    }
  }

  function updateStats() {
    const settings = difficultySettings[currentDifficulty];
    movesDisplay.textContent = moves;
    pairsDisplay.textContent = `${matchedPairs}/${settings.pairs}`;
  }

  function checkWin() {
    const settings = difficultySettings[currentDifficulty];
    if (matchedPairs === settings.pairs) {
      setTimeout(() => {
        finalMovesDisplay.textContent = moves;
        winMessage.classList.add("show");
      }, 500);
    }
  }

  function resetGame() {
    cards = [];
    flippedCards = [];
    moves = 0;
    matchedPairs = 0;
    isProcessing = false;

    winMessage.classList.remove("show");
    createCards();
    renderCards();
    updateStats();
  }

  function handleDifficultyChange(difficulty) {
    currentDifficulty = difficulty;

    difficultyBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.difficulty === difficulty);
    });

    resetGame();
  }

  difficultyBtns.forEach((btn) => {
    btn.addEventListener("click", () =>
      handleDifficultyChange(btn.dataset.difficulty),
    );
  });

  resetBtn.addEventListener("click", resetGame);

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "../../index.html";
    });
  }

  createCards();
  renderCards();
  updateStats();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { initMemoryGame };
} else {
  document.addEventListener("DOMContentLoaded", () => {
    initMemoryGame();
  });
}
