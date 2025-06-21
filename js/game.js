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
  }
};

// Initialize the game
const game = new Phaser.Game(config);

// Game variables
let gameState = {
  score: 0
};

// Preload assets
function preload() {
  // Load any assets here (sprites, sounds, etc.)
  console.log('Preloading assets...');
}

// Create game objects
function create() {
  console.log('Creating game scene...');

  // Add text to show the game is working
  this.add.text(400, 300, 'Grub Game\nYellow Screen Active!', {
    fontSize: '32px',
    fill: '#000000',
    align: 'center'
  }).setOrigin(0.5);

  // Add some basic instructions
  this.add.text(400, 400, 'Game initialized successfully!', {
    fontSize: '16px',
    fill: '#000000',
    align: 'center'
  }).setOrigin(0.5);
}

// Update game logic (runs every frame)
function update() {
  // Game loop logic goes here
  // This function runs 60 times per second by default
}

// Export for potential use in other modules
window.gameState = gameState;