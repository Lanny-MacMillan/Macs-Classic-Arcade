# Chess Game

A fully functional browser-based chess game with legal move validation, turn-based gameplay, and move history.

## Features

- Full chess rules implementation via chess.js
- Legal move validation
- Turn indicator (White/Black)
- Visual feedback for selected pieces and valid moves
- Check and checkmate detection
- Move history display
- Reset game button
- Clean, responsive UI with Unicode chess pieces
- AI opponent with 3 difficulty levels (Easy, Medium, Hard)
- 2 Player mode for local multiplayer

## How to Run

### Option 1: Open Directly

Simply open `index.html` in your browser.

### Option 2: Local Server (Recommended)

If you have Python installed:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then navigate to `http://localhost:8000/games/chess/`

### Option 3: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## How to Play

### Game Modes

Choose between:

- **2 Player**: Play locally with a friend (hot-seat)
- **vs AI**: Play against the computer

### AI Difficulty

When playing vs AI, select from:

- **Easy**: Casual play, makes random moves from reasonable options
- **Medium**: Balanced gameplay, good mix of strategy and unpredictability
- **Hard**: Challenging opponent, prioritizes best moves

### Gameplay

1. White moves first (you always play as white vs AI)
2. Click a piece to select it
3. Valid moves will be highlighted in yellow
4. Click a highlighted square to move
5. The game enforces all chess rules including check, checkmate, and stalemate
6. Move history is displayed on the right sidebar
7. Click "Reset Game" to start over

## Project Structure

```
/games/chess/
  index.html    - Main HTML structure
  style.css     - All styling and responsive design
  game.js       - Game logic and board management
```

## Dependencies

- chess.js (loaded via CDN)

## Browser Support

Works in all modern browsers that support ES6 JavaScript.
