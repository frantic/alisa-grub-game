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
  score: 0
};

// Hero variables
let hero;
let cursors;
let debugText;

// Preload assets
function preload() {
  // Load any assets here (sprites, sounds, etc.)
  console.log('Preloading assets...');

  // Load the hero sprite
  this.load.image('hero', 'assets/images/sprites/hero.png');
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
  this.add.text(400, 50, 'Grub Game - Use Arrow Keys to Move!', {
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