# 🐍 SNAK3 — Urban Graffiti Edition

A browser-based Snake game with vibrant neon graffiti-style visuals, built with pure HTML5, CSS3 and vanilla JavaScript. No frameworks, no dependencies — just open and play.

---

## 🎮 Live Demo

> Open `snake.html` directly in any modern browser, or host it via GitHub Pages.

---

## 🕹️ Controls

| Key | Action |
|-----|--------|
| `↑` Arrow Up | Move up |
| `↓` Arrow Down | Move down |
| `←` Arrow Left | Move left |
| `→` Arrow Right | Move right |
| `Space` | Start / Restart game |

---

## ✨ Features

- **Rainbow neon snake** — each body segment cycles through the full HSL spectrum with a glow shadow
- **🎨 Graffiti spray-can food** — each pill is a tiny animated spray can: cylindrical body with 3D gradient, label band with letter, nozzle button and 9 colour-shifting spray dots fanning out live
- **Particle explosions** — 28 physics-driven neon particles burst on every food pickup; full snake explosion on game over
- **🔊 Procedural Sound Effects** — retro-style explosion and eating sounds generated dynamically using the Web Audio API (no external files needed)
- **Graffiti Characters** — realistic comic-style graffiti artists flanking the game board
- **Animated gradient border** — canvas wrapped in a continuously shifting rainbow border
- **Graffiti background** — random street-art tags (WILDSTYLE, THROW-UP, BOMB…) scattered and rotated in the background
- **Animated title** — "SNAK3" with a cycling neon drop-shadow
- **Snake eyes** — directional eyes on the head that follow movement
- **Score & Hi-Score** — high score persisted in `localStorage`
- **Urban typography** — *Permanent Marker* + *Boogaloo* Google Fonts

---

## 📁 Project Structure

```
.
├── snake.html    # Self-contained game — all CSS and JS inline
└── README.md
```

---

## 🚀 Getting Started

### Run locally

Just open the file in a browser:

```bash
# Windows
start snake.html

# macOS
open snake.html

# Linux
xdg-open snake.html
```

### Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Set the source to the `main` branch and `/ (root)` folder.
4. Rename `snake.html` to `index.html` (or set it as the custom page path).
5. Your game will be live at `https://<username>.github.io/<repo>/`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 Canvas 2D API |
| Styling | CSS3 (custom properties, keyframe animations, gradients) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts — Permanent Marker, Boogaloo |

---

## 🔧 Technical Deep-Dive

### Architecture

The entire game lives in a **single self-contained HTML file**. There is no build step, no bundler and no external scripts beyond Google Fonts. The file is structured in three layers:

```
[ CSS layer ]     → visual theming, animations, overlay UI
[ HTML layer ]    → two <canvas> elements + static DOM
[ JS layer ]      → game loop, rendering, particles, input
```

---

### Game Loop

The core tick runs on a fixed `setInterval` (130 ms ≈ ~7.7 FPS for the snake logic), while all visual animations — particles, food, border glow — run on `requestAnimationFrame` at the display's native refresh rate (typically 60/120 Hz). This separation keeps game logic deterministic and independent of frame rate.

```
setInterval(tick, 130)        → snake movement, collision, score
requestAnimationFrame(animLoop) → particles, food pulse, canvas clear
```

---

### Snake Rendering — HSL Colour Cycling

Each body segment is assigned a hue derived from a global counter (`hueOffset`) that increments by 4 every tick:

```js
const hue   = (hueOffset + i * 10) % 360;   // i = segment index
const color = `hsl(${hue}, 100%, 55%)`;
```

This produces a **rainbow wave that travels down the body** as the snake moves. Transparency also fades toward the tail (`alpha = 0.35 + 0.65 * (1 - t)`) giving a natural depth effect.

The head receives an extra specular highlight (a semi-transparent white rectangle drawn with `roundRect`) and two directional eyes that reposition based on the current movement vector.

---

### Spray-Can Food — Canvas 2D Drawing

