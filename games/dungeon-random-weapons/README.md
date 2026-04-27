# Dungeon Random Weapons

A top-down dungeon crawler with procedurally generated rooms and randomized weapon mechanics. Fight enemies, collect unique weapons, and progress through increasingly difficult rooms.

## How to Play

### Controls

- **WASD** or **Arrow Keys** - Move player
- **Auto-Fire** - Automatically shoot at nearest enemy

### Objective

- Clear each room of enemies to unlock the exit door
- Collect weapons with random properties and modifiers
- Survive as long as possible through progressively harder rooms

## Game Mechanics

### Weapon System

Each weapon is randomly generated with:

- Variable fire rate, damage, speed, and range
- 1-2 behavior modifiers that drastically change gameplay

### Weapon Modifiers

- **Piercing** - Projectiles pass through enemies
- **Bounce** - Projectiles ricochet off walls
- **Multishot** - Fire 3 projectiles in a tight pattern
- **Spread** - Fire 3 projectiles in a wide arc
- **Orbit** - Projectiles circle around the player
- **Inaccurate** - Slight random firing angle

### Progression

- Enemies drop weapons and keys
- Each room increases in difficulty
- Exit doors unlock when all enemies are defeated

## Features

- Smooth player movement and controls
- Auto-targeting system for combat
- Procedural room generation with obstacles
- Enemy AI with chase behavior
- Collision detection for players, enemies, and projectiles
- Health system with damage feedback
- Weapon pickup and swapping
- Progressive difficulty scaling

## Technical Details

- Built with Vanilla JavaScript
- HTML5 Canvas rendering
- Frame-based game loop
- Composition-based weapon modifier system
