# 🤖 Montykona INC — AI Projects & Demos Portfolio

> A personal portfolio of interactive web applications and browser games, **generated entirely by Artificial Intelligence** using various frontier and open-source language models. This repository serves as a living laboratory for exploring and comparing the code generation capabilities of modern LLMs.

---

## 🌐 Live Portal

The root `index.html` is a **dark-theme portfolio hub** that aggregates all sub-projects into a single, navigable dashboard. Built with:

- **TailwindCSS + Glassmorphism UI** — frosted-glass cards with neon border highlights and backdrop blur
- **Live iframe previews** — each project card renders a miniature, interactive preview of the actual running app
- **Collapsible category sections** — 3 groups (Demos, Tetris Games, Snake Games) with smooth animated expand/collapse
- **Responsive grid** — 1 → 2 → 3 column layout depending on screen width
- **Real-time clock** — live date/time in the header (updated every second)
- **Space Grotesk** typography + Material Symbols iconography throughout

---

## 📁 Project Breakdown

### 🕐 Digital Clock

A **browser-based digital clock** styled in a retro-futurist aesthetic.

- **Font**: Orbitron Bold (loaded locally from `/fonts/Orbitron-Bold.ttf`)
- **Layout**: Fixed-grid digit system — each digit occupies a precise `0.8em` cage to prevent layout shift as numbers change
- **Style**: Full-screen black background, large 8rem time display with a cyan neon glow (`text-shadow: 0 0 25px rgba(0,243,255,0.6)`)
- **Date**: Displayed below in a smaller, letter-spaced format (e.g., *Friday, February 27, 2026*)
- **Responsive**: Switches to `vw`-based sizing on viewports under 900px

> ⚠️ Note: Although the folder still contains `node_modules` from a prior Electron packaging experiment, the application itself now runs entirely in the browser — no Electron or Node.js is required.

---

### 🌊 Electronic Battery *(Water Cursor Particles + Drum Machine)*

Despite its folder name, this project is a sophisticated **interactive particle + audio experience**:

- **p5.js** renders flowing water-like particles that trail and swirl around the mouse cursor
- **Tone.js** powers a programmable **step sequencer drum machine** (left-click to add beats, right-click for the settings panel)
- Configurable parameters: BPM, grid steps, swirl strength, pull strength, damping, wobble, spawn rate, particle size, and count
- Three presets: **Calm / Balanced / Energetic**
- Color palette can be toggled between warm and cold

**Libraries**: `p5.js v1.9.4`, `Tone.js v14.8.49`

---

### 🏛️ Greek-Pack Man *(Labyrinth of the Gods)*

A Pac-Man clone reskinned as a **Greek mythology adventure** titled *ΛΑΒΥΡΙΝΘΟΣ ΤΩΝ ΘΕΩΝ*.

- Play as **Hermes** navigating the Minotaur's labyrinth, collecting golden drachmas
- **4 unique enemies** with distinct AI behaviours:
  - 🔴 **Medusa** — The Chaser
  - 🟤 **Minotaur** — The Ambusher
  - 🟠 **Harpy** — The Patroller
  - 🟡 **Cyclops** — The Wanderer
