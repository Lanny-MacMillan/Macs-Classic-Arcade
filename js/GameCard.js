export class GameCard {
  static create(game) {
    const card = document.createElement("div");
    card.className = "game-card";

    card.innerHTML = `
            <div class="game-thumbnail">${game.icon}</div>
            <div class="game-info">
                <h2 class="game-title">${game.title}</h2>
                <p class="game-description">${game.description || ""}</p>
            </div>
        `;

    return card;
  }
}
