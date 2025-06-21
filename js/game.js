// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#228B22', // Green background
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  input: {
    keyboard: true
  }
};

// Initialize the game
const game = new Phaser.Game(config);

// Game variables
let gameState = {
  score: 0,
  coinsCollected: 0,
  totalCoins: 4,
  level: 1
};

// Hero variables
let hero;
let cursors;
let debugText;
let scoreText;
let coins = [];
let walls = [];
let maze = [];

// Maze configuration
const MAZE_WIDTH = 20;
const MAZE_HEIGHT = 15;
const TILE_SIZE = 40;

// Preload assets
function preload() {
  // Load any assets here (sprites, sounds, etc.)

  // Load the hero sprite
  this.load.image('hero', 'assets/images/sprites/hero.png');

  // Load the coin sprite
  this.load.image('coin', 'assets/images/sprites/coin.png');

  // Load maze sprites
  this.load.image('bush1', 'assets/images/sprites/bush1.png');
  this.load.image('bush2', 'assets/images/sprites/bush2.png');
  this.load.image('grass1', 'assets/images/sprites/grass1.png');
  this.load.image('grass2', 'assets/images/sprites/grass2.png');
}

// Create game objects
function create() {
  // Generate the maze
  generateMaze();

  // Create the maze tiles
  createMazeTiles.call(this);

  // Create the hero sprite at a valid starting position
  const startPos = findValidStartPosition();
  hero = this.add.sprite(startPos.x, startPos.y, 'hero');

  // Enable physics on the hero
  this.physics.add.existing(hero);

  // Set hero properties
  hero.setScale(0.0390625); // Scale to make hero ~40x40 pixels (40/1024) to match tile size
  hero.setDepth(5); // Put hero above grass but below bushes
  hero.body.setCollideWorldBounds(true); // Keep hero within game bounds

  // Adjust hero physics body size to be smaller than the sprite
  hero.body.setSize(35, 35); // Slightly smaller than tile size for easier movement
  hero.body.setOffset(-17.5, -17.5); // Center the collision box properly

  // Re-enable wall collisions with better setup
  this.physics.add.collider(hero, walls, function (hero, wall) {
    // Collision detected
  }, null, this); // Hero collides with walls

  // Create coins at random accessible locations
  createCoins.call(this);

  // Set up collision detection
  this.physics.add.overlap(hero, coins, collectCoin, null, this);

  // Set up cursor keys for input
  cursors = this.input.keyboard.createCursorKeys();

  // Enable keyboard input
  this.input.keyboard.enabled = true;

  // Add click to focus functionality
  this.input.on('pointerdown', () => {
    this.input.keyboard.enabled = true;
  });

  // Add text to show the game is working
  this.add.text(400, 30, 'Grub Game - Navigate the Maze & Collect All 4 Coins!', {
    fontSize: '20px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5).setDepth(20); // Put UI above bushes

  // Add some basic instructions
  this.add.text(400, 570, 'Arrow Keys: Move Hero | Click to focus game', {
    fontSize: '14px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5).setDepth(20); // Put UI above bushes

  // Add debug text
  debugText = this.add.text(10, 10, 'Debug: Waiting for input...', {
    fontSize: '14px',
    fill: '#ffffff'
  }).setDepth(20); // Put UI above bushes

  // Add score text in top right corner
  scoreText = this.add.text(750, 10, `Level ${gameState.level} | Score: ${gameState.score} (${gameState.coinsCollected}/${gameState.totalCoins})`, {
    fontSize: '18px',
    fill: '#ffffff',
    align: 'right'
  }).setOrigin(1, 0).setDepth(20); // Put UI above bushes

  // Debug: Visualize the actual maze structure
  visualizeMaze.call(this);

  // Debug: Show collision bodies (commented out due to error)
  // this.physics.world.drawDebug = true;
}

// Generate maze using recursive backtracking
function generateMaze() {
  // Initialize maze with walls
  for (let y = 0; y < MAZE_HEIGHT; y++) {
    maze[y] = [];
    for (let x = 0; x < MAZE_WIDTH; x++) {
      maze[y][x] = 1; // 1 = wall, 0 = path
    }
  }

  // Start from (1,1) and carve paths
  carvePath(1, 1);

  // Ensure start and end areas are accessible
  maze[1][1] = 0; // Start position
  maze[MAZE_HEIGHT - 2][MAZE_WIDTH - 2] = 0; // End position
}

// Recursive backtracking maze generation
function carvePath(x, y) {
  maze[y][x] = 0; // Mark current cell as path

  // Define directions: [dx, dy]
  const directions = [
    [0, -2], // North
    [2, 0],  // East
    [0, 2],  // South
    [-2, 0]  // West
  ];

  // Shuffle directions
  for (let i = directions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [directions[i], directions[j]] = [directions[j], directions[i]];
  }

  // Try each direction
  for (let [dx, dy] of directions) {
    const newX = x + dx;
    const newY = y + dy;

    // Check if new position is within bounds and is a wall
    if (newX > 0 && newX < MAZE_WIDTH - 1 && newY > 0 && newY < MAZE_HEIGHT - 1 && maze[newY][newX] === 1) {
      // Carve path to new cell
      maze[y + dy / 2][x + dx / 2] = 0; // Remove wall between cells
      carvePath(newX, newY);
    }
  }
}

// Create maze tiles from the generated maze
function createMazeTiles() {
  for (let y = 0; y < MAZE_HEIGHT; y++) {
    for (let x = 0; x < MAZE_WIDTH; x++) {
      const worldX = x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = y * TILE_SIZE + TILE_SIZE / 2;

      if (maze[y][x] === 1) {
        // Create wall
        const wallSprite = Math.random() < 0.5 ? 'bush1' : 'bush2';
        const wall = this.add.sprite(worldX, worldY, wallSprite);
        wall.setScale(0.04); // Scale down from 1024x1024 to ~40x40 pixels
        wall.setDepth(10); // Put bushes on top of hero

        // Enable physics on wall with perfectly centered collision box
        this.physics.add.existing(wall, true); // true = static body
        wall.body.setSize(40, 40); // Match tile size exactly
        wall.body.setOffset(-20, -20); // Center the collision box properly
        walls.push(wall);
      } else {
        // Create grass floor
        const grassSprite = Math.random() < 0.5 ? 'grass1' : 'grass2';
        const grass = this.add.sprite(worldX, worldY, grassSprite);
        grass.setScale(0.04); // Scale down from 1024x1024 to ~40x40 pixels
        grass.setDepth(-1); // Put grass behind other sprites
      }
    }
  }
}

// Debug function to visualize the actual maze structure
function visualizeMaze() {
  // Visual overlay on screen (only showing paths, not walls)
  for (let y = 0; y < MAZE_HEIGHT; y++) {
    for (let x = 0; x < MAZE_WIDTH; x++) {
      const worldX = x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = y * TILE_SIZE + TILE_SIZE / 2;

      if (maze[y][x] === 0) {
        // Path - green rectangle (keep this to show walkable areas)
        this.add.rectangle(worldX, worldY, TILE_SIZE - 2, TILE_SIZE - 2, 0x00ff00, 0.2);
      }
      // Removed red rectangles for walls to clean up the visual
    }
  }
}

// Find a valid starting position for the hero
function findValidStartPosition() {
  // Look for an open area with more space around it
  for (let y = 2; y < MAZE_HEIGHT - 2; y++) {
    for (let x = 2; x < MAZE_WIDTH - 2; x++) {
      if (maze[y][x] === 0) {
        // Check if there's enough space around this position
        let hasSpace = true;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (maze[y + dy][x + dx] === 1) {
              hasSpace = false;
              break;
            }
          }
          if (!hasSpace) break;
        }

        if (hasSpace) {
          return {
            x: x * TILE_SIZE + TILE_SIZE / 2,
            y: y * TILE_SIZE + TILE_SIZE / 2
          };
        }
      }
    }
  }

  // Fallback: find any open position
  for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
    for (let x = 1; x < MAZE_WIDTH - 1; x++) {
      if (maze[y][x] === 0) {
        return {
          x: x * TILE_SIZE + TILE_SIZE / 2,
          y: y * TILE_SIZE + TILE_SIZE / 2
        };
      }
    }
  }

  // Last resort: center of screen
  return { x: 400, y: 300 };
}

// Function to create coins at random accessible locations
function createCoins() {
  const coinScale = 0.0390625; // Scale to make coins ~40x40 pixels (40/1024) to match tile size
  const accessiblePositions = [];

  // Find all accessible positions
  for (let y = 0; y < MAZE_HEIGHT; y++) {
    for (let x = 0; x < MAZE_WIDTH; x++) {
      if (maze[y][x] === 0) {
        accessiblePositions.push({
          x: x * TILE_SIZE + TILE_SIZE / 2,
          y: y * TILE_SIZE + TILE_SIZE / 2
        });
      }
    }
  }

  // Shuffle accessible positions
  for (let i = accessiblePositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [accessiblePositions[i], accessiblePositions[j]] = [accessiblePositions[j], accessiblePositions[i]];
  }

  // Create coins at first 4 accessible positions
  for (let i = 0; i < Math.min(gameState.totalCoins, accessiblePositions.length); i++) {
    const pos = accessiblePositions[i];

    // Create coin sprite
    const coin = this.add.sprite(pos.x, pos.y, 'coin');
    coin.setScale(coinScale);
    coin.setDepth(5); // Same depth as hero
    coin.setAlpha(1); // Ensure coins are fully opaque

    // Enable physics on coin
    this.physics.add.existing(coin);

    // Add to coins array
    coins.push(coin);
  }
}

// Function to handle coin collection
function collectCoin(hero, coin) {
  // Create glowing effect before destroying the coin
  this.tweens.add({
    targets: coin,
    scaleX: 1.5,
    scaleY: 1.5,
    alpha: 0,
    duration: 500,
    ease: 'Power2',
    onComplete: () => {
      // Remove the coin from the scene
      coin.destroy();
    }
  });

  // Remove from coins array
  const index = coins.indexOf(coin);
  if (index > -1) {
    coins.splice(index, 1);
  }

  // Update game state
  gameState.coinsCollected++;
  gameState.score += 100;

  // Update score display
  scoreText.setText(`Level ${gameState.level} | Score: ${gameState.score} (${gameState.coinsCollected}/${gameState.totalCoins})`);

  // Check if all coins are collected
  if (gameState.coinsCollected >= gameState.totalCoins) {
    // Start new level
    startNewLevel.call(this);
  }
}

// Function to start a new level
function startNewLevel() {
  // Animate hero jumping for happiness
  this.tweens.add({
    targets: hero,
    y: hero.y - 50,
    duration: 200,
    ease: 'Power2',
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      // After animation, start new level
      generateNewLevel.call(this);
    }
  });
}

