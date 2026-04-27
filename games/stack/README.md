# Stack

A timing-based stacking game built with vanilla JavaScript and HTML5 Canvas where precision is key.

## How to Play

- Stack moving blocks on top of each other as precisely as possible
- Each misaligned drop cuts off the overhanging part
- Game ends when the block becomes too small or completely misses

## Controls

- **SPACE** or **Click**: Drop the current block

## Scoring

- Each successfully stacked block adds 1 point
- Perfect alignment keeps the block at full width
- Score increases best score when you beat your record

## Features

- Horizontal block movement with direction changes
- Alignment detection with automatic trimming
- Progressive difficulty with increasing speed
- Perfect drop detection
- Best score tracking with localStorage
- Game over when block width is too small
- Clean modern aesthetic with gradient colors

## Gameplay Mechanics

- Blocks slide horizontally back and forth
- Drop timing determines alignment with previous block
- Misaligned portions are cut off
- Block width shrinks on imperfect drops
- Speed increases every 5 successful stacks
- Game ends at minimum width threshold
