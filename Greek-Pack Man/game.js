// Game Configuration
const CONFIG = {
  TILE_SIZE: 20,
  COLS: 33,
  ROWS: 36,
  FPS: 60,
  PLAYER_SPEED: 2,
  MONSTER_SPEED: 1.8,
  FRIGHTENED_SPEED: 1,
  POWER_DURATION: 8000,
  SCATTER_DURATION: 7000,
  CHASE_DURATION: 20000,
  POINTS: {
    PELLET: 10,
    POWER_PELLET: 50,
    MONSTER: 200,
  },
};

// Game State
const gameState = {
  score: 0,
  highScore: localStorage.getItem("greekPacManHighScore") || 0,
  level: 1,
  lives: 3,
  gameRunning: false,
  gamePaused: false,
  powerMode: false,
  powerTimer: 0,
  monstersEaten: 0,
  pelletsRemaining: 0,
};

// Canvas Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Maze Layout (1 = wall, 0 = path, 2 = pellet, 3 = power pellet)
const createMaze = () => {
  const maze = [];
  const rows = CONFIG.ROWS;
  const cols = CONFIG.COLS;

  // Create classic Pac-Man style maze
  for (let y = 0; y < rows; y++) {
    maze[y] = [];
    for (let x = 0; x < cols; x++) {
      // Border walls
      if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
        maze[y][x] = 1;
      }
      // Create labyrinth pattern
      else if ((y % 4 === 0 && x % 6 !== 0) || (x % 8 === 0 && y % 6 !== 0)) {
        maze[y][x] = 1;
      }
      // Monster house in center with exit tunnel at top
      else if (y >= 15 && y <= 19 && x >= 14 && x <= 18) {
        if (y === 15 && x === 16) {
          maze[y][x] = 0; // Exit tunnel
        } else if ((y === 15 || y === 19) && x !== 16) {
          maze[y][x] = 1; // Top and bottom walls (except exit)
        } else if ((x === 14 || x === 18) && y > 15) {
          maze[y][x] = 1; // Side walls (not blocking exit)
        } else {
          maze[y][x] = 0; // Empty space for monsters
        }
      }
      // Power pellets in corners
      else if (
        (y === 3 && x === 3) ||
        (y === 3 && x === cols - 4) ||
        (y === rows - 4 && x === 3) ||
        (y === rows - 4 && x === cols - 4)
      ) {
        maze[y][x] = 3;
      }
      // Regular pellets
      else {
        maze[y][x] = 2;
      }
    }
  }

  return maze;
};

let maze = createMaze();

// Player (Hermes)
const player = {
  x: 16,
  y: 27,
  direction: { x: 0, y: 0 },
  nextDirection: { x: 0, y: 0 },
  mouthOpen: 0,
  mouthSpeed: 0.15,
};

// Monsters
const monsters = [
  {
    name: "Medusa",
    color: "#DC2626",
    x: 15,
    y: 17,
    startX: 15,
    startY: 17,
    direction: { x: 0, y: -1 },
    mode: "scatter",
    targetX: 30,
    targetY: 3,
  },
  {
    name: "Minotaur",
    color: "#EC4899",
    x: 16,
    y: 17,
    startX: 16,
    startY: 17,
    direction: { x: 0, y: -1 },
    mode: "scatter",
    targetX: 3,
    targetY: 3,
  },
  {
    name: "Harpy",
    color: "#06B6D4",
    x: 17,
    y: 17,
    startX: 17,
    startY: 17,
    direction: { x: 0, y: -1 },
    mode: "scatter",
    targetX: 30,
    targetY: 33,
  },
  {
    name: "Cyclops",
    color: "#F97316",
    x: 16,
    y: 18,
    startX: 16,
    startY: 18,
    direction: { x: 0, y: -1 },
    mode: "scatter",
    targetX: 3,
    targetY: 42,
  },
];

// Audio Management
const audioManager = {
  muted: false,
  sounds: {},

  init() {
    // Create simple beep sounds using Web Audio API
    this.audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
  },

  playBeep(frequency, duration) {
    if (this.muted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration,
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  },

  collectPellet() {
    this.playBeep(800, 0.1);
  },

  collectPowerPellet() {
    this.playBeep(400, 0.2);
    setTimeout(() => this.playBeep(600, 0.2), 100);
  },

  eatMonster() {
    this.playBeep(1200, 0.15);
    setTimeout(() => this.playBeep(1400, 0.15), 80);
  },

  death() {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => this.playBeep(800 - i * 80, 0.1), i * 50);
    }
  },

  levelComplete() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playBeep(400 + i * 100, 0.15), i * 100);
    }
  },

  toggle() {
    this.muted = !this.muted;
  },
};

// Initialize audio
audioManager.init();

