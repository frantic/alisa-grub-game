# Game Assets

This folder contains all the assets for the game. Organize your assets in the following subfolders:

## Folder Structure

```
assets/
├── images/          # Sprites, backgrounds, UI elements
│   ├── sprites/     # Character sprites, enemies, items
│   ├── backgrounds/ # Background images
│   └── ui/          # UI elements, buttons, icons
├── audio/           # Sound effects and music
│   ├── sfx/         # Sound effects
│   └── music/       # Background music
├── data/            # JSON files, level data, configuration
└── fonts/           # Custom fonts (if needed)
```

## Supported File Formats

### Images

- **PNG** - Best for sprites with transparency
- **JPG/JPEG** - Good for backgrounds and photos
- **WebP** - Modern format with good compression
- **GIF** - For simple animations

### Audio

- **MP3** - Good compression, widely supported
- **OGG** - Open format, good for web
- **WAV** - Uncompressed, good for short sound effects

### Data

- **JSON** - Level data, game configuration
- **CSV** - Spreadsheet data
- **XML** - Alternative to JSON

## Loading Assets in Phaser

Assets are loaded in the `preload()` function in `js/game.js`:

```javascript
function preload() {
  // Load images
  this.load.image("player", "assets/images/sprites/player.png");
  this.load.image("background", "assets/images/backgrounds/level1.jpg");

  // Load spritesheets
  this.load.spritesheet(
    "player-animation",
    "assets/images/sprites/player-sheet.png",
    {
      frameWidth: 32,
      frameHeight: 32,
    }
  );

  // Load audio
  this.load.audio("jump", "assets/audio/sfx/jump.mp3");
  this.load.audio("background-music", "assets/audio/music/level1.mp3");

  // Load data
  this.load.json("level-data", "assets/data/level1.json");
}
```

## Best Practices

1. **Use descriptive names** for your asset keys
2. **Keep file sizes small** - compress images and audio
3. **Use consistent naming conventions**
4. **Organize by type** - don't mix different asset types in the same folder
5. **Version control** - consider using Git LFS for large assets
