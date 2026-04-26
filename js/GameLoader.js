export class GameLoader {
  constructor() {
    this.container = document.getElementById("game-container");
    this.iframe = document.getElementById("game-frame");
  }

  load(gamePath) {
    this.iframe.src = gamePath;
    this.container.classList.remove("hidden");
  }

  unload() {
    this.iframe.src = "";
    this.container.classList.add("hidden");
  }
}
