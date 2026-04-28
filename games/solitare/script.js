const SUITS = ["hearts", "diamonds", "clubs", "spades"];
const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const SUIT_SYMBOLS = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

let gameState = {
  stock: [],
  waste: [],
  foundations: [[], [], [], []],
  tableau: [[], [], [], [], [], [], []],
  draggedCards: null,
  dragSource: null,
  difficulty: "normal",
  drawCount: 3,
};

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    const color = suit === "hearts" || suit === "diamonds" ? "red" : "black";
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        color,
        faceUp: false,
      });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function dealCards() {
  const deck = shuffleDeck(createDeck());

  gameState.stock = [];
  gameState.waste = [];
  gameState.foundations = [[], [], [], []];
  gameState.tableau = [[], [], [], [], [], [], []];

  let cardIndex = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[cardIndex++];
      card.faceUp = row === col;
      gameState.tableau[col].push(card);
    }
  }

  while (cardIndex < deck.length) {
    gameState.stock.push(deck[cardIndex++]);
  }
}

function renderGame() {
  renderStock();
  renderWaste();
  renderFoundations();
  renderTableau();
}

function renderStock() {
  const stockElement = document.getElementById("stock");
  stockElement.innerHTML = "";

  if (gameState.stock.length > 0) {
    const cardElement = createCardElement(null, true);
    stockElement.appendChild(cardElement);
  }
}

function renderWaste() {
  const wasteElement = document.getElementById("waste");
  wasteElement.innerHTML = "";

  if (gameState.waste.length > 0) {
    const visibleCards =
      gameState.difficulty === "easy"
        ? [gameState.waste[gameState.waste.length - 1]]
        : gameState.waste.slice(-3);

    visibleCards.forEach((card, index) => {
      const cardElement = createCardElement(card);
      cardElement.style.position = "absolute";
      cardElement.style.left = `${index * 30}px`;
      cardElement.style.zIndex = index;

      if (index === visibleCards.length - 1) {
        cardElement.addEventListener("click", () => handleWasteClick());
        cardElement.draggable = true;
        cardElement.addEventListener("dragstart", (e) =>
          handleDragStart(e, [card], "waste"),
        );
      }

      wasteElement.appendChild(cardElement);
    });
  }
}

function renderFoundations() {
  gameState.foundations.forEach((foundation, index) => {
    const foundationElement = document.getElementById(`foundation-${index}`);
    foundationElement.innerHTML = "";

    if (foundation.length > 0) {
      const topCard = foundation[foundation.length - 1];
      const cardElement = createCardElement(topCard);
      foundationElement.appendChild(cardElement);
    }

    foundationElement.addEventListener("dragover", handleDragOver);
    foundationElement.addEventListener("drop", (e) =>
      handleDrop(e, "foundation", index),
    );
  });
}

function calculateCardOffset(column, cardIndex) {
  let offset = 0;
  for (let i = 0; i < cardIndex; i++) {
    offset += column[i].faceUp ? 30 : 20;
  }
  return offset;
}

function renderTableau() {
  gameState.tableau.forEach((column, colIndex) => {
    const columnElement = document.getElementById(`tableau-${colIndex}`);
    columnElement.innerHTML = "";

    column.forEach((card, cardIndex) => {
      const cardElement = createCardElement(card);
      const offset = card.faceUp ? 30 : 20;
      cardElement.style.top = `${cardIndex === 0 ? 0 : calculateCardOffset(column, cardIndex)}px`;

      if (card.faceUp) {
        const cardsFromHere = column.slice(cardIndex);

        cardElement.addEventListener("click", () =>
          handleTableauCardClick(colIndex, cardIndex),
        );
        cardElement.draggable = true;
        cardElement.addEventListener("dragstart", (e) =>
          handleDragStart(e, cardsFromHere, {
            type: "tableau",
            column: colIndex,
            startIndex: cardIndex,
          }),
        );
      }

      columnElement.appendChild(cardElement);
    });

    columnElement.addEventListener("dragover", handleDragOver);
    columnElement.addEventListener("drop", (e) =>
      handleDrop(e, "tableau", colIndex),
    );
  });
}

function createCardElement(card, isFaceDown = false) {
  const cardElement = document.createElement("div");
  cardElement.className = "card";

  if (!card || isFaceDown || !card.faceUp) {
    cardElement.classList.add("face-down");
    return cardElement;
  }

  cardElement.classList.add(card.color);

  const content = document.createElement("div");
  content.className = "card-content";

  const rankTop = document.createElement("div");
  rankTop.className = "card-rank";
  rankTop.textContent = card.rank;

  const suitTop = document.createElement("div");
  suitTop.className = "card-suit";
  suitTop.textContent = SUIT_SYMBOLS[card.suit];

  const center = document.createElement("div");
  center.className = "card-center";
  center.textContent = SUIT_SYMBOLS[card.suit];

  content.appendChild(rankTop);
  content.appendChild(suitTop);
  content.appendChild(center);
  cardElement.appendChild(content);

  return cardElement;
}

function handleStockClick() {
  if (gameState.stock.length > 0) {
    const cardsToDraw = Math.min(gameState.drawCount, gameState.stock.length);
    for (let i = 0; i < cardsToDraw; i++) {
      const card = gameState.stock.pop();
      card.faceUp = true;
      gameState.waste.push(card);
    }
  } else if (gameState.waste.length > 0) {
    while (gameState.waste.length > 0) {
      const card = gameState.waste.pop();
      card.faceUp = false;
      gameState.stock.push(card);
    }
  }
  renderGame();
}

