const texts = [
  "The quick brown fox jumps over the lazy dog near the riverbank on a sunny afternoon.",
  "Programming is the art of telling another human what one wants the computer to do.",
  "Practice makes perfect when learning to type faster and with greater accuracy every day.",
  "Technology advances rapidly and changes the way we live work and communicate with others.",
  "Success is not final failure is not fatal it is the courage to continue that counts most.",
  "Learning new skills requires dedication patience and consistent effort over time to master.",
  "The journey of a thousand miles begins with a single step taken in the right direction.",
  "Great things are done by a series of small things brought together with persistence.",
  "Knowledge is power but enthusiasm pulls the switch that turns on the light of learning.",
  "Every expert was once a beginner who refused to give up despite facing many challenges.",
];

let currentText = "";
let startTime = null;
let timerInterval = null;
let isGameActive = false;
let totalTyped = 0;
let correctTyped = 0;

const textDisplay = document.getElementById("text-display");
const typingInput = document.getElementById("typing-input");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const timerDisplay = document.getElementById("timer");
const resetBtn = document.getElementById("reset-btn");
const backBtn = document.getElementById("back-btn");
const results = document.getElementById("results");
const finalWpm = document.getElementById("final-wpm");
const finalAccuracy = document.getElementById("final-accuracy");
const finalTime = document.getElementById("final-time");

function initTypingGame(container) {
  if (container) {
    const gameContent = document.getElementById("game-container");
    if (gameContent) {
      container.appendChild(gameContent);
    }
  }
  initGame();
}

function initGame() {
  currentText = texts[Math.floor(Math.random() * texts.length)];
  renderText();

  typingInput.value = "";
  typingInput.disabled = false;
  typingInput.focus();

  startTime = null;
  isGameActive = false;
  totalTyped = 0;
  correctTyped = 0;

  wpmDisplay.textContent = "0";
  accuracyDisplay.textContent = "100%";
  timerDisplay.textContent = "0s";
  results.classList.add("hidden");

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function renderText() {
  textDisplay.innerHTML = currentText
    .split("")
    .map((char, index) => `<span data-index="${index}">${char}</span>`)
    .join("");
}

function updateDisplay() {
  const typedText = typingInput.value;
  const spans = textDisplay.querySelectorAll("span");

  spans.forEach((span, index) => {
    const typedChar = typedText[index];

    span.classList.remove("correct", "incorrect", "current");

    if (typedChar == null) {
      if (index === typedText.length) {
        span.classList.add("current");
      }
    } else if (typedChar === span.textContent) {
      span.classList.add("correct");
    } else {
      span.classList.add("incorrect");
    }
  });
}

function calculateWPM() {
  if (!startTime) return 0;

  const timeElapsed = (Date.now() - startTime) / 1000 / 60;
  const wordsTyped = correctTyped / 5;
  return Math.round(wordsTyped / timeElapsed) || 0;
}

function calculateAccuracy() {
  if (totalTyped === 0) return 100;
  return Math.round((correctTyped / totalTyped) * 100);
}

function updateStats() {
  wpmDisplay.textContent = calculateWPM();
  accuracyDisplay.textContent = calculateAccuracy() + "%";

  if (startTime) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = elapsed + "s";
  }
}

function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(updateStats, 100);
  }
}

function endGame() {
  isGameActive = false;
  typingInput.disabled = true;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  finalWpm.textContent = calculateWPM();
  finalAccuracy.textContent = calculateAccuracy();
  finalTime.textContent = Math.floor((Date.now() - startTime) / 1000);

  results.classList.remove("hidden");
}

typingInput.addEventListener("input", () => {
  if (!isGameActive) {
    startTime = Date.now();
    isGameActive = true;
    startTimer();
  }

  const typedText = typingInput.value;
  const lastChar = typedText[typedText.length - 1];
  const expectedChar = currentText[typedText.length - 1];

  if (lastChar !== undefined) {
    totalTyped++;
    if (lastChar === expectedChar) {
      correctTyped++;
    }
  }

  updateDisplay();
  updateStats();

  if (typedText === currentText) {
    endGame();
  }
});

resetBtn.addEventListener("click", initGame);

backBtn.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { initTypingGame };
}

initGame();
