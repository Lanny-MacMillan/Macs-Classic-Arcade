(function () {
  const startScreen = document.getElementById("start-screen");
  const gameArea = document.getElementById("game-area");
  const gameOverScreen = document.getElementById("game-over-screen");
  const scoreElement = document.getElementById("score");
  const accuracyElement = document.getElementById("accuracy");
  const avgTimeElement = document.getElementById("avg-time");
  const timerElement = document.getElementById("timer");
  const startBtn = document.getElementById("start-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const resetBtn = document.getElementById("reset-btn");
  const backBtn = document.getElementById("back-btn");

  const GAME_DURATION = 30;
  const TARGET_LIFETIME = 1500;
  const MIN_SPAWN_DELAY = 400;
  const MAX_SPAWN_DELAY = 800;
  const TARGET_SIZE = 50;

  let gameRunning = false;
  let score = 0;
  let totalClicks = 0;
  let successfulHits = 0;
  let reactionTimes = [];
  let currentTarget = null;
  let targetSpawnTime = null;
  let gameTimer = null;
  let targetTimeout = null;
  let spawnTimeout = null;
  let timeRemaining = GAME_DURATION;

  function init() {
    startScreen.classList.remove("hidden");
    gameArea.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
  }

  function startGame() {
    gameRunning = true;
    score = 0;
    totalClicks = 0;
    successfulHits = 0;
    reactionTimes = [];
    timeRemaining = GAME_DURATION;

    startScreen.classList.add("hidden");
    gameArea.classList.remove("hidden");
    gameOverScreen.classList.add("hidden");

    updateStats();
    startTimer();
    spawnTarget();
  }

  function startTimer() {
    timerElement.textContent = timeRemaining;

    gameTimer = setInterval(() => {
      timeRemaining--;
      timerElement.textContent = timeRemaining;

      if (timeRemaining <= 0) {
        endGame();
      }
    }, 1000);
  }

  function spawnTarget() {
    if (!gameRunning) return;

    removeTarget();

    const gameAreaRect = gameArea.getBoundingClientRect();
    const maxX = gameArea.clientWidth - TARGET_SIZE;
    const maxY = gameArea.clientHeight - TARGET_SIZE;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    currentTarget = document.createElement("div");
    currentTarget.className = "target";
    currentTarget.style.left = `${x}px`;
    currentTarget.style.top = `${y}px`;

    targetSpawnTime = Date.now();

    currentTarget.addEventListener("click", handleTargetClick);

    gameArea.appendChild(currentTarget);

    targetTimeout = setTimeout(() => {
      removeTarget();
      scheduleNextTarget();
    }, TARGET_LIFETIME);
  }

  function handleTargetClick(event) {
    event.stopPropagation();

    if (!gameRunning || !currentTarget) return;

    const reactionTime = Date.now() - targetSpawnTime;
    reactionTimes.push(reactionTime);

    score += 10;
    successfulHits++;
    totalClicks++;

    updateStats();
    removeTarget();
    scheduleNextTarget();
  }

  function handleMissClick() {
    if (!gameRunning) return;
    totalClicks++;
    updateStats();
  }

  function removeTarget() {
    if (currentTarget) {
      currentTarget.remove();
      currentTarget = null;
    }

    if (targetTimeout) {
      clearTimeout(targetTimeout);
      targetTimeout = null;
    }
  }

  function scheduleNextTarget() {
    if (!gameRunning) return;

    const delay =
      MIN_SPAWN_DELAY + Math.random() * (MAX_SPAWN_DELAY - MIN_SPAWN_DELAY);

    spawnTimeout = setTimeout(() => {
      spawnTarget();
    }, delay);
  }

  function updateStats() {
    scoreElement.textContent = score;

    const accuracy =
      totalClicks === 0
        ? 100
        : Math.round((successfulHits / totalClicks) * 100);
    accuracyElement.textContent = `${accuracy}%`;

    const avgTime =
      reactionTimes.length === 0
        ? 0
        : Math.round(
            reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length,
          );
    avgTimeElement.textContent = `${avgTime}ms`;
  }

  function endGame() {
    gameRunning = false;

    clearInterval(gameTimer);
    clearTimeout(targetTimeout);
    clearTimeout(spawnTimeout);
    removeTarget();

    gameArea.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");

    const accuracy =
      totalClicks === 0
        ? 100
        : Math.round((successfulHits / totalClicks) * 100);
    const avgTime =
      reactionTimes.length === 0
        ? 0
        : Math.round(
            reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length,
          );

    document.getElementById("final-score").textContent = score;
    document.getElementById("final-accuracy").textContent = `${accuracy}%`;
    document.getElementById("final-avg-time").textContent = `${avgTime}ms`;
    document.getElementById("targets-hit").textContent = successfulHits;
  }

  function resetGame() {
    gameRunning = false;

    clearInterval(gameTimer);
    clearTimeout(targetTimeout);
    clearTimeout(spawnTimeout);
    removeTarget();

    score = 0;
    totalClicks = 0;
    successfulHits = 0;
    reactionTimes = [];
    timeRemaining = GAME_DURATION;

    updateStats();
    init();
  }

  gameArea.addEventListener("click", handleMissClick);
  startBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", startGame);
  resetBtn.addEventListener("click", resetGame);

  backBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
  });

  init();

  window.initAimTrainer = function (container) {
    if (container) {
      container.innerHTML = "";
      container.appendChild(document.querySelector(".game-wrapper"));
    }
    init();
  };
})();
