# Mac's Classic Arcade

A modular, browser-based arcade game hub built with vanilla JavaScript and iframe isolation.

## Architecture

### Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Styling**: Pure CSS with retro arcade theme
- **Game Isolation**: iframe-based architecture

### Why Vanilla JS + iframes?

- **Zero dependencies**: No build process, runs directly in browser
- **True isolation**: Each game runs in separate iframe with own JS/CSS scope
- **Technology agnostic**: Games can use any framework or vanilla code
- **No conflicts**: Games cannot interfere with each other or main app
- **Easy deployment**: Just serve static files

## Project Structure

```
/
├── index.html              # Main arcade screen
├── app.js                  # App initialization and orchestration
├── style.css               # Global arcade styling
├── games.json              # Game metadata registry
├── /js
│   ├── GameCard.js         # Reusable game card component
│   └── GameLoader.js       # iframe management for game loading
└── /games
    └── /snake              # Self-contained game
        ├── index.html
        ├── game.js
        └── style.css
```

## How to Run

### Local Development

1. Start a local server in the project root:

   ```bash
   # Python 3
   python3 -m http.server 8000

   # Node.js
   npx serve

   # PHP
   php -S localhost:8000
   ```

2. Open browser to `http://localhost:8000`

### Why a server is required

ES6 modules require HTTP protocol due to CORS restrictions. File protocol (file://) will not work.

## Adding New Games

### Step 1: Create game folder

```
/games/your-game/
  ├── index.html
  ├── game.js
  └── style.css
```

### Step 2: Build your game

Each game is completely isolated. Use any approach:

- Canvas rendering
- DOM manipulation
- WebGL
- Even different frameworks

### Step 3: Register in games.json

```json
{
  "id": "your-game",
  "title": "Your Game",
  "description": "Game description",
  "icon": "🎮",
  "path": "./games/your-game/index.html"
}
```

### Game Independence

- Games run in separate iframes
- No shared state between games
- CSS/JS cannot leak or conflict
- Games can be developed/tested independently

## Design Philosophy

### Modularity

Each game is a standalone web page that runs in isolation.

### Scalability

Adding games requires no changes to core code, only:

1. New game folder
2. Entry in games.json

### Simplicity

No build tools, no complex state management, no framework overhead.

## Browser Support

- Modern browsers with ES6 module support
- Chrome, Firefox, Safari, Edge (latest versions)

## Future Enhancements

- Game state persistence (localStorage)
- High score system
- Game categories/filtering
- Keyboard shortcuts for navigation
- Fullscreen mode per game
