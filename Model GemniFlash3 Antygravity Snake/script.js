const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const finalScoreElement = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");

// Game constants
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const initialSnake = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

// Game state
let snake = [...initialSnake];
let food = { x: 15, y: 15 };
let dx = 1;
let dy = 0;
let nextDx = 1;
let nextDy = 0;
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameRunning = false;
let gameSpeed = 100; // ms per frame

// Initialize high score display
highScoreElement.textContent = String(highScore).padStart(3, "0");

function initGame() {
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
  ];
  dx = 1;
  dy = 0;
  nextDx = 1;
  nextDy = 0;
  score = 0;
  gameSpeed = 100;
  updateScore();
  placeFood();
  overlay.classList.add("hidden");
  gameRunning = true;
  gameLoop();
}

function updateScore() {
  scoreElement.textContent = String(score).padStart(3, "0");
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
    highScoreElement.textContent = String(highScore).padStart(3, "0");
  }
}

function placeFood() {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
    // Ensure food doesn't spawn on snake
    const onSnake = snake.some(
      (segment) => segment.x === newFood.x && segment.y === newFood.y,
    );
    if (!onSnake) break;
  }
  food = newFood;
}

function draw() {
  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  snake.forEach((segment, index) => {
    const isHead = index === 0;
    ctx.fillStyle = isHead ? "#00ff88" : "#00cc6e";

    // Add glow to head
    if (isHead) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00ff88";
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();
    const r = 4; // corner radius
    const x = segment.x * gridSize + 1;
    const y = segment.y * gridSize + 1;
    const w = gridSize - 2;
    const h = gridSize - 2;

    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Draw food
  ctx.fillStyle = "#ff2d55";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#ff2d55";
  ctx.beginPath();
  const foodX = food.x * gridSize + gridSize / 2;
  const foodY = food.y * gridSize + gridSize / 2;
  ctx.arc(foodX, foodY, gridSize / 2 - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function move() {
  // Update direction from buffer to prevent 180 turns in one tick
  dx = nextDx;
  dy = nextDy;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Wall collision
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }

  // Self collision
  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    updateScore();
    placeFood();
    // Speed up slightly
    if (gameSpeed > 50) gameSpeed -= 1;
  } else {
    snake.pop();
  }
}

function gameOver() {
  gameRunning = false;
  finalScoreElement.textContent = score;
  overlayTitle.textContent = "GAME OVER";
  overlay.classList.remove("hidden");
}

function gameLoop() {
  if (!gameRunning) return;

  move();
  draw();

  setTimeout(gameLoop, gameSpeed);
}

// Input handling
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (dy !== 1) {
        nextDx = 0;
        nextDy = -1;
      }
      break;
    case "ArrowDown":
      if (dy !== -1) {
        nextDx = 0;
        nextDy = 1;
      }
      break;
    case "ArrowLeft":
      if (dx !== 1) {
        nextDx = -1;
        nextDy = 0;
      }
      break;
    case "ArrowRight":
      if (dx !== -1) {
        nextDx = 1;
        nextDy = 0;
      }
      break;
  }

  // Start game on first key press if not running
  if (!gameRunning && !overlay.classList.contains("hidden")) {
    // Only if it's the first run or overlay is showing
  } else if (!gameRunning && overlay.classList.contains("hidden")) {
    // This case shouldn't really happen with current logic
  }
});

restartBtn.addEventListener("click", initGame);

// Initial start screen
draw();
overlay.classList.remove("hidden");
overlayTitle.textContent = "NEON SNAKE";
overlay.querySelector("p").textContent = "Press the button to start";
restartBtn.textContent = "START GAME";