function handleWasteClick() {
  if (gameState.waste.length === 0) return;

  const card = gameState.waste[gameState.waste.length - 1];

  for (let i = 0; i < 4; i++) {
    if (canPlaceOnFoundation(card, i)) {
      gameState.waste.pop();
      gameState.foundations[i].push(card);
      renderGame();
      checkWinCondition();
      return;
    }
  }

  for (let col = 0; col < 7; col++) {
    if (canPlaceOnTableau([card], col)) {
      gameState.waste.pop();
      gameState.tableau[col].push(card);
      renderGame();
      return;
    }
  }
}

function handleTableauCardClick(colIndex, cardIndex) {
  const column = gameState.tableau[colIndex];
  const card = column[cardIndex];

  if (cardIndex !== column.length - 1) return;

  for (let i = 0; i < 4; i++) {
    if (canPlaceOnFoundation(card, i)) {
      column.pop();
      gameState.foundations[i].push(card);
      flipTopCard(colIndex);
      renderGame();
      checkWinCondition();
      return;
    }
  }
}

function handleDragStart(e, cards, source) {
  gameState.draggedCards = cards;
  gameState.dragSource = source;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", e.target.innerHTML);
  setTimeout(() => e.target.classList.add("dragging"), 0);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDrop(e, targetType, targetIndex) {
  e.preventDefault();
  e.stopPropagation();

  const cards = gameState.draggedCards;
  const source = gameState.dragSource;

  if (!cards || !source) return;

  let validMove = false;

  if (targetType === "foundation" && cards.length === 1) {
    validMove = canPlaceOnFoundation(cards[0], targetIndex);
    if (validMove) {
      removeCardsFromSource(source, cards.length);
      gameState.foundations[targetIndex].push(cards[0]);
    }
  } else if (targetType === "tableau") {
    validMove = canPlaceOnTableau(cards, targetIndex);
    if (validMove) {
      removeCardsFromSource(source, cards.length);
      gameState.tableau[targetIndex].push(...cards);
    }
  }

  if (validMove && source.type === "tableau") {
    flipTopCard(source.column);
  }

  gameState.draggedCards = null;
  gameState.dragSource = null;

  document.querySelectorAll(".card").forEach((card) => {
    card.classList.remove("dragging");
  });

  renderGame();

  if (validMove) {
    checkWinCondition();
  }
}

function removeCardsFromSource(source, count) {
  if (source === "waste") {
    gameState.waste.pop();
  } else if (source.type === "tableau") {
    gameState.tableau[source.column].splice(source.startIndex, count);
  }
}

function canPlaceOnFoundation(card, foundationIndex) {
  const foundation = gameState.foundations[foundationIndex];
  const foundationSuit = SUITS[foundationIndex];

  if (card.suit !== foundationSuit) return false;

  if (foundation.length === 0) {
    return card.rank === "A";
  }

  const topCard = foundation[foundation.length - 1];
  const cardRankIndex = RANKS.indexOf(card.rank);
  const topRankIndex = RANKS.indexOf(topCard.rank);

  return cardRankIndex === topRankIndex + 1;
}

function canPlaceOnTableau(cards, columnIndex) {
  const column = gameState.tableau[columnIndex];
  const firstCard = cards[0];

  if (column.length === 0) {
    return firstCard.rank === "K";
  }

  const topCard = column[column.length - 1];

  if (!topCard.faceUp) return false;

  if (firstCard.color === topCard.color) return false;

  const firstCardRankIndex = RANKS.indexOf(firstCard.rank);
  const topCardRankIndex = RANKS.indexOf(topCard.rank);

  return firstCardRankIndex === topCardRankIndex - 1;
}

function flipTopCard(columnIndex) {
  const column = gameState.tableau[columnIndex];
  if (column.length > 0) {
    const topCard = column[column.length - 1];
    if (!topCard.faceUp) {
      topCard.faceUp = true;
    }
  }
}

function checkWinCondition() {
  const allComplete = gameState.foundations.every(
    (foundation) => foundation.length === 13,
  );
  if (allComplete) {
    setTimeout(() => {
      document.getElementById("win-message").classList.remove("hidden");
    }, 300);
  }
}

function resetGame() {
  document.getElementById("win-message").classList.add("hidden");
  dealCards();
  renderGame();
}

function setDifficulty(difficulty) {
  gameState.difficulty = difficulty;
  gameState.drawCount = difficulty === "easy" ? 1 : 3;

  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const activeBtn = difficulty === "easy" ? "easy-btn" : "normal-btn";
  document.getElementById(activeBtn).classList.add("active");

  resetGame();
}

function initSolitaire(container) {
  if (container) {
    const existingContainer = document.getElementById("solitaire-container");
    if (existingContainer) {
      container.appendChild(existingContainer);
    }
  }

  document.getElementById("stock").addEventListener("click", handleStockClick);
  document.getElementById("reset-btn").addEventListener("click", resetGame);
  document.getElementById("back-btn").addEventListener("click", () => {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  });

  document
    .getElementById("easy-btn")
    .addEventListener("click", () => setDifficulty("easy"));
  document
    .getElementById("normal-btn")
    .addEventListener("click", () => setDifficulty("normal"));

  dealCards();
  renderGame();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initSolitaire());
} else {
  initSolitaire();
}
