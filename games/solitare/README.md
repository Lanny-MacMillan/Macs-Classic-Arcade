# Klondike Solitaire

A fully functional browser-based Klondike Solitaire game built with vanilla JavaScript.

## Features

- Standard 52-card deck with proper shuffling
- Classic Klondike rules implementation
- Two difficulty levels:
  - Easy: Draw 1 card at a time
  - Normal: Draw 3 cards at a time
- Drag-and-drop card movement
- Click-to-move for quick plays
- Automatic card flipping when uncovered
- Stock and waste pile functionality
- Four foundation piles (Ace to King by suit)
- Seven tableau columns
- Win detection
- New Game button
- Back to Arcade navigation

## How to Play

### Objective

Move all cards to the four foundation piles, building from Ace to King in each suit.

### Rules

- Tableau columns must be built in descending order with alternating colors
- Only Kings can be placed on empty tableau columns
- Foundation piles build from Ace to King in the same suit
- Click the stock pile to draw cards to the waste pile
- When stock is empty, click again to recycle waste back to stock

### Controls

- **Drag and drop**: Drag cards to move them between columns, to foundations, or from waste
- **Click**: Click waste pile card or top tableau card to auto-move to foundation if valid
- **Stock pile**: Click to draw cards (1 in Easy mode, 3 in Normal mode)
- **Difficulty**: Choose between Easy (1 card) or Normal (3 cards) draw mode
- **New Game**: Click the button to start a fresh game
- **Back to Arcade**: Return to the main arcade menu

## Running Locally

Simply open `index.html` in any modern web browser. No build tools or server required.

## Integration

The game can be embedded in a larger application using the `initSolitaire()` function:

```javascript
const container = document.getElementById("game-container");
initSolitaire(container);
```

## Technical Details

- Pure vanilla JavaScript (ES6+)
- No frameworks or dependencies
- Responsive design
- Touch-friendly for mobile devices
- Scoped CSS to prevent conflicts

## Game State

The game manages:

- Stock pile (draw pile)
- Waste pile (discarded cards)
- 4 Foundation piles (hearts, diamonds, clubs, spades)
- 7 Tableau columns

## Files

- `index.html` - Game structure
- `style.css` - Styling and layout
- `script.js` - Game logic and interaction