// Count pellets
const countPellets = () => {
  let count = 0;
  for (let y = 0; y < CONFIG.ROWS; y++) {
    for (let x = 0; x < CONFIG.COLS; x++) {
      if (maze[y][x] === 2 || maze[y][x] === 3) count++;
    }
  }
  return count;
};

gameState.pelletsRemaining = countPellets();

// Input Handling
const keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === " ") {
    e.preventDefault();
    if (gameState.gameRunning) {
      togglePause();
    }
  }

  if (e.key === "m" || e.key === "M") {
    audioManager.toggle();
  }

  // Arrow keys
  if (gameState.gameRunning && !gameState.gamePaused) {
    if (e.key === "ArrowUp") player.nextDirection = { x: 0, y: -1 };
    if (e.key === "ArrowDown") player.nextDirection = { x: 0, y: 1 };
    if (e.key === "ArrowLeft") player.nextDirection = { x: -1, y: 0 };
    if (e.key === "ArrowRight") player.nextDirection = { x: 1, y: 0 };
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Helper Functions
const isWall = (x, y) => {
  const gridX = Math.round(x);
  const gridY = Math.round(y);
  if (gridY < 0 || gridY >= CONFIG.ROWS || gridX < 0 || gridX >= CONFIG.COLS)
    return true;
  return maze[gridY][gridX] === 1;
};

const canMove = (x, y, dir) => {
  const newX = x + dir.x * 0.5;
  const newY = y + dir.y * 0.5;
  return !isWall(newX, newY);
};

const getDistance = (x1, y1, x2, y2) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

// Update Player
const updatePlayer = () => {
  // Try to change direction
  if (canMove(player.x, player.y, player.nextDirection)) {
    player.direction = { ...player.nextDirection };
  }

  // Move in current direction
  if (canMove(player.x, player.y, player.direction)) {
    player.x += (player.direction.x * CONFIG.PLAYER_SPEED) / CONFIG.TILE_SIZE;
    player.y += (player.direction.y * CONFIG.PLAYER_SPEED) / CONFIG.TILE_SIZE;
  }

  // Wrap around edges
  if (player.x < 0) player.x = CONFIG.COLS - 1;
  if (player.x >= CONFIG.COLS) player.x = 0;

  // Animate mouth
  player.mouthOpen += player.mouthSpeed;
  if (player.mouthOpen > 1 || player.mouthOpen < 0) {
    player.mouthSpeed *= -1;
  }

  // Check pellet collection
  const gridX = Math.round(player.x);
  const gridY = Math.round(player.y);

  if (maze[gridY] && maze[gridY][gridX] === 2) {
    maze[gridY][gridX] = 0;
    gameState.score += CONFIG.POINTS.PELLET;
    gameState.pelletsRemaining--;
    audioManager.collectPellet();
  } else if (maze[gridY] && maze[gridY][gridX] === 3) {
    maze[gridY][gridX] = 0;
    gameState.score += CONFIG.POINTS.POWER_PELLET;
    gameState.pelletsRemaining--;
    activatePowerMode();
    audioManager.collectPowerPellet();
  }

  // Check level complete
  if (gameState.pelletsRemaining === 0) {
    levelComplete();
  }
};

// Update Monsters
const updateMonsters = () => {
  monsters.forEach((monster) => {
    // Determine target based on mode
    let targetX, targetY;

    if (gameState.powerMode) {
      // Run away from player
      targetX = monster.x + (monster.x - player.x) * 2;
      targetY = monster.y + (monster.y - player.y) * 2;
    } else if (monster.mode === "chase") {
      // Chase player (with personality)
      if (monster.name === "Medusa") {
        // Direct chase
        targetX = player.x;
        targetY = player.y;
      } else if (monster.name === "Minotaur") {
        // Ambush - target ahead of player
        targetX = player.x + player.direction.x * 4;
        targetY = player.y + player.direction.y * 4;
      } else if (monster.name === "Harpy") {
        // Patrol - target player's general area
        targetX = player.x + (Math.random() - 0.5) * 10;
        targetY = player.y + (Math.random() - 0.5) * 10;
      } else {
        // Cyclops - random wandering
        targetX = Math.random() * CONFIG.COLS;
        targetY = Math.random() * CONFIG.ROWS;
      }
    } else {
      // Scatter to corners
      targetX = monster.targetX;
      targetY = monster.targetY;
    }

    // Find best direction
    const possibleDirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];

    let bestDir = monster.direction;
    let bestDist = Infinity;

    possibleDirs.forEach((dir) => {
      // Don't reverse direction
      if (dir.x === -monster.direction.x && dir.y === -monster.direction.y)
        return;

      if (canMove(monster.x, monster.y, dir)) {
        const newX = monster.x + dir.x;
        const newY = monster.y + dir.y;
        const dist = getDistance(newX, newY, targetX, targetY);

        if (dist < bestDist) {
          bestDist = dist;
          bestDir = dir;
        }
      }
    });

    monster.direction = bestDir;

    // Move monster
    const speed = gameState.powerMode
      ? CONFIG.FRIGHTENED_SPEED
      : CONFIG.MONSTER_SPEED;
    monster.x += (monster.direction.x * speed) / CONFIG.TILE_SIZE;
    monster.y += (monster.direction.y * speed) / CONFIG.TILE_SIZE;

    // Wrap around edges
    if (monster.x < 0) monster.x = CONFIG.COLS - 1;
    if (monster.x >= CONFIG.COLS) monster.x = 0;

    // Check collision with player
    if (getDistance(player.x, player.y, monster.x, monster.y) < 0.8) {
      if (gameState.powerMode) {
        // Eat monster
        gameState.score +=
          CONFIG.POINTS.MONSTER * (gameState.monstersEaten + 1);
        gameState.monstersEaten++;
        audioManager.eatMonster();
        resetMonster(monster);
      } else {
        // Player dies
        loseLife();
      }
    }
  });
};

