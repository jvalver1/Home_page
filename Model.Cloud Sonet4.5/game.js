// Game Configuration
const CONFIG = {
  gridSize: 20,
  tileSize: 20,
  initialSpeed: 150,
  speedIncrease: 5,
  minSpeed: 50,
};

// Game State
const gameState = {
  snake: [],
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  food: { x: 0, y: 0 },
  score: 0,
  highScore: 0,
  isPlaying: false,
  isPaused: false,
  speed: CONFIG.initialSpeed,
  lastRenderTime: 0,
};

// DOM Elements
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("game-overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlaySubtitle = document.getElementById("overlay-subtitle");
const currentScoreEl = document.getElementById("current-score");
const highScoreEl = document.getElementById("high-score");

// Initialize Canvas
function initCanvas() {
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth, container.clientHeight);
  canvas.width = CONFIG.gridSize * CONFIG.tileSize;
  canvas.height = CONFIG.gridSize * CONFIG.tileSize;
}

// Initialize Game
function init() {
  initCanvas();
  loadHighScore();
  resetGame();

  // Event Listeners
  document.addEventListener("keydown", handleKeyPress);
  window.addEventListener("resize", initCanvas);
}

// Load High Score from localStorage
function loadHighScore() {
  const saved = localStorage.getItem("snakeHighScore");
  if (saved) {
    gameState.highScore = parseInt(saved);
    highScoreEl.textContent = gameState.highScore;
  }
}

// Save High Score to localStorage
function saveHighScore() {
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem("snakeHighScore", gameState.highScore);
    highScoreEl.textContent = gameState.highScore;
  }
}

// Reset Game
function resetGame() {
  gameState.snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  gameState.direction = { x: 1, y: 0 };
  gameState.nextDirection = { x: 1, y: 0 };
  gameState.score = 0;
  gameState.speed = CONFIG.initialSpeed;
  gameState.isPlaying = false;
  gameState.isPaused = false;

  updateScore();
  generateFood();
  showOverlay("Press SPACE to Start", "Use arrow keys to control the snake");
}

// Handle Keyboard Input
function handleKeyPress(e) {
  // Prevent default arrow key scrolling
  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
  ) {
    e.preventDefault();
  }

  if (e.key === " ") {
    if (!gameState.isPlaying) {
      resetGame();
      startGame();
    } else if (gameState.isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
    return;
  }

  if (!gameState.isPlaying || gameState.isPaused) return;

  // Arrow key controls
  switch (e.key) {
    case "ArrowUp":
      if (gameState.direction.y === 0) {
        gameState.nextDirection = { x: 0, y: -1 };
      }
      break;
    case "ArrowDown":
      if (gameState.direction.y === 0) {
        gameState.nextDirection = { x: 0, y: 1 };
      }
      break;
    case "ArrowLeft":
      if (gameState.direction.x === 0) {
        gameState.nextDirection = { x: -1, y: 0 };
      }
      break;
    case "ArrowRight":
      if (gameState.direction.x === 0) {
        gameState.nextDirection = { x: 1, y: 0 };
      }
      break;
  }
}

// Start Game
function startGame() {
  gameState.isPlaying = true;
  hideOverlay();
  gameState.lastRenderTime = 0;
  requestAnimationFrame(gameLoop);
}

// Pause Game
function pauseGame() {
  gameState.isPaused = true;
  showOverlay("Paused", "Press SPACE to resume");
}

// Resume Game
function resumeGame() {
  gameState.isPaused = false;
  hideOverlay();
  gameState.lastRenderTime = 0;
  requestAnimationFrame(gameLoop);
}

// Game Loop
function gameLoop(currentTime) {
  if (!gameState.isPlaying || gameState.isPaused) return;

  const timeSinceLastRender = currentTime - gameState.lastRenderTime;

  if (timeSinceLastRender < gameState.speed) {
    requestAnimationFrame(gameLoop);
    return;
  }

  gameState.lastRenderTime = currentTime;

  update();
  render();

  requestAnimationFrame(gameLoop);
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
    head.x >= CONFIG.gridSize ||
    head.y < 0 ||
    head.y >= CONFIG.gridSize
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

  // Add new head
  gameState.snake.unshift(head);

  // Check food collision
  if (head.x === gameState.food.x && head.y === gameState.food.y) {
    gameState.score += 10;
    updateScore();
    generateFood();

    // Increase speed
    if (gameState.speed > CONFIG.minSpeed) {
      gameState.speed = Math.max(
        CONFIG.minSpeed,
        gameState.speed - CONFIG.speedIncrease,
      );
    }
  } else {
    // Remove tail if no food eaten
    gameState.snake.pop();
  }
}

