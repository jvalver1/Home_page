// ===== JUNGLE SNAKE GAME - REALISTIC GAME ENGINE =====

// Game Configuration
const CONFIG = {
  canvas: null,
  ctx: null,
  gridSize: 40,
  tileCountX: 0,
  tileCountY: 0,

  // Level Configuration
  levels: [
    { minScore: 0, speed: 150, obstacles: 0, name: "Jungle Newbie" },
    { minScore: 50, speed: 120, obstacles: 3, name: "Snake Apprentice" },
    { minScore: 100, speed: 100, obstacles: 6, name: "Jungle Hunter" },
    { minScore: 200, speed: 80, obstacles: 10, name: "Apex Predator" },
    { minScore: 300, speed: 60, obstacles: 15, name: "Jungle Legend" },
  ],

  // Colors
  colors: {
    snakeHead: "#2d5016",
    snakeBody: "#4a7c2c",
    snakeEye: "#ffd700",
    food: "#ff8c42",
    obstacle: "#5c4033",
    grid: "rgba(107, 157, 58, 0.1)",
  },
};

// Game State
const gameState = {
  snake: [],
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  food: { x: 0, y: 0 },
  obstacles: [],
  score: 0,
  level: 1,
  highScore: 0,
  gameLoop: null,
  isRunning: false,
  isPaused: false,
};

// Image Assets (Photorealistic Graphics)
const images = {
  background: null,
  snakeHead: null,
  snakeBodyStraight: null,
  snakeBodyCorner: null,
  snakeTail: null,
  pill: null,
  obstacle: null,
  loaded: false,
  loadedCount: 0,
  totalImages: 7,
};

// Audio Manager (Web Audio API)
const AudioManager = {
  context: null,
  enabled: true,

  // Initialize audio context
  init() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      // Load sound preference from localStorage
      const savedPreference = localStorage.getItem("jungleSnakeSoundEnabled");
      this.enabled = savedPreference === null ? true : savedPreference === "true";
    } catch (e) {
      console.warn("Web Audio API not supported", e);
      this.enabled = false;
    }
  },

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("jungleSnakeSoundEnabled", this.enabled);
    return this.enabled;
  },

  // Play eat sound (pleasant pop/chomp)
  playEat() {
    if (!this.enabled || !this.context) return;

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    // Bright, pleasant tone
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  },

  // Play level up sound (ascending celebration)
  playLevelUp() {
    if (!this.enabled || !this.context) return;

    const now = this.context.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, index) => {
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(freq, now + index * 0.15);

      gainNode.gain.setValueAtTime(0.2, now + index * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.3);

      oscillator.start(now + index * 0.15);
      oscillator.stop(now + index * 0.15 + 0.3);
    });
  },

  // Play game over sound (descending tones)
  playGameOver() {
    if (!this.enabled || !this.context) return;

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.6);

    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.setValueAtTime(0.25, now + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    oscillator.start(now);
    oscillator.stop(now + 0.8);
  },

  // Play subtle background ambience (optional jungle sounds)
  playBackgroundMusic() {
    if (!this.enabled || !this.context) return;

    // Create subtle ambient drone
    const now = this.context.currentTime;
    const oscillator1 = this.context.createOscillator();
    const oscillator2 = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.context.destination);

    // Low frequency ambient tones
    oscillator1.type = "sine";
    oscillator1.frequency.setValueAtTime(110, now); // A2
    oscillator2.type = "sine";
    oscillator2.frequency.setValueAtTime(165, now); // E3

    gainNode.gain.setValueAtTime(0.05, now); // Very subtle

    oscillator1.start(now);
    oscillator2.start(now);

    // Store reference for stopping later
    this.backgroundOscillators = [oscillator1, oscillator2];
  },

  // Stop background music
  stopBackgroundMusic() {
    if (this.backgroundOscillators) {
      this.backgroundOscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });
      this.backgroundOscillators = null;
    }
  },
};

