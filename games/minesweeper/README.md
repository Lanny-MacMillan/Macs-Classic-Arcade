# Minesweeper

A classic Minesweeper game built with vanilla JavaScript.

## Features

- Multiple difficulty levels:
  - **Easy**: 9x9 grid with 10 mines
  - **Medium**: 16x16 grid with 40 mines
  - **Hard**: 20x20 grid with 80 mines
- Left-click to reveal cells
- Right-click to flag/unflag cells
- Automatic flood-fill for empty cells
- Mine counter and game status display
- Win/lose detection
- Reset functionality

## How to Play

1. **Choose difficulty**: Select Easy, Medium, or Hard
2. **Reveal cells**: Left-click on any cell to reveal it
3. **Flag mines**: Right-click on cells you think contain mines
4. **Numbers**: Revealed numbers indicate how many mines are adjacent
5. **Win**: Reveal all non-mine cells without clicking a mine
6. **Lose**: Click on a mine and the game ends

## Running Locally

Simply open `index.html` in any modern web browser. No build process or server required.

```bash
open index.html
```

## Integration

The game can be initialized inside a container element:

```javascript
const container = document.getElementById("game-container");
initGame(container);
```

Or it will auto-initialize when the page loads.

## Game Logic

- Board represented as 2D array of cell objects
- Mines placed randomly at game start
- Adjacent mine counts calculated automatically
- Recursive flood-fill for empty cell reveals
- Game state tracked (playing/won/lost)

## Files

- `index.html` - Game structure and layout
- `style.css` - Visual styling and responsive design
- `script.js` - Game logic and mechanics