- **Ambrosia** power-ups grant divine power (equivalent to Pac-Man's power pellets)
- Typography: **Cinzel** + **Philosopher** (Google Fonts — authentic Roman/Greek aesthetic)
- Greek key decorative borders top and bottom
- Pause with `SPACE`, toggle sound with `M`

---

### ⚙️ Metallic Balls *(Real-Time Ray Tracing)*

The most technically advanced demo — a **WebGL 2.0 real-time ray tracer** of three PBR metallic spheres.

- **Full GLSL fragment shader** implementing:
  - GGX normal distribution (`D_GGX`)
  - Smith geometry function (`G_Smith`)
  - Schlick Fresnel approximation (`F_Schlick`)
  - Multi-bounce reflections (sphere-to-sphere + environment)
- **Equirectangular HDRI environment map** loaded from Poly Haven (rural road, clear sky, meadow) — falls back to a procedural sky if loading fails
- **Interactive controls panel**: roughness, metallic value, reflectivity, sphere colour pickers (per sphere), radius, height, spacing, sun azimuth/elevation, environment brightness
- **Draggable orbit camera** + scroll zoom + touch support
- **Generative ambient music** via Web Audio API: C pentatonic chord progressions, reverb convolution, stereo delay line, LFO drone pads, and filtered wind noise
- FPS counter displayed bottom-left

---

### 👑 Monarquias *(Monarchia — European Monarchy Encyclopedia)*

An interactive historical encyclopedia of **European monarchies** (written in Spanish).

- Covers **15 countries**: Spain, UK, France, Germany, Austria, Russia, Sweden, Netherlands, Belgium, Denmark, Norway, Greece, Monaco, Liechtenstein, Portugal
- **Glassmorphism country cards** with circular flag images (from *flagcdn.com*) and animated hover effects
- Includes an **interactive Gantt-style comparative timeline** spanning **1450 to 2025**, rendered with pure JavaScript:
  - Each country gets a horizontal lane showing each monarch/period as a coloured bar
  - Short reigns are replaced with numbered footnotes
  - Horizontally scrollable, sticky year header
- Background: a high-resolution palace/library image (Unsplash) with a dark overlay
- Typography: **Cinzel** (titles) + **Playfair Display** (subtitles) + **Lato** (body)

---

### 🌊 Tridimensional Sine Wave *(Amstrad CPC Retro Emulator)*

A faithful **recreation of a classic Amstrad CPC BASIC demo** — a 3D sine wave rendered with a retro pixel aesthetic.

- Simulates the output of an Amstrad CPC's `PLOT` command on a 640×400 pixel canvas (`image-rendering: pixelated`)
- The scene renders a **mirrored, depth-layered 3D sine wave** using a hidden-surface horizon array (classic BASIC technique)
- **Fully configurable** parameters (matching original BASIC variable names):
  - `s` — Phase displacement (0–360°)
  - `si` — Sine amplitude width
  - `d` — Number of sine layers
  - `st` — Horizontal step interval
  - `bs` — Depth step interval
- UI styled to evoke the Amstrad's dark terminal aesthetic
- Runs on load with defaults; **[RUN] button** re-renders with new parameters

---

## 🎮 Snake Games — The AI Benchmark Suite

The **Snake game** is the primary benchmark in this portfolio. **13 different AI models** each produced their own implementation, enabling a direct comparison across:

| Version | Model | Unique Theme / Feature |
|---|---|---|
| **Snake.Realistic** | — | 🌴 Jungle Snake — eat 🐵 monkeys, jungle environment, Canvas 800×500, level progression |
| **Copilot Neon Snake** | GitHub Copilot | Neon glow cyberpunk theme |
| **Gemma 27b Ollama Snake** | Google Gemma 27B (local) | Local open-weight generation |
| **GemniFlash3 Antygravity Snake** | Gemini Flash 3 | Antigravity-assisted generation |
| **GLM-5_Z.ai Neon Snake** | Zhipu GLM-5 | Neon aesthetic from a Chinese frontier model |
| **GPT-OSS20B Ollama Snake** | OpenAI OSS 20B (local) | Open-weight GPT via Ollama |
| **MistralNemo12B Ollama Snake** | Mistral Nemo 12B (local) | Compact open-weight model |
| **Ollama Cloud Snake** | (Cloud Ollama) | Cloud-routed open model |
| **Qwen3-coder-30b-a3b LMStudio** | Alibaba Qwen3 30B (local) | Large local model via LM Studio |
| **Qwen3-coder-next LMStudio 8bits** | Alibaba Qwen3 (local, 8-bit) | Quantised local generation |
| **Sonet 4.6 Garden Snake** | Claude Sonnet 4.6 | Garden / nature theme |
| **Sonet 4.6 Graffiti Snake** | Claude Sonnet 4.6 | Urban graffiti / street art theme |
| **Sonet4.5** | Claude Sonnet 4.5 | Baseline Claude output |

---

## 🟦 Tetris Games

Three independent implementations of classic Tetris:

| Version | Model |
|---|---|
| **Tetris** | — (baseline / hand-coded or first model) |
| **Model GLM-5_Z.ai Tetris** | Zhipu GLM-5 |
| **Model.Cloud Sonet 4.6 Tetris** | Claude Sonnet 4.6 |

Each tests: piece rotation matrices, line-clear detection, game-loop timing, and score management.

---

## 🧠 AI Models Featured

| Model | Provider | Inference |
|---|---|---|
| Claude Sonnet 4.5 / 4.6 | Anthropic | Cloud |
| GLM-5 Z.ai | Zhipu AI | Cloud |
| Gemini Flash 3 (Antigravity) | Google DeepMind | Cloud |
| GitHub Copilot | Microsoft / OpenAI | Cloud |
| GPT-OSS 20B | OpenAI (via Ollama) | Local |
| Gemma 27B | Google (via Ollama) | Local |
| Mistral Nemo 12B | Mistral AI (via Ollama) | Local |
| Qwen3-Coder 30B A3B | Alibaba (via LM Studio) | Local |
| Qwen3-Coder-Next 8-bit | Alibaba (via LM Studio) | Local |

---

## 🛠️ Tech Stack

| Technology | Used In |
|---|---|
| **HTML5 / CSS3 / JS (ES6+)** | All projects |
| **Tailwind CSS** (CDN) | Portfolio hub (`index.html`) |
| **Canvas API** | Snake, Tetris, Sine Wave, Greek-Pack Man |
| **WebGL 2.0 + GLSL** | Metallic Balls (ray tracer) |
| **p5.js** | Electronic Battery (particles) |
| **Tone.js** | Electronic Battery (step sequencer) |
| **Web Audio API** | Metallic Balls (generative music) |
| **Orbitron** (local font) | Digital Clock |
| **Cinzel / Playfair Display / Lato** | Monarquias |
| **Space Grotesk** + **Material Symbols** | Portfolio hub |
| **Google Fonts** | Multiple projects |

---

## ⚠️ Disclaimer

> The web applications and games showcased in this portfolio have been **generated completely automatically** by various Artificial Intelligence models. As such, they may contain unexpected errors, unoptimized code, or features that are not fully functional. They serve purely as a **conceptual showcase** of what is achievable in a simplistic and rapid manner using modern AI code generation capabilities.

---

## 🚀 Running Locally

No build step required. Simply clone and open in a browser:

```bash
git clone https://github.com/jvalver1/Home_page.git
cd Home_page

# Open the hub
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

Each sub-project folder is self-contained — open any `index.html` directly.

---

<div align="center">
  <sub>Built with ❤️ and AI by <strong>Montykona INC</strong> · 2025–2026</sub>
</div>
