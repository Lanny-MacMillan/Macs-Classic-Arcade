(function () {
  const state = {
    playerScore: 0,
    computerScore: 0,
    choices: ["rock", "paper", "scissors"],
  };

  const elements = {
    playerDisplay: document.getElementById("player-display"),
    computerDisplay: document.getElementById("computer-display"),
    playerScore: document.getElementById("player-score"),
    computerScore: document.getElementById("computer-score"),
    status: document.querySelector(".game-status"),
  };

  function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * state.choices.length);
    return state.choices[randomIndex];
  }

  function getWinner(player, computer) {
    if (player === computer) return "draw";

    const winConditions = {
      rock: "scissors",
      paper: "rock",
      scissors: "paper",
    };

    return winConditions[player] === computer ? "player" : "computer";
  }

  function updateDisplay(playerChoice, computerChoice) {
    elements.playerDisplay.textContent = capitalizeFirst(playerChoice);
    elements.computerDisplay.textContent = capitalizeFirst(computerChoice);
  }

  function updateScore() {
    elements.playerScore.textContent = state.playerScore;
    elements.computerScore.textContent = state.computerScore;
  }

  function updateStatus(message) {
    elements.status.textContent = message;
  }

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function playRound(playerChoice) {
    const computerChoice = getComputerChoice();
    updateDisplay(playerChoice, computerChoice);

    const winner = getWinner(playerChoice, computerChoice);

    if (winner === "draw") {
      updateStatus("It's a draw!");
    } else if (winner === "player") {
      state.playerScore++;
      updateStatus("You win this round!");
    } else {
      state.computerScore++;
      updateStatus("Computer wins this round!");
    }

    updateScore();
  }

  function resetGame() {
    state.playerScore = 0;
    state.computerScore = 0;
    elements.playerDisplay.textContent = "?";
    elements.computerDisplay.textContent = "?";
    updateScore();
    updateStatus("Make your choice!");
  }

  function goBackToArcade() {
    window.parent.postMessage({ action: "backToArcade" }, "*");
  }

  function handleChoiceClick(event) {
    const choice = event.target.dataset.choice;
    if (choice) {
      playRound(choice);
    }
  }

  document.querySelectorAll(".choice-btn").forEach((btn) => {
    btn.addEventListener("click", handleChoiceClick);
  });

  document.querySelector(".reset-btn").addEventListener("click", resetGame);
  document.getElementById("back-btn").addEventListener("click", goBackToArcade);
})();