// Function to generate a new level
function generateNewLevel() {
  // Clear existing maze and coins
  walls.forEach(wall => wall.destroy());
  walls = [];
  coins.forEach(coin => coin.destroy());
  coins = [];

  // Increase level and coin count
  gameState.level++;
  gameState.totalCoins++;
  gameState.coinsCollected = 0;

  // Generate new maze
  generateMaze();

  // Create new maze tiles
  createMazeTiles.call(this);

  // Set up collision detection for new walls
  this.physics.add.collider(hero, walls, function (hero, wall) {
    // Collision detected
  }, null, this);

  // Reposition hero at new valid starting position
  const startPos = findValidStartPosition();
  hero.setPosition(startPos.x, startPos.y);

  // Create new coins
  createCoins.call(this);

  // Set up collision detection for new coins
  this.physics.add.overlap(hero, coins, collectCoin, null, this);

  // Update score display
  scoreText.setText(`Level ${gameState.level} | Score: ${gameState.score} (${gameState.coinsCollected}/${gameState.totalCoins})`);

  // Show level transition message
  const levelText = this.add.text(400, 250, `Level ${gameState.level}!`, {
    fontSize: '32px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5).setDepth(20);

  // Remove level text after 2 seconds
  this.time.delayedCall(2000, () => {
    levelText.destroy();
  });
}

// Update game logic (runs every frame)
function update() {
  // Hero movement with arrow keys
  const speed = 200; // Movement speed in pixels per second

  // Reset velocity
  hero.body.setVelocity(0);

  let isMoving = false;
  let direction = '';

  // Handle horizontal movement
  if (cursors.left.isDown) {
    hero.body.setVelocityX(-speed);
    isMoving = true;
    direction += 'Left ';
  } else if (cursors.right.isDown) {
    hero.body.setVelocityX(speed);
    isMoving = true;
    direction += 'Right ';
  }

  // Handle vertical movement
  if (cursors.up.isDown) {
    hero.body.setVelocityY(-speed);
    isMoving = true;
    direction += 'Up ';
  } else if (cursors.down.isDown) {
    hero.body.setVelocityY(speed);
    isMoving = true;
    direction += 'Down ';
  }

  // Optional: Normalize diagonal movement
  if (hero.body.velocity.x !== 0 && hero.body.velocity.y !== 0) {
    hero.body.velocity.normalize().scale(speed);
  }

  // Update debug text with more information
  if (isMoving) {
    const gridX = Math.floor(hero.x / TILE_SIZE);
    const gridY = Math.floor(hero.y / TILE_SIZE);
    const isInWall = gridX >= 0 && gridX < MAZE_WIDTH && gridY >= 0 && gridY < MAZE_HEIGHT ? maze[gridY][gridX] === 1 : false;
    debugText.setText(`Debug: Moving ${direction.trim()} - Hero at (${Math.round(hero.x)}, ${Math.round(hero.y)}) - Grid: (${gridX}, ${gridY}) - In Wall: ${isInWall}`);
  } else {
    const gridX = Math.floor(hero.x / TILE_SIZE);
    const gridY = Math.floor(hero.y / TILE_SIZE);
    const isInWall = gridX >= 0 && gridX < MAZE_WIDTH && gridY >= 0 && gridY < MAZE_HEIGHT ? maze[gridY][gridX] === 1 : false;
    debugText.setText(`Debug: Idle - Hero at (${Math.round(hero.x)}, ${Math.round(hero.y)}) - Grid: (${gridX}, ${gridY}) - In Wall: ${isInWall} - No keys pressed`);
  }
}

// Export for potential use in other modules
window.gameState = gameState;