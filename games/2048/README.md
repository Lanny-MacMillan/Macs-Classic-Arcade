# 2048 Game

A classic 2048 puzzle game implementation in vanilla JavaScript.

## How to Play

- Use arrow keys to move tiles in any direction
- When two tiles with the same number touch, they merge into one
- Each move adds a new tile (2 or 4) to the board
- Try to reach the 2048 tile to win
- Game ends when no more moves are possible

## Controls

- **Arrow Keys**: Move tiles (Up, Down, Left, Right)
- **Reset Game**: Start a new game
- **Back to Arcade**: Return to the main arcade menu

## Game Rules

1. Start with two random tiles (2 or 4)
2. Tiles slide as far as possible in the chosen direction
3. Matching tiles merge and add to your score
4. Each tile can only merge once per move
5. After each valid move, a new tile appears

## Features

- Score tracking
- Win detection (reaching 2048)
- Game over detection
- Smooth animations
- Responsive design
- Color-coded tiles by value

## Implementation

Built with:

- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- No external dependencies

The game uses a 4x4 grid array to track tile positions and values. Movement logic handles compression, merging, and spawning new tiles after each valid move.
