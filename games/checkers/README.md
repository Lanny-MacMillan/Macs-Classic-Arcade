# Checkers Game

A fully functional checkers game built with vanilla JavaScript, HTML, and CSS.

## Features

- Standard 8x8 checkerboard
- Game modes:
  - 2 Players (local multiplayer)
  - vs Computer (AI opponent)
- Complete rule implementation:
  - Diagonal movement on dark squares
  - Mandatory captures
  - Multi-jump sequences
  - King promotion
  - Forward/backward movement for kings
- Visual indicators:
  - Selected piece highlighting
  - Valid move indicators
  - Capture requirements
  - King pieces with crown symbol
- Move history tracking
- Win condition detection
- Reset game functionality

## How to Run

### Option 1: Direct File Open

1. Navigate to the `games/checkers` folder
2. Double-click `index.html`
3. The game will open in your default browser

### Option 2: Local Server (Recommended)

Using Python:

```bash
cd games/checkers
python3 -m http.server 8000
```

Then visit: `http://localhost:8000`

Using Node.js (if you have npx):

```bash
cd games/checkers
npx serve
```

## How to Play

1. Select game mode: "2 Players" or "vs Computer"
2. Player 1 (red pieces) moves first
3. Click a piece to select it
4. Click a highlighted square to move
5. Regular pieces move diagonally forward
6. Kings (marked with crown) move diagonally in any direction
7. Captures are mandatory when available
8. Multiple jumps must be completed in a single turn
9. Reach the opposite end to promote a piece to king
10. Win by capturing all opponent pieces or blocking all moves

### AI Mode

- In "vs Computer" mode, you play as red (Player 1)
- The computer plays as black (Player 2)
- Computer makes moves automatically with a brief delay
- Computer follows all standard checkers rules

## Game Rules

- Pieces move diagonally on dark squares only
- Regular pieces move forward only
- Kings move forward and backward
- Capture by jumping over opponent pieces
- If a capture is available, it must be taken
- Multiple captures in sequence are allowed and required
- Pieces promote to king upon reaching the opposite end
- Game ends when one player has no pieces or valid moves

## File Structure

```
/checkers
  index.html    - Game structure and layout
  style.css     - Styling and visual design
  script.js     - Game logic and mechanics
  README.md     - Documentation
```

## Technical Implementation

- Board represented as 8x8 2D array
- Piece state tracking (player, king status)
- Move validation with mandatory capture enforcement
- Multi-jump detection and continuation
- Turn management with state tracking
- Win condition checking
- DOM manipulation for rendering

## Browser Compatibility

Works on all modern browsers:

- Chrome
- Firefox
- Safari
- Edge

No build tools or dependencies required.
