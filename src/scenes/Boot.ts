import { Scene } from 'phaser'

export class Boot extends Scene {
  constructor() {
    super('Boot')
  }

  init() {
    const bar = this.add.rectangle(0, 0, 64, 64, 0xffffff)
    this.load.on('progress', (progress: number) => {
      bar.width = 64 * progress
    })
  }

  preload() {
    this.load.image('ball', 'assets/ball.png')
    this.load.image('background', 'assets/bg.png')
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 16,
      frameHeight: 16,
    })
    this.load.bitmapFont(
      'pixel-dan',
      'assets/pixel-dan.png',
      'assets/pixel-dan.xml',
    )
  }

  create() {
    this.scene.start('Game')
    // this.scene.start('Menu')
  }
}
