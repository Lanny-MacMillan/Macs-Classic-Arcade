# Space Invaders

A classic Space Invaders arcade game built with vanilla JavaScript and HTML5 Canvas featuring 10 progressive levels.

## Features

- **10 Progressive Levels** with increasing difficulty
- Player movement (left/right arrow keys or A/D)
- Shooting mechanics (spacebar)
- Enemy grid formation with dynamic movement
- **Lives System** (3 lives to start)
- **Pause Functionality** (P key or Pause button)
- **Protective Barriers** (appear from level 3+)
- **Improved Fire Rate** as you progress
- Collision detection system
- Score tracking with level bonuses
- Back to Arcade button
- Restart functionality

## How to Play

1. **Move**: Use Arrow Keys or A/D to move left and right
2. **Shoot**: Press Spacebar to fire bullets
3. **Pause**: Press P or click Pause button
4. **Objective**: Complete all 10 levels by destroying every enemy wave
5. **Restart**: Click Restart button at any time

## Level Progression

Each level introduces new challenges:

- **Level 1-2**: Basic enemy waves (3 rows)
- **Level 3+**: Protective barriers appear
- **Level 4+**: Additional enemy rows added
- **Level 5+**: Faster fire rate for player
- **Level 7+**: Even more enemies per wave
- **Level 10**: Ultimate challenge

### Difficulty Scaling

- Enemy movement speed increases each level
- More enemies spawn in higher levels
- Score multiplier increases with level (10 + level x 5 per enemy)
- Shooting cooldown decreases every 3 levels

## Game Rules

- **Lives**: Start with 3 lives
- **Lose Life**: When enemy reaches bottom or touches player
- **Game Over**: All lives lost
- **Win**: Complete all 10 levels
- **Level Complete**: Destroy all enemies to advance

## Controls

- **Arrow Left / A**: Move left
- **Arrow Right / D**: Move right
- **Spacebar**: Shoot
- **P**: Pause/Resume
- **R**: Restart (when game over)
- **Back to Arcade**: Click button to return to main menu

## Setup Instructions

### Run Locally

Simply open `index.html` in any modern web browser:

```bash
open index.html
```

Or use a local server:

```bash
python -m http.server 8000
```

Then navigate to `http://localhost:8000`

### Embed in Arcade App

The game is designed to be embedded in a larger arcade application:

```javascript
const container = document.querySelector(".game-wrapper");
const game = initSpaceInvaders(container);

// Later, to clean up:
game.destroy();
```

## Technical Details

- **Canvas Size**: 800x600
- **Player Speed**: 6px per frame
- **Max Levels**: 10
- **Starting Lives**: 3
- **Barriers**: Appear from level 3, destructible blocks

## File Structure

```
/invaders
  index.html    - Game container with UI elements
  style.css     - Arcade-style theme with buttons
  script.js     - Complete game logic with level system
  README.md     - This file
```

## Browser Compatibility

Works in all modern browsers that support:

- HTML5 Canvas
- ES6+ JavaScript
- requestAnimationFrame
