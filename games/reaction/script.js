const gameArea = document.getElementById("game-area");
const startScreen = document.getElementById("start-screen");
const waitingScreen = document.getElementById("waiting-screen");
const readyScreen = document.getElementById("ready-screen");
const resultScreen = document.getElementById("result-screen");
const startBtn = document.getElementById("start-btn");
const retryBtn = document.getElementById("retry-btn");
const backBtn = document.getElementById("back-btn");
const bestTimeDisplay = document.getElementById("best-time");
const resultTitle = document.getElementById("result-title");
const resultText = document.getElementById("result-text");
const reactionTimeDisplay = document.getElementById("reaction-time");

let gameState = "idle";
let startTime = 0;
let randomDelay = 0;
let timeoutId = null;
let bestTime = localStorage.getItem("reactionBestTime") || null;

function initReaction(container) {
  if (container) {
    container.appendChild(document.querySelector(".game-wrapper"));
  }
  init();
}

function init() {
  if (bestTime) {
    bestTimeDisplay.textContent = bestTime + "ms";
  }

  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    startGame();
  });

  retryBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    startGame();
  });

  backBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
  });

  gameArea.addEventListener("click", handleGameAreaClick);
}

function startGame() {
  gameState = "waiting";
  hideAllScreens();
  waitingScreen.classList.remove("hidden");
  gameArea.classList.add("waiting");
  gameArea.classList.remove("ready");

  randomDelay = Math.floor(Math.random() * 3000) + 2000;

  timeoutId = setTimeout(() => {
    showReadyScreen();
  }, randomDelay);
}

function showReadyScreen() {
  gameState = "ready";
  hideAllScreens();
  readyScreen.classList.remove("hidden");
  gameArea.classList.remove("waiting");
  gameArea.classList.add("ready");
  startTime = Date.now();
}

function handleGameAreaClick(e) {
  if (e.target.closest("button")) {
    return;
  }

  if (gameState === "waiting") {
    handleEarlyClick();
  } else if (gameState === "ready") {
    handleSuccessClick();
  }
}

function handleEarlyClick() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  gameState = "result";
  hideAllScreens();
  resultScreen.classList.remove("hidden");
  gameArea.classList.remove("waiting", "ready");

  resultTitle.textContent = "Too Early!";
  resultText.textContent = "Wait for the screen to turn green";
  reactionTimeDisplay.textContent = "";
}

function handleSuccessClick() {
  const reactionTime = Date.now() - startTime;

  gameState = "result";
  hideAllScreens();
  resultScreen.classList.remove("hidden");
  gameArea.classList.remove("ready");

  resultTitle.textContent = "Nice!";
  resultText.textContent = "Your reaction time:";
  reactionTimeDisplay.textContent = reactionTime + "ms";

  if (!bestTime || reactionTime < parseInt(bestTime)) {
    bestTime = reactionTime;
    localStorage.setItem("reactionBestTime", bestTime);
    bestTimeDisplay.textContent = bestTime + "ms";
    resultTitle.textContent = "New Best!";
  }
}

function hideAllScreens() {
  startScreen.classList.add("hidden");
  waitingScreen.classList.add("hidden");
  readyScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});