// Render Game
function render() {
  // Clear canvas
  ctx.fillStyle = "#0a0e27";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid (subtle)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= CONFIG.gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CONFIG.tileSize, 0);
    ctx.lineTo(i * CONFIG.tileSize, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * CONFIG.tileSize);
    ctx.lineTo(canvas.width, i * CONFIG.tileSize);
    ctx.stroke();
  }

  // Draw food with glow effect
  const foodX = gameState.food.x * CONFIG.tileSize;
  const foodY = gameState.food.y * CONFIG.tileSize;

  // Glow
  const gradient = ctx.createRadialGradient(
    foodX + CONFIG.tileSize / 2,
    foodY + CONFIG.tileSize / 2,
    0,
    foodX + CONFIG.tileSize / 2,
    foodY + CONFIG.tileSize / 2,
    CONFIG.tileSize,
  );
  gradient.addColorStop(0, "rgba(0, 255, 136, 0.8)");
  gradient.addColorStop(0.5, "rgba(0, 255, 136, 0.3)");
  gradient.addColorStop(1, "rgba(0, 255, 136, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(
    foodX - CONFIG.tileSize / 2,
    foodY - CONFIG.tileSize / 2,
    CONFIG.tileSize * 2,
    CONFIG.tileSize * 2,
  );

  // Food core
  ctx.fillStyle = "#00ff88";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#00ff88";
  ctx.beginPath();
  ctx.arc(
    foodX + CONFIG.tileSize / 2,
    foodY + CONFIG.tileSize / 2,
    CONFIG.tileSize / 3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Draw snake
  gameState.snake.forEach((segment, index) => {
    const x = segment.x * CONFIG.tileSize;
    const y = segment.y * CONFIG.tileSize;

    // Snake gradient
    const snakeGradient = ctx.createLinearGradient(
      x,
      y,
      x + CONFIG.tileSize,
      y + CONFIG.tileSize,
    );

    if (index === 0) {
      // Head - brighter
      snakeGradient.addColorStop(0, "#00f5ff");
      snakeGradient.addColorStop(1, "#00d4e6");
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00f5ff";
    } else {
      // Body - gradient fade
      const opacity = 1 - (index / gameState.snake.length) * 0.3;
      snakeGradient.addColorStop(0, `rgba(0, 245, 255, ${opacity})`);
      snakeGradient.addColorStop(1, `rgba(102, 126, 234, ${opacity})`);
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(0, 245, 255, 0.5)";
    }

    ctx.fillStyle = snakeGradient;
    ctx.fillRect(x + 2, y + 2, CONFIG.tileSize - 4, CONFIG.tileSize - 4);

    ctx.shadowBlur = 0;
  });
}

// Generate Food
function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * CONFIG.gridSize),
      y: Math.floor(Math.random() * CONFIG.gridSize),
    };
  } while (
    gameState.snake.some(
      (segment) => segment.x === newFood.x && segment.y === newFood.y,
    )
  );

  gameState.food = newFood;
}

// Update Score Display
function updateScore() {
  currentScoreEl.textContent = gameState.score;
  currentScoreEl.classList.add("updated");
  setTimeout(() => currentScoreEl.classList.remove("updated"), 300);
}

// Game Over
function gameOver() {
  gameState.isPlaying = false;
  saveHighScore();
  showOverlay(
    "Game Over!",
    `Score: ${gameState.score} - Press SPACE to restart`,
  );
}

// Show Overlay
function showOverlay(title, subtitle) {
  overlayTitle.textContent = title;
  overlaySubtitle.textContent = subtitle;
  overlay.classList.remove("hidden");
}

// Hide Overlay
function hideOverlay() {
  overlay.classList.add("hidden");
}

// Initialize game when page loads
window.addEventListener("load", init);
