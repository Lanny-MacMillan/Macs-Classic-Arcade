(function () {
  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  const startBtn = document.getElementById("start-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const restartBtn = document.getElementById("restart-btn");
  const backBtn = document.getElementById("back-btn");
  const submitBtn = document.getElementById("submit-btn");
  const clearBtn = document.getElementById("clear-btn");
  const attemptsCount = document.getElementById("attempts-count");
  const guessHistory = document.getElementById("guess-history");
  const gameOverTitle = document.getElementById("game-over-title");
  const gameOverMessage = document.getElementById("game-over-message");
  const secretDisplay = document.getElementById("secret-display");

  const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];
  const CODE_LENGTH = 4;
  const MAX_ATTEMPTS = 10;

  let secretCode = [];
  let currentGuess = [];
  let attempts = 0;
  let gameActive = false;

  function init() {
    startScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
  }

  function generateSecretCode() {
    secretCode = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      secretCode.push(randomColor);
    }
  }

  function startGame() {
    generateSecretCode();
    currentGuess = [];
    attempts = 0;
    gameActive = true;
    guessHistory.innerHTML = "";

    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    gameOverScreen.classList.add("hidden");

    updateAttemptsDisplay();
    updateGuessSlots();
  }

  function updateAttemptsDisplay() {
    attemptsCount.textContent = MAX_ATTEMPTS - attempts;
  }

  function updateGuessSlots() {
    const slots = document.querySelectorAll(".guess-slot");
    slots.forEach((slot, index) => {
      if (currentGuess[index]) {
        slot.style.background = getColorValue(currentGuess[index]);
        slot.classList.add("filled");
      } else {
        slot.style.background = "rgba(0, 0, 0, 0.2)";
        slot.classList.remove("filled");
      }
    });

    submitBtn.disabled = currentGuess.length !== CODE_LENGTH;
  }

  function getColorValue(colorName) {
    const colorMap = {
      red: "#e74c3c",
      blue: "#3498db",
      green: "#2ecc71",
      yellow: "#f1c40f",
      purple: "#9b59b6",
      orange: "#e67e22",
    };
    return colorMap[colorName];
  }

  function addColorToGuess(color) {
    if (!gameActive) return;
    if (currentGuess.length < CODE_LENGTH) {
      currentGuess.push(color);
      updateGuessSlots();
    }
  }

  function clearCurrentGuess() {
    currentGuess = [];
    updateGuessSlots();
  }

  function getFeedback(guess) {
    const feedback = { black: 0, white: 0 };
    const secretCopy = [...secretCode];
    const guessCopy = [...guess];

    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        feedback.black++;
        secretCopy[i] = null;
        guessCopy[i] = null;
      }
    }

    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] !== null) {
        const index = secretCopy.indexOf(guessCopy[i]);
        if (index !== -1) {
          feedback.white++;
          secretCopy[index] = null;
        }
      }
    }

    return feedback;
  }

  function submitGuess() {
    if (!gameActive || currentGuess.length !== CODE_LENGTH) return;

    attempts++;
    const feedback = getFeedback(currentGuess);

    addToHistory(currentGuess, feedback);
    updateAttemptsDisplay();

    if (feedback.black === CODE_LENGTH) {
      endGame(true);
    } else if (attempts >= MAX_ATTEMPTS) {
      endGame(false);
    } else {
      clearCurrentGuess();
    }
  }

  function addToHistory(guess, feedback) {
    const row = document.createElement("div");
    row.className = "history-row";

    const guessDiv = document.createElement("div");
    guessDiv.className = "history-guess";

    guess.forEach((color) => {
      const peg = document.createElement("div");
      peg.className = "history-peg";
      peg.style.background = getColorValue(color);
      guessDiv.appendChild(peg);
    });

    const feedbackDiv = document.createElement("div");
    feedbackDiv.className = "feedback";

    for (let i = 0; i < feedback.black; i++) {
      const peg = document.createElement("div");
      peg.className = "feedback-peg black";
      feedbackDiv.appendChild(peg);
    }

    for (let i = 0; i < feedback.white; i++) {
      const peg = document.createElement("div");
      peg.className = "feedback-peg white";
      feedbackDiv.appendChild(peg);
    }

    const remaining = CODE_LENGTH - feedback.black - feedback.white;
    for (let i = 0; i < remaining; i++) {
      const peg = document.createElement("div");
      peg.className = "feedback-peg empty";
      feedbackDiv.appendChild(peg);
    }

    row.appendChild(guessDiv);
    row.appendChild(feedbackDiv);
    guessHistory.appendChild(row);
    guessHistory.scrollTop = guessHistory.scrollHeight;
  }

  function endGame(won) {
    gameActive = false;
    gameScreen.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");

    if (won) {
      gameOverTitle.textContent = "Code Cracked!";
      gameOverTitle.className = "win";
      gameOverMessage.textContent = `You broke the code in ${attempts} attempts!`;
    } else {
      gameOverTitle.textContent = "Code Not Broken";
      gameOverTitle.className = "lose";
      gameOverMessage.textContent = "Better luck next time!";
    }

    displaySecret();
  }

  function displaySecret() {
    secretDisplay.innerHTML = "";
    secretCode.forEach((color) => {
      const peg = document.createElement("div");
      peg.className = "secret-peg";
      peg.style.background = getColorValue(color);
      secretDisplay.appendChild(peg);
    });
  }

  document.querySelectorAll(".color-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.getAttribute("data-color");
      addColorToGuess(color);
    });
  });

  startBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  submitBtn.addEventListener("click", submitGuess);
  clearBtn.addEventListener("click", clearCurrentGuess);

  backBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
  });

  init();

  window.initMastermind = function (container) {
    if (container) {
      container.appendChild(document.body.firstChild);
    }
  };
})();
