# Tic-Tac-Toe Game

A minimal, fully functional Tic-Tac-Toe game built with vanilla JavaScript.

## Features

- Two-player turn-based gameplay
- Win detection (rows, columns, diagonals)
- Draw detection
- Winning line highlighting
- Clean, responsive UI
- Reset functionality

## Running Locally

1. Open `index.html` in any modern browser
2. Start playing immediately

## Arcade Integration

The game is wrapped in an `initTicTacToe(container)` function for easy integration:

```javascript
const container = document.getElementById("your-container");
initTicTacToe(container);
```

## Game Rules

- Players alternate turns (X starts first)
- Click any empty cell to place your mark
- First player to get 3 in a row wins
- If all cells are filled with no winner, it's a draw
- Click "Reset Game" to start over

## Tech Stack

- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- No dependencies required