// Power Mode
const activatePowerMode = () => {
  gameState.powerMode = true;
  gameState.monstersEaten = 0;
  gameState.powerTimer = CONFIG.POWER_DURATION;
};

// Reset Monster
const resetMonster = (monster) => {
  monster.x = monster.startX;
  monster.y = monster.startY;
  monster.direction = { x: 0, y: -1 };
};

// Lose Life
const loseLife = () => {
  gameState.lives--;
  audioManager.death();

  if (gameState.lives <= 0) {
    gameOver();
  } else {
    resetPositions();
  }
};

// Reset Positions
const resetPositions = () => {
  player.x = 16;
  player.y = 27;
  player.direction = { x: 0, y: 0 };
  player.nextDirection = { x: 0, y: 0 };

  monsters.forEach(resetMonster);

  gameState.powerMode = false;
};

// Level Complete
const levelComplete = () => {
  gameState.level++;
  audioManager.levelComplete();
  maze = createMaze();
  gameState.pelletsRemaining = countPellets();
  resetPositions();

  // Increase difficulty
  CONFIG.MONSTER_SPEED += 0.1;
};

// Game Over
const gameOver = () => {
  gameState.gameRunning = false;

  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem("greekPacManHighScore", gameState.highScore);
  }

  document.getElementById("finalScore").textContent = gameState.score;
  document.getElementById("gameOverMessage").textContent =
    gameState.score > 1000
      ? "The gods are pleased!"
      : "The labyrinth claims another soul...";
  document.getElementById("gameOverScreen").classList.remove("hidden");
};

// Toggle Pause
const togglePause = () => {
  gameState.gamePaused = !gameState.gamePaused;
  document.getElementById("pauseScreen").classList.toggle("hidden");
};