// Initialize Game
function init() {
  CONFIG.canvas = document.getElementById("gameCanvas");
  CONFIG.ctx = CONFIG.canvas.getContext("2d");
  CONFIG.tileCountX = CONFIG.canvas.width / CONFIG.gridSize;
  CONFIG.tileCountY = CONFIG.canvas.height / CONFIG.gridSize;

  // Load high score from localStorage
  gameState.highScore =
    parseInt(localStorage.getItem("jungleSnakeHighScore")) || 0;
  updateUI();

  // Load images
  loadImages();

  // Initialize audio
  AudioManager.init();

  // Event Listeners
  document.getElementById("startButton").addEventListener("click", startGame);
  document
    .getElementById("restartButton")
    .addEventListener("click", restartGame);
  document.addEventListener("keydown", handleKeyPress);
  document.getElementById("soundToggle").addEventListener("click", toggleSound);
  document.getElementById("pauseButton").addEventListener("click", togglePause);
  document.getElementById("settingsButton").addEventListener("click", () => alert("Settings coming soon!"));

  // Update sound button UI
  updateSoundButton();
}

// Load Photorealistic Images
function loadImages() {
  const assetPaths = {
    background: 'assets/background.png',
    snakeHead: 'assets/snake-head.png',
    snakeBodyStraight: 'assets/snake-body-straight.png',
    snakeBodyCorner: 'assets/snake-body-corner.png',
    snakeTail: 'assets/snake-tail.png',
    pill: 'assets/pill.png',
    obstacle: 'assets/obstacle.png',
  };

  // Load each image
  Object.keys(assetPaths).forEach(key => {
    const img = new Image();
    img.onload = () => {
      images.loadedCount++;
      console.log(`Loaded ${key}: ${images.loadedCount}/${images.totalImages}`);

      if (images.loadedCount === images.totalImages) {
        images.loaded = true;
        console.log('All images loaded successfully!');
        updateStartButton();
      }
    };

    img.onerror = () => {
      console.warn(`Failed to load ${key} from ${assetPaths[key]}. Using fallback graphics.`);
      images.loadedCount++;

      if (images.loadedCount === images.totalImages) {
        images.loaded = true;
        updateStartButton();
      }
    };

    img.src = assetPaths[key];
    images[key] = img;
  });
}

// Update start button based on loading state
function updateStartButton() {
  const startButton = document.getElementById('startButton');
  if (images.loaded) {
    startButton.disabled = false;
    startButton.textContent = 'START GAME';
  } else {
    startButton.disabled = true;
    startButton.textContent = 'LOADING...';
  }
}

// Start Game
function startGame() {
  document.getElementById("startScreen").classList.add("hidden");
  resetGame();
  gameState.isRunning = true;
  gameLoop();
}

// Restart Game
function restartGame() {
  document.getElementById("gameOverScreen").classList.add("hidden");
  resetGame();
  gameState.isRunning = true;
  gameLoop();
}

// Reset Game State
function resetGame() {
  // Initialize snake in the center
  const centerX = Math.floor(CONFIG.tileCountX / 2);
  const centerY = Math.floor(CONFIG.tileCountY / 2);

  gameState.snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];

  gameState.direction = { x: 1, y: 0 };
  gameState.nextDirection = { x: 1, y: 0 };
  gameState.score = 0;
  gameState.level = 1;
  gameState.obstacles = [];

  spawnFood();
  updateUI();
}

// Main Game Loop
function gameLoop() {
  if (!gameState.isRunning) return;

  update();
  draw();

  const currentLevel = getCurrentLevel();
  gameState.gameLoop = setTimeout(gameLoop, currentLevel.speed);
}

// Update Game State
function update() {
  // Update direction
  gameState.direction = { ...gameState.nextDirection };

  // Calculate new head position
  const head = { ...gameState.snake[0] };
  head.x += gameState.direction.x;
  head.y += gameState.direction.y;

  // Check wall collision
  if (
    head.x < 0 ||
    head.x >= CONFIG.tileCountX ||
    head.y < 0 ||
    head.y >= CONFIG.tileCountY
  ) {
    gameOver();
    return;
  }

  // Check self collision
  if (
    gameState.snake.some(
      (segment) => segment.x === head.x && segment.y === head.y,
    )
  ) {
    gameOver();
    return;
  }

  // Check obstacle collision
  if (gameState.obstacles.some((obs) => obs.x === head.x && obs.y === head.y)) {
    gameOver();
    return;
  }

  // Add new head
  gameState.snake.unshift(head);

  // Check food collision
  if (head.x === gameState.food.x && head.y === gameState.food.y) {
    gameState.score += 10;
    AudioManager.playEat(); // Play eat sound
    updateUI();
    spawnFood();
    checkLevelUp();
  } else {
    // Remove tail if no food eaten
    gameState.snake.pop();
  }
}

