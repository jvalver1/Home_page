# 🌿 Garden Snake Game

A beautifully organic-styled Snake game with natural aesthetics, power-ups, and sound effects. Built with pure HTML5, CSS3, and vanilla JavaScript.

![Garden Snake Game](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🎮 Overview

Garden Snake reimagines the classic Snake game with a natural, organic design philosophy. Unlike traditional computerized aesthetics, this game features earthy tones, hand-drawn typography, and smooth animations that evoke a peaceful garden setting.

## ✨ Features

### Visual Design
- **Organic Aesthetics**: Earthy color palette with greens, browns, and natural gradients
- **Hand-Drawn Typography**: Uses Caveat and Crimson Text fonts for a natural feel
- **Smooth Animations**: Floating title, pulsing power-ups, and gradient backgrounds
- **Rounded Graphics**: Organic snake segments with radial gradients and soft shadows
- **Berry-Style Food**: Red berries with highlights, stems, and tiny leaves
- **Atmospheric Effects**: Layered backgrounds with radial gradients and decorative elements

### Gameplay Mechanics
- **Classic Snake Movement**: Control with arrow keys (←↑→↓)
- **Growing System**: Snake grows longer with each berry collected
- **Collision Detection**: Game ends on wall or self-collision (unless Ghost Mode active)
- **Score Tracking**: Real-time score display
- **High Score System**: Persistent high score saved in browser localStorage

### Power-Up System
Four unique power-ups spawn randomly (30% chance when eating berries):

| Power-Up | Icon | Effect | Duration | Color |
|----------|------|--------|----------|-------|
| Speed Boost | ⚡ | Increases snake movement speed | 5 seconds | Yellow |
| Double Points | 💎 | Each berry worth 2 points | 8 seconds | Blue |
| Ghost Mode | 👻 | Pass through walls and body | 6 seconds | Purple |
| Slow Motion | 🌸 | Slows game for easier control | 7 seconds | Orange |

### Audio Features
- **Eating Sound**: Pleasant tone when collecting berries
- **Movement Sound**: Subtle audio feedback for snake movement
- **Boost Sound**: Distinctive chime when collecting power-ups
- **Game Over Sound**: Descending tone at game end
- All sounds generated using Web Audio API (no external files needed)

## 🛠️ Technologies Used

### Core Technologies
- **HTML5 Canvas**: For game rendering and graphics
- **CSS3**: For styling, animations, and visual effects
- **Vanilla JavaScript**: Pure ES6+ JavaScript, no frameworks
- **Web Audio API**: For procedural sound generation

### Key Libraries & APIs
- **Google Fonts**: Caveat (handwritten) and Crimson Text (serif)
- **localStorage API**: For persistent high score storage
- **Canvas 2D Context**: For all game graphics rendering
- **requestAnimationFrame**: For smooth animations (via setInterval)

## 📁 Code Structure

### HTML Structure
```
├── Head Section
│   ├── Meta tags and title
│   ├── Google Fonts imports
│   └── Embedded CSS
├── Body
│   ├── Decorative leaf elements
│   ├── Game container
│   │   ├── Title
│   │   ├── Score board (score + high score)
│   │   ├── Boost indicator
│   │   ├── Game canvas (600x600px)
│   │   ├── Start screen overlay
│   │   └── Game over screen overlay
│   ├── Instructions
│   └── Embedded JavaScript
```

### CSS Architecture
```css
/* Core Styling */
- Gradient backgrounds with organic colors (#1a3a2e, #2d5a45, #3d6b5a)
- Radial gradient overlays for atmosphere
- Border-radius for organic rounded shapes

/* Typography */
- Display font: 'Caveat' (handwritten, 4.5rem)
- Body font: 'Crimson Text' (serif, 1.2rem)

/* Animations */
- @keyframes float: Title floating animation
- @keyframes pulse: Power-up pulsing effect
- Transition effects on buttons and indicators
```

### JavaScript Architecture

#### Game State Variables
```javascript
snake[]          // Array of {x, y} coordinates
direction        // {x, y} movement vector
food             // {x, y} berry position
score            // Current score
highScore        // Persistent high score
gameRunning      // Boolean game state
gameSpeed        // Current game tick speed
activeBoost      // Currently active power-up
boostItem        // Power-up on field
scoreMultiplier  // Point multiplier (1 or 2)
```

#### Core Functions

**Rendering Functions**
- `drawBackground()` - Renders game board with subtle pattern
- `drawSnake()` - Draws snake with gradients, eyes, and organic styling
- `drawFood()` - Renders berry with highlight, stem, and leaf
- `drawBoost()` - Displays power-up with glow and pulse effects

**Game Logic Functions**
- `moveSnake()` - Handles movement, collision, and item collection
- `gameUpdate()` - Main game loop orchestrator
- `startGame()` - Initializes/resets game state
- `endGame()` - Handles game over state
- `placeFood()` - Spawns berry at random valid position

**Power-Up System**
- `spawnBoost()` - Creates random power-up (30% chance)
- `activateBoost()` - Applies power-up effects
- `clearBoost()` - Removes power-up effects after duration

**Audio Functions**
- `playEatSound()` - 400Hz→600Hz sine wave (0.15s)
- `playMoveSound()` - 200Hz sine wave (0.05s, quiet)
- `playBoostSound()` - 500Hz→800Hz→600Hz square wave (0.3s)
- `playGameOverSound()` - 300Hz→150Hz triangle wave (0.5s)

#### Event Handling
```javascript
// Keyboard controls
document.addEventListener('keydown', (e) => {
  // Arrow key detection
  // Direction change with opposite-direction prevention
})
```

## 🎯 Game Mechanics

### Grid System
- **Canvas Size**: 600x600 pixels
- **Grid Size**: 20 pixels per tile
- **Tile Count**: 30x30 grid (900 total tiles)

### Movement Rules
1. Snake moves one tile per game tick
2. Cannot reverse direction (prevents instant death)
3. Head position updated before collision checks
4. Body follows head using array shift/unshift

### Collision Detection
```javascript
// Wall collision
if (head.x < 0 || head.x >= tileCount || 
    head.y < 0 || head.y >= tileCount)

// Self collision
for (segment of snake) {
  if (head.x === segment.x && head.y === segment.y)
}

// Food/boost collision
if (head.x === item.x && head.y === item.y)
```

### Power-Up Effects Implementation

**Speed Boost**: Reduces `gameSpeed` from 150ms to 80ms
**Double Points**: Sets `scoreMultiplier` to 2
**Ghost Mode**: Adds wall wrapping and disables collision checks
**Slow Motion**: Increases `gameSpeed` from 150ms to 250ms

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/garden-snake.git
cd garden-snake
```

2. Open the game:
```bash
# Simply open the HTML file in your browser
open snake-game.html

# Or use a local server (recommended)
python -m http.server 8000
# Then navigate to http://localhost:8000/snake-game.html
```

### No Build Process Required!
This game uses pure HTML/CSS/JS with no dependencies or build tools. Just open the HTML file in any modern browser.

## 🎮 How to Play

1. **Start**: Click "Begin Journey" button
2. **Move**: Use arrow keys (←↑→↓) to control the snake
3. **Collect Berries**: Red berries make your snake grow and increase score
4. **Grab Power-Ups**: Glowing items give temporary abilities
5. **Avoid**: Don't hit walls or your own body (unless in Ghost Mode!)
6. **Compete**: Beat your high score!

### Controls
- `↑` Arrow Up - Move North
- `↓` Arrow Down - Move South  
- `←` Arrow Left - Move West
- `→` Arrow Right - Move East

## 🎨 Design Philosophy

This game deliberately avoids typical "AI-generated" aesthetics:

### What We Avoided
- ❌ Generic fonts (Inter, Roboto, Arial)
- ❌ Purple gradients on white backgrounds
- ❌ Cyberpunk/neon aesthetics
- ❌ Cookie-cutter component patterns
- ❌ Overly mechanical grid systems

### What We Embraced
- ✅ Natural, earthy color palette
- ✅ Organic shapes and gradients
- ✅ Hand-drawn typography
- ✅ Soft shadows and atmospheric effects
- ✅ Nature-inspired decorative elements
- ✅ Smooth, gentle animations

## 🌐 Browser Compatibility

**Fully Supported:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

**Requirements:**
- HTML5 Canvas support
- ES6 JavaScript
- Web Audio API
- localStorage API
- CSS3 animations

## 📊 Performance Notes

- **Frame Rate**: ~6-12 FPS (150ms per frame, adjusts with boosts)
- **Memory Usage**: <10MB
- **Canvas Operations**: ~5-10 draw calls per frame
- **localStorage**: <1KB for high score storage

## 🔧 Customization

### Adjust Game Speed
```javascript
let gameSpeed = 150; // Change to 100 for faster, 200 for slower
```

### Modify Grid Size
```javascript
const gridSize = 20; // Change tile size (affects canvas coordination)
```

### Add New Power-Ups
```javascript
const boostTypes = [
  { 
    name: 'Your Boost', 
    emoji: '🔥', 
    color: '#ff6b6b', 
    duration: 5000, 
    effect: 'custom' 
  }
];
```

### Change Color Scheme
```css
/* Background gradient */
background: linear-gradient(135deg, #1a3a2e 0%, #2d5a45 50%, #3d6b5a 100%);

/* Snake colors */
gradient.addColorStop(0, '#7cb342'); /* Change these */
gradient.addColorStop(1, '#558b2f');
```

## 🐛 Known Issues

- None currently reported

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] Multiple difficulty levels
- [ ] Different snake skins/themes
- [ ] Obstacle system (rocks, flowers)
- [ ] Multiplayer mode
- [ ] Mobile touch controls
- [ ] Sound volume controls
- [ ] Pause functionality
- [ ] Leaderboard system
- [ ] Achievement badges

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👏 Credits

**Design & Development**: Created with a focus on organic, natural aesthetics
**Fonts**: Google Fonts (Caveat by Pablo Impallari, Crimson Text by Sebastian Kosch)
**Inspiration**: Classic Snake game, reimagined with nature-inspired design

## 🌟 Show Your Support

Give a ⭐️ if you enjoyed playing Garden Snake!

---

**Made with 🌿 and ❤️**