The food item is drawn entirely with the **Canvas 2D API** on every frame — no images or SVGs are used. The render pipeline for one spray can is:

| Step | Canvas Operation |
|------|-----------------|
| Cap (top) | `roundRect` fill with dark HSL tone |
| Neck | `fillRect` connecting cap to body |
| Cylindrical body | `roundRect` + horizontal `createLinearGradient` (dark→light→base→dark) for 3D illusion |
| Label band | Semi-transparent `fillRect` + bold text (`"S"`) |
| Nozzle button | Small top-right `roundRect` in light grey |
| Spray dots | 9 arcs animated with `Date.now()` — each dot follows a radial trajectory from the nozzle |

The **spray dots animation** works by sampling a continuous time value:

```js
const frac  = ((now + i / sprayCount) % 1);   // 0→1 lifecycle
const dist  = frac * 11 * s;                  // grows outward
const alpha = (1 - frac) * 0.95;              // fades as it travels
```

Each of the 9 dots is offset in phase so they appear as a **continuous stream** rather than a burst. The fan angle is controlled by:

```js
const angle = -Math.PI / 2 + (i - (sprayCount - 1) / 2) * 0.21;  // ~±0.84 rad spread
```

The can colour (hue) cycles in sync with the global `hueOffset`, and the individual dots shift further by `i * 18` degrees for a multicolour mist effect.

---

### Particle System

A lightweight **immediate-mode particle system** runs on a second full-screen `<canvas>` layered above the game via CSS `z-index`.

```js
// Spawn
spawnParticles(px, py, 28)   // on food pickup
spawnParticles(px, py, 6)    // per snake segment on game-over

// Each particle holds:
{ x, y, vx, vy, life, decay, size, color }
```

Each frame:
1. `vy += 0.18` — simulates gravity
2. `life -= decay` — fades out over ~40–50 frames
3. Drawn as a filled arc with `shadowBlur` glow
4. Dead particles (`life ≤ 0`) are filtered out of the array

World coordinates are converted from canvas grid cells to page pixels using `canvas.getBoundingClientRect()` so particles appear exactly over the game cell regardless of layout.

---

### Audio System (Web Audio API)

The game features procedural sound effects generated entirely in code, eliminating the need for external audio files.

- **Eat Sound**: A quick, rising sine wave oscillator (`400Hz` to `800Hz`) with a fast volume decay (`0.1s`), creating a classic retro "bloop" sound.
- **Explosion Sound**: Generates a buffer of random white noise, which is then passed through a `BiquadFilterNode` (low-pass filter). The filter frequency drops rapidly (`1000Hz` to `100Hz`) alongside the volume, simulating a deep, muffled explosion when the snake crashes.

---

### CSS Visual Effects

| Effect | Technique |
|--------|-----------|
| Neon title | `background-clip: text` + animated `drop-shadow` keyframes |
| Rainbow border | `background-size: 300%` + `background-position` keyframe animation |
| Ambient background | Overlapping `radial-gradient` layers with low-opacity neon colours |
| Graffiti tags | Absolutely positioned `div` elements with random `font-size`, `rotate` and `opacity: 0.06` |
| Overlay blur | `backdrop-filter: blur(4px)` on the game-over/start panel |

---

### Collision Detection

Collision is checked at the start of each tick against two conditions:

```js
// Wall
if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) → gameOver()

// Self
if (snake.some(s => s.x === head.x && s.y === head.y)) → gameOver()
```

The snake is stored as an array of `{x, y}` grid objects. Movement uses `unshift` (prepend new head) + `pop` (remove tail). On food pickup, `pop` is skipped, growing the snake by one cell.

---

### Input Handling

Direction changes are buffered into `nextDir` and only applied at the next tick, preventing the player from reversing into themselves by pressing two keys between ticks:

```js
// Only allow 90° turns — never 180°
if (dir.y === 0) nextDir = { x: 0, y: -1 };   // ↑ only if not moving vertically
```

---

## 📜 License

MIT — free to use, modify and distribute.
