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
    this.load.audio('select', 'assets/select.mp3')
    this.load.audio('confirm', 'assets/confirm.mp3')
    this.load.audio('confirm2', 'assets/confirm2.mp3')
    this.load.audio('bounce1', 'assets/bounce1.mp3')
    this.load.audio('serve', 'assets/serve.mp3')
    this.load.audio('swing-hit', 'assets/swing-hit.mp3')
    this.load.audio('swing-miss', 'assets/swing-miss.mp3')
    this.load.audio('point-loss', 'assets/point-loss.mp3')
    this.load.audio('point-win', 'assets/point-win.mp3')
    this.load.image('ball', 'assets/ball.png')
    this.load.image('background', 'assets/bg.png')
    this.load.spritesheet('player-base', 'assets/player.png', {
      frameWidth: 15,
      frameHeight: 16,
    })
    this.load.bitmapFont(
      'pixel-dan',
      'assets/pixel-dan.png',
      'assets/pixel-dan.xml',
    )
  }

  create() {
    this.scene.start('Menu')
  }
}
