# 🐍 Jungle Snake - Realistic Snake Game

A visually stunning, photorealistic implementation of the classic Snake game with a jungle theme. Navigate through the wild, feast on monkeys, and avoid obstacles in this modern take on the timeless arcade classic!

![Jungle Snake Game](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🎮 Game Features

### Core Gameplay

- **Classic Snake Mechanics**: Control a growing snake as you collect food
- **Progressive Difficulty**: 5 unique levels with increasing speed and obstacles
- **Dynamic Obstacles**: Trees and stones spawn as you level up
- **Score Tracking**: Real-time score display with persistent high score storage
- **Smooth Animations**: Fluid movement and pulsing food animations

### Visual Design

- **Photorealistic Graphics**: Hand-crafted canvas-based rendering with:
  - Detailed snake with realistic scales, 3D shading, and reptilian eyes
  - Animated monkey food with fur texture and facial features
  - Textured obstacles (trees with bark and moss, stones with cracks)
  - Subtle grid overlay and atmospheric lighting
- **Jungle Theme**: Rich color palette with greens, browns, and earth tones
- **Responsive UI**: Adapts to different screen sizes (desktop, tablet, mobile)
- **Premium Aesthetics**: Gradient backgrounds, shadows, and glassmorphism effects

### Game Levels

| Level | Name             | Min Score | Speed (ms) | Obstacles |
| ----- | ---------------- | --------- | ---------- | --------- |
| 1     | Jungle Newbie    | 0         | 150        | 0         |
| 2     | Snake Apprentice | 50        | 120        | 3         |
| 3     | Jungle Hunter    | 100       | 100        | 6         |
| 4     | Apex Predator    | 200       | 80         | 10        |
| 5     | Jungle Legend    | 300       | 60         | 15        |

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies or installations required!

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/jungle-snake.git
   cd jungle-snake
   ```

2. **Open the game**
   - Simply open `index.html` in your web browser
   - Or use a local server:

     ```bash
     # Python 3
     python -m http.server 8000

     # Python 2
     python -m SimpleHTTPServer 8000

     # Node.js (with http-server)
     npx http-server
     ```

   - Navigate to `http://localhost:8000`

3. **Start Playing!**
   - Click "START GAME" or press `SPACE`
   - Use arrow keys to control the snake
   - Enjoy the jungle adventure!

## 🎯 How to Play

### Controls

- **Arrow Keys**: Control snake direction
  - `↑` Move Up
  - `↓` Move Down
  - `←` Move Left
  - `→` Move Right
- **SPACE**: Start game / Restart after game over

### Objective

1. **Eat Monkeys** 🐵: Guide your snake to the monkey food to grow and score points (+10 per monkey)
2. **Avoid Collisions**: Don't hit walls, obstacles, or yourself
3. **Level Up**: Reach score milestones to advance through levels
4. **Beat Your High Score**: Your best score is saved locally

### Game Rules

- The snake grows by one segment each time it eats food
- Speed increases as you progress through levels
- New obstacles spawn when you level up
- Game ends on collision with walls, obstacles, or self
- High scores persist between sessions (stored in browser localStorage)

## 📁 Project Structure

```
Snake.Realistic/
├── index.html          # Main HTML structure
├── style.css           # Styling and visual design
├── game.js             # Game logic and rendering engine
└── README.md           # This file
```

### File Descriptions

#### `index.html`

- Semantic HTML5 structure
- Game canvas and overlay screens (start/game over)
- Score display panel and controls information
- Google Fonts integration (Bungee Shade, Creepster, Righteous)

#### `style.css`

- Jungle-themed color palette with CSS custom properties
- Responsive grid layout for game components
- Gradient backgrounds and shadow effects
- Mobile-friendly media queries
- Smooth animations and transitions

#### `game.js`

- **Game Engine**: Main game loop with configurable tick rate
- **Rendering System**: Canvas-based photorealistic graphics
  - Radial gradients for 3D lighting effects
  - Detailed texture patterns (scales, fur, bark)
  - Animated elements (pulsing food, highlights)
- **Collision Detection**: Wall, self, and obstacle collision
- **Level System**: Progressive difficulty scaling
- **State Management**: Game state, score tracking, localStorage integration
- **Input Handling**: Keyboard controls with direction validation

## 🎨 Technical Highlights

### Canvas Rendering

The game uses HTML5 Canvas API with advanced techniques:

- **Radial Gradients**: Create 3D depth and lighting
- **Layered Drawing**: Shadows, base colors, highlights, and details
- **Procedural Textures**: Dynamic scale, fur, and bark patterns
- **Animation**: Time-based pulsing and smooth transitions

### Performance Optimizations

- Efficient game loop with `setTimeout` for consistent frame timing
- Grid-based collision detection (O(1) lookup)
- Minimal DOM manipulation
- Optimized rendering pipeline

### Responsive Design

- Fluid canvas sizing with max-height constraints
- Adaptive layout for different screen sizes
- Touch-friendly UI elements
- Graceful degradation on smaller devices

## 🛠️ Customization

### Modify Game Difficulty

Edit the `CONFIG.levels` array in `game.js`:

```javascript
levels: [
  { minScore: 0, speed: 150, obstacles: 0, name: "Easy" },
  { minScore: 100, speed: 100, obstacles: 5, name: "Medium" },
  // Add more levels...
];
```

### Change Colors

Update CSS custom properties in `style.css`:

```css
:root {
  --jungle-dark: #1a3a1a;
  --accent-yellow: #ffd700;
  /* Modify colors here */
}
```

### Adjust Grid Size

Modify `CONFIG.gridSize` in `game.js`:

```javascript
const CONFIG = {
  gridSize: 20, // Change to 15, 25, etc.
  // ...
};
```

## 🌟 Future Enhancements

Potential features for future versions:

- [ ] Sound effects and background music
- [ ] Power-ups (speed boost, invincibility, score multiplier)
- [ ] Multiple game modes (timed, survival, endless)
- [ ] Leaderboard with online score tracking
- [ ] Mobile touch controls
- [ ] Additional themes (desert, ocean, arctic)
- [ ] Particle effects for eating food
- [ ] Achievement system

## 🐛 Known Issues

- Canvas rendering may vary slightly between browsers
- High DPI displays may show minor scaling artifacts
- Very small screen sizes (<400px) may have cramped UI

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created with ❤️ by Montykona with the help of Antigravity AI (Claude Sonnet 4.5)

## 🙏 Acknowledgments

- Inspired by the classic Snake game
- Google Fonts for typography (Bungee Shade, Creepster, Righteous)
- HTML5 Canvas API for rendering capabilities

---

**Enjoy the game! 🐍🌴** If you found this project helpful, please consider giving it a ⭐ on GitHub!