// Drawing Functions
const drawMaze = () => {
  for (let y = 0; y < CONFIG.ROWS; y++) {
    for (let x = 0; x < CONFIG.COLS; x++) {
      const tile = maze[y][x];
      const px = x * CONFIG.TILE_SIZE;
      const py = y * CONFIG.TILE_SIZE;

      if (tile === 1) {
        // Wall - Greek stone pattern
        ctx.fillStyle = "#78716C";
        ctx.fillRect(px, py, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        ctx.strokeStyle = "#57534E";
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
      } else if (tile === 2) {
        // Pellet - Gold coin
        ctx.fillStyle = "#FBBF24";
        ctx.beginPath();
        ctx.arc(
          px + CONFIG.TILE_SIZE / 2,
          py + CONFIG.TILE_SIZE / 2,
          2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else if (tile === 3) {
        // Power Pellet - Ambrosia
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(252, 211, 77, ${pulse})`;
        ctx.beginPath();
        ctx.arc(
          px + CONFIG.TILE_SIZE / 2,
          py + CONFIG.TILE_SIZE / 2,
          6,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.strokeStyle = "#FCD34D";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
};

const drawPlayer = () => {
  const px = player.x * CONFIG.TILE_SIZE;
  const py = player.y * CONFIG.TILE_SIZE;

  // Hermes - Golden circle with wings
  ctx.fillStyle = "#D4AF37";
  ctx.beginPath();

  // Determine mouth angle based on direction
  let startAngle = 0.2 * Math.PI;
  let endAngle = 1.8 * Math.PI;

  if (player.direction.x > 0) {
    startAngle = 0.2 * Math.PI;
    endAngle = 1.8 * Math.PI;
  } else if (player.direction.x < 0) {
    startAngle = 1.2 * Math.PI;
    endAngle = 0.8 * Math.PI;
  } else if (player.direction.y > 0) {
    startAngle = 0.7 * Math.PI;
    endAngle = 0.3 * Math.PI;
  } else if (player.direction.y < 0) {
    startAngle = 1.7 * Math.PI;
    endAngle = 1.3 * Math.PI;
  }

  // Animate mouth
  const mouthSize = player.mouthOpen * 0.3;
  ctx.arc(
    px + CONFIG.TILE_SIZE / 2,
    py + CONFIG.TILE_SIZE / 2,
    CONFIG.TILE_SIZE / 2 - 2,
    startAngle + mouthSize,
    endAngle - mouthSize,
  );
  ctx.lineTo(px + CONFIG.TILE_SIZE / 2, py + CONFIG.TILE_SIZE / 2);
  ctx.fill();

  // Add glow
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#D4AF37";
  ctx.fill();
  ctx.shadowBlur = 0;

  // Wing symbol
  ctx.fillStyle = "#FFF";
  ctx.font = "12px Arial";
  ctx.fillText(
    "⚡",
    px + CONFIG.TILE_SIZE / 2 - 5,
    py + CONFIG.TILE_SIZE / 2 + 4,
  );
};

const drawMonsters = () => {
  monsters.forEach((monster) => {
    const px = monster.x * CONFIG.TILE_SIZE;
    const py = monster.y * CONFIG.TILE_SIZE;

    if (gameState.powerMode) {
      // Frightened - blue and flashing
      const flash = Math.floor(Date.now() / 200) % 2;
      ctx.fillStyle = flash ? "#1E40AF" : "#3B82F6";
    } else {
      ctx.fillStyle = monster.color;
    }

    // Body
    ctx.beginPath();
    ctx.arc(
      px + CONFIG.TILE_SIZE / 2,
      py + CONFIG.TILE_SIZE / 2,
      CONFIG.TILE_SIZE / 2 - 2,
      Math.PI,
      0,
    );
    ctx.lineTo(px + CONFIG.TILE_SIZE - 2, py + CONFIG.TILE_SIZE);
    ctx.lineTo(px + CONFIG.TILE_SIZE - 5, py + CONFIG.TILE_SIZE - 4);
    ctx.lineTo(px + CONFIG.TILE_SIZE / 2 + 2, py + CONFIG.TILE_SIZE);
    ctx.lineTo(px + CONFIG.TILE_SIZE / 2 - 2, py + CONFIG.TILE_SIZE - 4);
    ctx.lineTo(px + 5, py + CONFIG.TILE_SIZE);
    ctx.lineTo(px + 2, py + CONFIG.TILE_SIZE - 4);
    ctx.closePath();
    ctx.fill();

    // Eyes
    if (!gameState.powerMode) {
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(px + 7, py + 8, 3, 0, Math.PI * 2);
      ctx.arc(px + 13, py + 8, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(px + 7, py + 8, 1.5, 0, Math.PI * 2);
      ctx.arc(px + 13, py + 8, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};

// Update UI
const updateUI = () => {
  document.getElementById("score").textContent = gameState.score;
  document.getElementById("highScore").textContent = gameState.highScore;
  document.getElementById("level").textContent = gameState.level;

  const livesContainer = document.getElementById("lives");
  livesContainer.innerHTML = "";
  for (let i = 0; i < gameState.lives; i++) {
    const lifeIcon = document.createElement("div");
    lifeIcon.className = "life-icon";
    livesContainer.appendChild(lifeIcon);
  }
};

// Game Loop
let lastTime = 0;
const gameLoop = (timestamp) => {
  if (!gameState.gameRunning || gameState.gamePaused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // Update power mode timer
  if (gameState.powerMode) {
    gameState.powerTimer -= deltaTime;
    if (gameState.powerTimer <= 0) {
      gameState.powerMode = false;
    }
  }

  // Update game objects
  updatePlayer();
  updateMonsters();

  // Clear canvas
  ctx.fillStyle = "#0A0E1A";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw everything
  drawMaze();
  drawPlayer();
  drawMonsters();

  // Update UI
  updateUI();

  requestAnimationFrame(gameLoop);
};

// Start Game
const startGame = () => {
  gameState.score = 0;
  gameState.level = 1;
  gameState.lives = 3;
  gameState.gameRunning = true;
  gameState.gamePaused = false;
  gameState.powerMode = false;

  maze = createMaze();
  gameState.pelletsRemaining = countPellets();
  resetPositions();

  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("gameOverScreen").classList.add("hidden");

  updateUI();
  requestAnimationFrame(gameLoop);
};

// Event Listeners
document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("restartButton").addEventListener("click", startGame);

// Initialize
updateUI();
