import { GameCard } from "./js/GameCard.js";
import { GameLoader } from "./js/GameLoader.js";

class ArcadeApp {
  constructor() {
    this.games = [];
    this.gameLoader = new GameLoader();
    this.currentView = "grid";
    this.init();
  }

  async init() {
    await this.loadGames();
    this.render();
    this.setupEventListeners();
    this.loadSavedView();
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
    document.querySelector(".view-controls").style.display = "none";
  }

  setupEventListeners() {
    document.getElementById("back-btn").addEventListener("click", () => {
      this.gameLoader.unload();
      document.getElementById("main-screen").style.display = "grid";
      document.querySelector(".arcade-header").style.display = "block";
      document.querySelector(".view-controls").style.display = "flex";
    });

    window.addEventListener("message", (event) => {
      if (event.data.action === "backToArcade") {
        this.gameLoader.unload();
        document.getElementById("main-screen").style.display = "grid";
        document.querySelector(".arcade-header").style.display = "block";
        document.querySelector(".view-controls").style.display = "flex";
      }
    });

    // View switcher buttons
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const view = e.currentTarget.getAttribute("data-view");
        this.switchView(view);
      });
    });
  }

  switchView(view) {
    this.currentView = view;
    const mainScreen = document.getElementById("main-screen");

    // Remove all view classes
    mainScreen.classList.remove("compact-view", "list-view");

    // Add the appropriate view class
    if (view === "compact") {
      mainScreen.classList.add("compact-view");
    } else if (view === "list") {
      mainScreen.classList.add("list-view");
    }
    // 'grid' is the default, no extra class needed

    // Update active button
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    const activeBtn = document.querySelector(`[data-view="${view}"]`);
    if (activeBtn) {
      activeBtn.classList.add("active");
    }

    // Save preference
    localStorage.setItem("arcadeView", view);
  }

  loadSavedView() {
    const savedView = localStorage.getItem("arcadeView") || "grid";
    this.switchView(savedView);
  }
}

new ArcadeApp();