// Draw Everything
function draw() {
  const ctx = CONFIG.ctx;

  // Clear canvas instead of drawing solid background to be transparent
  ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

  // Draw subtle grid
  drawGrid();

  // Draw obstacles
  drawObstacles();

  // Draw food (monkey)
  drawFood();

  // Draw snake
  drawSnake();
}

// Draw Grid
function drawGrid() {
  const ctx = CONFIG.ctx;
  ctx.strokeStyle = CONFIG.colors.grid;
  ctx.lineWidth = 0.5;

  // Vertical lines
  for (let i = 0; i <= CONFIG.tileCountX; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CONFIG.gridSize, 0);
    ctx.lineTo(i * CONFIG.gridSize, CONFIG.canvas.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let i = 0; i <= CONFIG.tileCountY; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * CONFIG.gridSize);
    ctx.lineTo(CONFIG.canvas.width, i * CONFIG.gridSize);
    ctx.stroke();
  }
}

// Draw Realistic Snake
function drawSnake() {
  const ctx = CONFIG.ctx;

  gameState.snake.forEach((segment, index) => {
    const x = segment.x * CONFIG.gridSize;
    const y = segment.y * CONFIG.gridSize;

    // DEBUG: Draw a red box behind every snake segment to confirm coordinates
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(x, y, CONFIG.gridSize, CONFIG.gridSize);

    if (index === 0) {
      // Draw realistic snake head
      drawSnakeHead(x, y);
    } else if (index === gameState.snake.length - 1) {
      // Draw tail
      drawSnakeTail(x, y, index);
    } else {
      // Draw realistic snake body
      drawSnakeBody(x, y, index);
    }
  });
}

