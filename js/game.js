// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#ffff00', // Yellow background
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
  totalCoins: 4
};

// Hero variables
let hero;
let cursors;
let debugText;
let scoreText;
let coins = [];

// Preload assets
function preload() {
  // Load any assets here (sprites, sounds, etc.)
  console.log('Preloading assets...');

  // Load the hero sprite
  this.load.image('hero', 'assets/images/sprites/hero.png');

  // Load the coin sprite
  this.load.image('coin', 'assets/images/sprites/coin.png');
}

// Create game objects
function create() {
  console.log('Creating game scene...');

  // Create the hero sprite at the center of the screen
  hero = this.add.sprite(400, 300, 'hero');

  // Enable physics on the hero
  this.physics.add.existing(hero);

  // Set hero properties
  hero.setScale(0.09765625); // Scale to make hero ~100x100 pixels (100/1024)
  hero.body.setCollideWorldBounds(true); // Keep hero within game bounds

  // Create coins at random locations
  createCoins.call(this);

  // Set up collision detection between hero and coins
  this.physics.add.overlap(hero, coins, collectCoin, null, this);

  // Set up cursor keys for input
  cursors = this.input.keyboard.createCursorKeys();

  // Enable keyboard input
  this.input.keyboard.enabled = true;

  // Add click to focus functionality
  this.input.on('pointerdown', () => {
    this.input.keyboard.enabled = true;
    console.log('Game focused - keyboard input enabled');
  });

  // Add text to show the game is working
  this.add.text(400, 50, 'Grub Game - Collect All 4 Coins!', {
    fontSize: '24px',
    fill: '#000000',
    align: 'center'
  }).setOrigin(0.5);

  // Add some basic instructions
  this.add.text(400, 550, 'Arrow Keys: Move Hero | Click to focus game', {
    fontSize: '16px',
    fill: '#000000',
    align: 'center'
  }).setOrigin(0.5);

  // Add debug text
  debugText = this.add.text(10, 10, 'Debug: Waiting for input...', {
    fontSize: '14px',
    fill: '#000000'
  });

  // Add score text in top right corner
  scoreText = this.add.text(750, 10, `Score: ${gameState.score} (${gameState.coinsCollected}/${gameState.totalCoins})`, {
    fontSize: '18px',
    fill: '#000000',
    align: 'right'
  }).setOrigin(1, 0);
}

// Function to create coins at random locations
function createCoins() {
  const coinScale = 0.1; // Adjust scale for coins
  const margin = 50; // Keep coins away from edges

  for (let i = 0; i < gameState.totalCoins; i++) {
    // Generate random position within game bounds
    const x = margin + Math.random() * (800 - 2 * margin);
    const y = margin + Math.random() * (600 - 2 * margin);

    // Create coin sprite
    const coin = this.add.sprite(x, y, 'coin');
    coin.setScale(coinScale);

    // Enable physics on coin
    this.physics.add.existing(coin);

    // Add to coins array
    coins.push(coin);

    console.log(`Coin ${i + 1} created at (${Math.round(x)}, ${Math.round(y)})`);
  }
}

// Function to handle coin collection
function collectCoin(hero, coin) {
  // Remove the coin from the scene
  coin.destroy();

  // Remove from coins array
  const index = coins.indexOf(coin);
  if (index > -1) {
    coins.splice(index, 1);
  }

  // Update game state
  gameState.coinsCollected++;
  gameState.score += 100;

  // Update score display
  scoreText.setText(`Score: ${gameState.score} (${gameState.coinsCollected}/${gameState.totalCoins})`);

  console.log(`Coin collected! Score: ${gameState.score}, Coins: ${gameState.coinsCollected}/${gameState.totalCoins}`);

  // Check if all coins are collected
  if (gameState.coinsCollected >= gameState.totalCoins) {
    // Game won!
    this.add.text(400, 250, '🎉 YOU WIN! 🎉\nAll coins collected!', {
      fontSize: '32px',
      fill: '#000000',
      align: 'center'
    }).setOrigin(0.5);

    console.log('Game completed! All coins collected!');
  }
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

  // Update debug text
  if (isMoving) {
    debugText.setText(`Debug: Moving ${direction.trim()} - Hero at (${Math.round(hero.x)}, ${Math.round(hero.y)})`);
  } else {
    debugText.setText(`Debug: Idle - Hero at (${Math.round(hero.x)}, ${Math.round(hero.y)})`);
  }
}

// Export for potential use in other modules
window.gameState = gameState;