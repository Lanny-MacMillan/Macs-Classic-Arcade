import { GameCard } from "./js/GameCard.js";
import { GameLoader } from "./js/GameLoader.js";

class ArcadeApp {
  constructor() {
    this.games = [];
    this.gameLoader = new GameLoader();
    this.init();
  }

  async init() {
    await this.loadGames();
    this.render();
    this.setupEventListeners();
  }

  async loadGames() {
    try {
      const response = await fetch("./games.json");
      this.games = await response.json();
    } catch (error) {
      console.error("Failed to load games:", error);
      this.games = [];
    }
  }

  render() {
    const mainScreen = document.getElementById("main-screen");
    mainScreen.innerHTML = "";

    this.games.forEach((game) => {
      const card = GameCard.create(game);
      card.addEventListener("click", () => this.launchGame(game));
      mainScreen.appendChild(card);
    });
  }

  launchGame(game) {
    this.gameLoader.load(game.path);
    document.getElementById("main-screen").style.display = "none";
    document.querySelector(".arcade-header").style.display = "none";
  }

  setupEventListeners() {
    document.getElementById("back-btn").addEventListener("click", () => {
      this.gameLoader.unload();
      document.getElementById("main-screen").style.display = "grid";
      document.querySelector(".arcade-header").style.display = "block";
    });

    window.addEventListener("message", (event) => {
      if (event.data.action === "backToArcade") {
        this.gameLoader.unload();
        document.getElementById("main-screen").style.display = "grid";
        document.querySelector(".arcade-header").style.display = "block";
      }
    });
  }
}

new ArcadeApp();