// Draw Photorealistic Snake Head
function drawSnakeHead(x, y) {
  const ctx = CONFIG.ctx;
  const size = CONFIG.gridSize;
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.save();

  // If image is loaded, use it
  if (images.snakeHead && images.snakeHead.complete) {
    ctx.translate(centerX, centerY);

    // Rotate based on direction
    let angle = 0;
    if (gameState.direction.x === 1) angle = 0;
    else if (gameState.direction.x === -1) angle = Math.PI;
    else if (gameState.direction.y === 1) angle = Math.PI / 2;
    else if (gameState.direction.y === -1) angle = -Math.PI / 2;

    ctx.rotate(angle);
    // Draw larger to account for transparent padding and overlap
    const drawSize = size * 1.8;
    ctx.drawImage(images.snakeHead, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();
    return;
  }

  // Fallback to canvas-drawn head
  // Main head shape with 3D gradient
  const headGradient = ctx.createRadialGradient(
    centerX - size / 6,
    centerY - size / 6,
    0,
    centerX,
    centerY,
    size / 2
  );
  headGradient.addColorStop(0, "#6b9d3a");
  headGradient.addColorStop(0.3, "#4a7c2c");
  headGradient.addColorStop(0.7, "#2d5016");
  headGradient.addColorStop(1, "#1a2f0f");

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2 - 1, 0, Math.PI * 2);
  ctx.fill();

  // Detailed scale pattern
  ctx.save();
  ctx.globalAlpha = 0.4;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const scaleX = x + 3 + col * 4;
      const scaleY = y + 3 + row * 4;
      const scaleSize = 3;

      const scaleGrad = ctx.createRadialGradient(
        scaleX, scaleY, 0,
        scaleX, scaleY, scaleSize
      );
      scaleGrad.addColorStop(0, "#8bc34a");
      scaleGrad.addColorStop(1, "transparent");

      ctx.fillStyle = scaleGrad;
      ctx.beginPath();
      ctx.arc(scaleX, scaleY, scaleSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Realistic eyes with 3D effect
  const eyeOffsetX = 5;
  const eyeOffsetY = 4;

  // Draw both eyes
  [-1, 1].forEach(side => {
    const eyeX = centerX + side * eyeOffsetX;
    const eyeY = centerY - eyeOffsetY;

    // Eye socket shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY + 1, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye white/base
    const eyeGrad = ctx.createRadialGradient(
      eyeX, eyeY, 0,
      eyeX, eyeY, 3
    );
    eyeGrad.addColorStop(0, "#ffd700");
    eyeGrad.addColorStop(0.6, "#ffb300");
    eyeGrad.addColorStop(1, "#ff8f00");

    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Vertical pupil (reptilian)
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 0.8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight (realistic reflection)
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(eyeX - 1, eyeY - 1, 1, 0, Math.PI * 2);
    ctx.fill();

    // Subtle outer eye ring
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Nostril details
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.beginPath();
  ctx.arc(centerX - 2, centerY + 3, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX + 2, centerY + 3, 1, 0, Math.PI * 2);
  ctx.fill();

  // Top highlight for 3D effect
  const highlightGrad = ctx.createRadialGradient(
    centerX - 3, centerY - 3, 0,
    centerX - 3, centerY - 3, size / 3
  );
  highlightGrad.addColorStop(0, "rgba(139, 195, 74, 0.6)");
  highlightGrad.addColorStop(1, "transparent");

  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.arc(centerX - 3, centerY - 3, size / 3, 0, Math.PI * 2);
  ctx.fill();

  // Bottom shadow for depth
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + size / 3, size / 3, size / 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw Photorealistic Snake Body
function drawSnakeBody(x, y, index) {
  const ctx = CONFIG.ctx;
  const size = CONFIG.gridSize;
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.save();

  // If image is loaded, use it
  if (images.snakeBodyStraight && images.snakeBodyCorner) {
    const prev = gameState.snake[index - 1];
    const next = gameState.snake[index + 1];
    const curr = gameState.snake[index];

    const dx1 = prev.x - curr.x;
    const dy1 = prev.y - curr.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    let angle = 0;
    let isCorner = true;

    // Straight line
    if (dx1 === -dx2 && dy1 === -dy2) {
      isCorner = false;
      if (dx1 !== 0) { // Horizontal
        angle = 0;
      } else { // Vertical
        angle = Math.PI / 2;
      }
    } else {
      // Corner logic assuming corner image is drawn Right to Bottom
      if ((dx1 === 1 && dy2 === 1) || (dx2 === 1 && dy1 === 1)) angle = 0;
      else if ((dx1 === -1 && dy2 === 1) || (dx2 === -1 && dy1 === 1)) angle = Math.PI / 2;
      else if ((dx1 === -1 && dy2 === -1) || (dx2 === -1 && dy1 === -1)) angle = Math.PI;
      else if ((dx1 === 1 && dy2 === -1) || (dx2 === 1 && dy1 === -1)) angle = -Math.PI / 2;
    }

    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    const drawSize = size * 1.8;
    if (isCorner) {
      ctx.drawImage(images.snakeBodyCorner, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    } else {
      ctx.drawImage(images.snakeBodyStraight, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    }

    ctx.restore();
    return;
  }

  // Fallback to canvas-drawn body
  // Body gradient with 3D lighting
  const bodyGradient = ctx.createRadialGradient(
    centerX - size / 4,
    centerY - size / 4,
    0,
    centerX,
    centerY,
    size / 2
  );
  bodyGradient.addColorStop(0, "#7cb342");
  bodyGradient.addColorStop(0.4, "#6b9d3a");
  bodyGradient.addColorStop(0.7, "#4a7c2c");
  bodyGradient.addColorStop(1, "#2d5016");

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // Hexagonal scale pattern
  ctx.globalAlpha = 0.35;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const scaleX = x + 4 + col * 5;
      const scaleY = y + 4 + row * 5;

      const scaleGrad = ctx.createRadialGradient(
        scaleX, scaleY, 0,
        scaleX, scaleY, 2.5
      );
      scaleGrad.addColorStop(0, "#9ccc65");
      scaleGrad.addColorStop(0.7, "#7cb342");
      scaleGrad.addColorStop(1, "transparent");

      ctx.fillStyle = scaleGrad;
      ctx.beginPath();
      ctx.arc(scaleX, scaleY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Top highlight for volume
  const highlightGrad = ctx.createRadialGradient(
    centerX - 3, centerY - 3, 0,
    centerX - 3, centerY - 3, size / 2.5
  );
  highlightGrad.addColorStop(0, "rgba(139, 195, 74, 0.5)");
  highlightGrad.addColorStop(1, "transparent");

  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.arc(centerX - 3, centerY - 3, size / 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Bottom shadow for depth
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath();
  ctx.ellipse(centerX + 2, centerY + 3, size / 4, size / 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw Photorealistic Snake Tail
function drawSnakeTail(x, y, index) {
  const ctx = CONFIG.ctx;
  const size = CONFIG.gridSize;
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.save();

  // If image is loaded, use it
  if (images.snakeTail && images.snakeTail.complete) {
    const prev = gameState.snake[index - 1]; // Segment right before tail
    const curr = gameState.snake[index]; // Tail

    // Tail points away from the previous segment
    const dx = prev.x - curr.x;
    const dy = prev.y - curr.y;

    let angle = 0;
    // Base image is tail facing left.
    // If dx=1 (prev is right of tail), tail points left, angle=0.
    if (dx === 1) angle = 0;
    else if (dx === -1) angle = Math.PI;
    else if (dy === 1) angle = Math.PI / 2;
    else if (dy === -1) angle = -Math.PI / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.drawImage(images.snakeTail, -size / 2, -size / 2, size, size);
    ctx.restore();
    return;
  }

  // Fallback... draw simple tail
  ctx.fillStyle = CONFIG.colors.snakeBody;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Draw Photorealistic Food (Pill)
function drawFood() {
  const ctx = CONFIG.ctx;
  const x = gameState.food.x * CONFIG.gridSize;
  const y = gameState.food.y * CONFIG.gridSize;
  const size = CONFIG.gridSize;
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.save();

  // Pulse animation
  const time = Date.now() / 200;
  const pulseScale = 1 + Math.sin(time) * 0.08;
  ctx.translate(centerX, centerY);
  ctx.scale(pulseScale, pulseScale);
  ctx.translate(-centerX, -centerY);

  // If image is loaded, use it
  if (images.pill && images.pill.complete) {
    ctx.drawImage(images.pill, x, y, size, size);

    // Glow effect
    ctx.globalAlpha = 0.3 * pulseScale;
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(centerX, centerY, drawSize / 2 + 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // Fallback to canvas-drawn monkey

  // Monkey body with 3D gradient
  const bodyGradient = ctx.createRadialGradient(
    centerX - size / 6,
    centerY - size / 6,
    0,
    centerX,
    centerY,
    size / 2
  );
  bodyGradient.addColorStop(0, "#a0826d");
  bodyGradient.addColorStop(0.4, "#8b6f47");
  bodyGradient.addColorStop(0.7, "#5c4033");
  bodyGradient.addColorStop(1, "#3e2723");

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2 - 1, 0, Math.PI * 2);
  ctx.fill();

  // Fur texture
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const furX = centerX + Math.cos(angle) * (size / 3);
    const furY = centerY + Math.sin(angle) * (size / 3);

    ctx.fillStyle = "#6d4c41";
    ctx.beginPath();
    ctx.arc(furX, furY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Face (lighter brown with gradient)
  const faceGrad = ctx.createRadialGradient(
    centerX, centerY + 1, 0,
    centerX, centerY + 1, size / 3
  );
  faceGrad.addColorStop(0, "#e6c9a8");
  faceGrad.addColorStop(0.7, "#d4a574");
  faceGrad.addColorStop(1, "#c89b5e");

  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY + 2, size / 3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes with highlights
  [-3, 3].forEach(offsetX => {
    // Eye white
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(centerX + offsetX, centerY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(centerX + offsetX, centerY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.arc(centerX + offsetX - 0.5, centerY - 0.5, 0.7, 0, Math.PI * 2);
    ctx.fill();
  });

  // Ears with 3D effect
  [-6, 6].forEach(offsetX => {
    // Ear shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.arc(centerX + offsetX, centerY - 3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Ear
    const earGrad = ctx.createRadialGradient(
      centerX + offsetX - 1, centerY - 4, 0,
      centerX + offsetX, centerY - 4, 3
    );
    earGrad.addColorStop(0, "#a0826d");
    earGrad.addColorStop(1, "#8b6f47");

    ctx.fillStyle = earGrad;
    ctx.beginPath();
    ctx.arc(centerX + offsetX, centerY - 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Inner ear
    ctx.fillStyle = "#d4a574";
    ctx.beginPath();
    ctx.arc(centerX + offsetX, centerY - 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Nose
  ctx.fillStyle = "#3e2723";
  ctx.beginPath();
  ctx.arc(centerX, centerY + 3, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = "#3e2723";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY + 4, 2, 0, Math.PI, false);
  ctx.stroke();

  // Glow effect
  ctx.globalAlpha = 0.3 * pulseScale;
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2 + 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw Obstacles
function drawObstacles() {
  const ctx = CONFIG.ctx;

  gameState.obstacles.forEach((obs, index) => {
    const x = obs.x * CONFIG.gridSize;
    const y = obs.y * CONFIG.gridSize;
    const size = CONFIG.gridSize;

    drawObstacle(x, y, size);
  });
}

// Draw Photorealistic Tree Obstacle
function drawTree(x, y, size) {
  const ctx = CONFIG.ctx;
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.save();

  // If image is loaded, use it
  if (images.tree && images.tree.complete) {
    ctx.drawImage(images.tree, x, y, size, size);

    // Shadow for depth
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(centerX + 2, centerY + 4, size / 3, size / 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // Fallback to canvas-drawn tree

  // Tree trunk with 3D gradient
  const trunkGradient = ctx.createRadialGradient(
    centerX - size / 4,
    centerY - size / 4,
    0,
    centerX,
    centerY,
    size / 2
  );
  trunkGradient.addColorStop(0, "#a0826d");
  trunkGradient.addColorStop(0.3, "#8b6f47");
  trunkGradient.addColorStop(0.6, "#5c4033");
  trunkGradient.addColorStop(1, "#3e2723");

  ctx.fillStyle = trunkGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2 - 1, 0, Math.PI * 2);
  ctx.fill();

  // Detailed bark texture (vertical lines)
  ctx.strokeStyle = "rgba(62, 39, 35, 0.6)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 3 + i * 4, y + 2);
    ctx.lineTo(x + 3 + i * 4, y + size - 2);
    ctx.stroke();
  }

  // Bark cracks (horizontal)
  ctx.strokeStyle = "rgba(30, 20, 15, 0.5)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 4 + i * 5);
    ctx.lineTo(x + size - 2, y + 5 + i * 5);
    ctx.stroke();
  }

  // Moss patches
  const mossPositions = [
    { x: centerX + 3, y: centerY - 3, r: 3 },
    { x: centerX - 2, y: centerY + 2, r: 2.5 },
    { x: centerX + 4, y: centerY + 4, r: 2 }
  ];

  mossPositions.forEach(moss => {
    const mossGrad = ctx.createRadialGradient(
      moss.x, moss.y, 0,
      moss.x, moss.y, moss.r
    );
    mossGrad.addColorStop(0, "rgba(107, 157, 58, 0.6)");
    mossGrad.addColorStop(0.7, "rgba(75, 124, 44, 0.4)");
    mossGrad.addColorStop(1, "transparent");

    ctx.fillStyle = mossGrad;
    ctx.beginPath();
    ctx.arc(moss.x, moss.y, moss.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Highlight for 3D effect
  const highlightGrad = ctx.createRadialGradient(
    centerX - 4, centerY - 4, 0,
    centerX - 4, centerY - 4, size / 3
  );
  highlightGrad.addColorStop(0, "rgba(160, 130, 109, 0.4)");
  highlightGrad.addColorStop(1, "transparent");

  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.arc(centerX - 4, centerY - 4, size / 3, 0, Math.PI * 2);
  ctx.fill();

  // Shadow for depth
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(centerX + 2, centerY + 4, size / 3, size / 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw Photorealistic Obstacle
function drawObstacle(x, y, size) {
  const ctx = CONFIG.ctx;
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.save();

  // If image is loaded, use it
  if (images.obstacle && images.obstacle.complete) {
    ctx.drawImage(images.obstacle, x, y, size, size);

    // Shadow for depth
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(centerX + 3, centerY + 4, size / 3, size / 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // Fallback to canvas-drawn stone

  // Stone with 3D gradient
  const stoneGradient = ctx.createRadialGradient(
    centerX - size / 5,
    centerY - size / 5,
    0,
    centerX,
    centerY,
    size / 2
  );
  stoneGradient.addColorStop(0, "#b0b0b0");
  stoneGradient.addColorStop(0.3, "#9e9e9e");
  stoneGradient.addColorStop(0.6, "#757575");
  stoneGradient.addColorStop(1, "#424242");

  ctx.fillStyle = stoneGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2 - 1, 0, Math.PI * 2);
  ctx.fill();

  // Stone texture (speckles)
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 12; i++) {
    const speckleX = x + 3 + Math.random() * (size - 6);
    const speckleY = y + 3 + Math.random() * (size - 6);
    const speckleSize = 0.5 + Math.random() * 1;

    ctx.fillStyle = Math.random() > 0.5 ? "#616161" : "#e0e0e0";
    ctx.beginPath();
    ctx.arc(speckleX, speckleY, speckleSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Cracks
  ctx.strokeStyle = "rgba(33, 33, 33, 0.7)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 3, y + size / 2 - 2);
  ctx.lineTo(x + size / 2, y + size / 2);
  ctx.lineTo(x + size - 3, y + size / 2 + 3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + size / 2, y + 3);
  ctx.lineTo(x + size / 2 + 2, y + size - 3);
  ctx.stroke();

  // Moss patches on stone
  const mossSpots = [
    { x: centerX - 3, y: centerY + 3, r: 2.5 },
    { x: centerX + 4, y: centerY - 2, r: 2 },
    { x: centerX - 1, y: centerY - 4, r: 1.5 }
  ];

  mossSpots.forEach(moss => {
    const mossGrad = ctx.createRadialGradient(
      moss.x, moss.y, 0,
      moss.x, moss.y, moss.r
    );
    mossGrad.addColorStop(0, "rgba(107, 157, 58, 0.7)");
    mossGrad.addColorStop(0.7, "rgba(75, 124, 44, 0.5)");
    mossGrad.addColorStop(1, "transparent");

    ctx.fillStyle = mossGrad;
    ctx.beginPath();
    ctx.arc(moss.x, moss.y, moss.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Strong highlight for realism
  const highlightGrad = ctx.createRadialGradient(
    centerX - 4, centerY - 4, 0,
    centerX - 4, centerY - 4, size / 2.5
  );
  highlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
  highlightGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
  highlightGrad.addColorStop(1, "transparent");

  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.arc(centerX - 4, centerY - 4, size / 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Shadow for depth
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(centerX + 3, centerY + 4, size / 3, size / 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Spawn Food
function spawnFood() {
  let validPosition = false;

  while (!validPosition) {
    gameState.food.x = Math.floor(Math.random() * CONFIG.tileCountX);
    gameState.food.y = Math.floor(Math.random() * CONFIG.tileCountY);

    // Check if position is valid (not on snake or obstacles)
    const onSnake = gameState.snake.some(
      (segment) =>
        segment.x === gameState.food.x && segment.y === gameState.food.y,
    );
    const onObstacle = gameState.obstacles.some(
      (obs) => obs.x === gameState.food.x && obs.y === gameState.food.y,
    );

    validPosition = !onSnake && !onObstacle;
  }
}

// Spawn Obstacles
function spawnObstacles(count) {
  gameState.obstacles = [];

  for (let i = 0; i < count; i++) {
    let validPosition = false;
    let attempts = 0;

    while (!validPosition && attempts < 100) {
      const x = Math.floor(Math.random() * CONFIG.tileCountX);
      const y = Math.floor(Math.random() * CONFIG.tileCountY);

      // Check if position is valid
      const onSnake = gameState.snake.some(
        (segment) => segment.x === x && segment.y === y,
      );
      const onFood = gameState.food.x === x && gameState.food.y === y;
      const onOtherObstacle = gameState.obstacles.some(
        (obs) => obs.x === x && obs.y === y,
      );

      // Keep obstacles away from snake's starting area
      const nearStart =
        Math.abs(x - gameState.snake[0].x) < 5 &&
        Math.abs(y - gameState.snake[0].y) < 5;

      if (!onSnake && !onFood && !onOtherObstacle && !nearStart) {
        gameState.obstacles.push({
          x: x,
          y: y,
          type: "obstacle",
        });
        validPosition = true;
      }

      attempts++;
    }
  }
}

// Check Level Up
function checkLevelUp() {
  const newLevel = getCurrentLevelNumber();

  if (newLevel > gameState.level) {
    gameState.level = newLevel;
    AudioManager.playLevelUp(); // Play level up sound
    const levelConfig = getCurrentLevel();
    spawnObstacles(levelConfig.obstacles);
    updateUI();
  }
}

// Get Current Level Configuration
function getCurrentLevel() {
  for (let i = CONFIG.levels.length - 1; i >= 0; i--) {
    if (gameState.score >= CONFIG.levels[i].minScore) {
      return CONFIG.levels[i];
    }
  }
  return CONFIG.levels[0];
}

// Get Current Level Number
function getCurrentLevelNumber() {
  for (let i = CONFIG.levels.length - 1; i >= 0; i--) {
    if (gameState.score >= CONFIG.levels[i].minScore) {
      return i + 1;
    }
  }
  return 1;
}

// Handle Keyboard Input
function handleKeyPress(e) {
  if (!gameState.isRunning && e.code === "Space") {
    if (!document.getElementById("startScreen").classList.contains("hidden")) {
      startGame();
    } else if (
      !document.getElementById("gameOverScreen").classList.contains("hidden")
    ) {
      restartGame();
    }
    return;
  }

  if (!gameState.isRunning) return;

  switch (e.code) {
    case "ArrowUp":
      if (gameState.direction.y === 0) {
        gameState.nextDirection = { x: 0, y: -1 };
      }
      e.preventDefault();
      break;
    case "ArrowDown":
      if (gameState.direction.y === 0) {
        gameState.nextDirection = { x: 0, y: 1 };
      }
      e.preventDefault();
      break;
    case "ArrowLeft":
      if (gameState.direction.x === 0) {
        gameState.nextDirection = { x: -1, y: 0 };
      }
      e.preventDefault();
      break;
    case "ArrowRight":
      if (gameState.direction.x === 0) {
        gameState.nextDirection = { x: 1, y: 0 };
      }
      e.preventDefault();
      break;
  }
}

// Update UI
function updateUI() {
  // Format score to 6 digits e.g. "004,850"
  const formatScore = (num) => num.toString().padStart(6, '0').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

  document.getElementById("score").textContent = formatScore(gameState.score);
  document.getElementById("level").textContent = gameState.level;
  document.getElementById("highScore").textContent = formatScore(gameState.highScore);
}

// Game Over
function gameOver() {
  gameState.isRunning = false;
  clearTimeout(gameState.gameLoop);

  AudioManager.playGameOver(); // Play game over sound

  // Update high score
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem("jungleSnakeHighScore", gameState.highScore);
  }

  // Show game over screen
  const formatScore = (num) => num.toString().padStart(6, '0').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  document.getElementById("finalScore").textContent = formatScore(gameState.score);
  document.getElementById("gameOverScreen").classList.remove("hidden");

  updateUI();
}

// Toggle Sound
function toggleSound() {
  const isEnabled = AudioManager.toggle();
  updateSoundButton();
}

// Update Sound Button UI
function updateSoundButton() {
  const button = document.getElementById("soundToggle");
  if (AudioManager.enabled) {
    button.textContent = "🔊";
    button.classList.remove("muted");
    button.title = "Sound On (Click to Mute)";
  } else {
    button.textContent = "🔇";
    button.classList.add("muted");
    button.title = "Sound Off (Click to Unmute)";
  }
}

// Pause Game
function togglePause() {
  if (!gameState.isRunning && !gameState.isPaused) return; // Not playing

  gameState.isPaused = !gameState.isPaused;
  const pauseBtn = document.getElementById("pauseButton");

  if (gameState.isPaused) {
    clearTimeout(gameState.gameLoop);
    pauseBtn.textContent = "▶"; // Play icon
    pauseBtn.style.color = "#d32f2f";
  } else {
    pauseBtn.textContent = "⏸"; // Pause icon
    pauseBtn.style.color = "var(--text-gold)";
    gameLoop(); // Resume
  }
}

// Initialize game when page loads
window.addEventListener("load", init);
