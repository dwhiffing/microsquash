import { Scene, GameObjects } from 'phaser'

export class Menu extends Scene {
  background: Phaser.GameObjects.Image
  title: GameObjects.BitmapText
  title2: GameObjects.BitmapText
  title3: GameObjects.BitmapText
  winnerIndex: number

  constructor() {
    super('Menu')
  }

  init(options: { winnerIndex: number }) {
    this.winnerIndex = options.winnerIndex
  }

  create() {
    this.background = this.add.image(0, 0, 'background').setOrigin(0)
    this.add.rectangle(0, 0, 64, 64, 0xffffff).setOrigin(0).setAlpha(0.2)
    this.title = this.add
      .bitmapText(32, 4, 'pixel-dan', 'MICRO\nSQUASH')
      .setTintFill(0x000)
      .setCenterAlign()
      .setLineSpacing(-1)
      .setFontSize(5)
      .setOrigin(0.5, 0)
    this.title2 = this.add
      .bitmapText(32, 39, 'pixel-dan', '')
      .setCenterAlign()
      .setTintFill(0x000)
      .setFontSize(5)
      .setOrigin(0.5)
    this.title3 = this.add
      .bitmapText(33, 66, 'pixel-dan', 'CLICK TO START')
      .setTintFill(0x000)
      .setCenterAlign()
      .setFontSize(5)
      .setOrigin(0.5, 1)
    if (typeof this.winnerIndex === 'number') {
      this.title2.setText(`${this.winnerIndex === 0 ? 'HOME' : 'AWAY'} WINS`)
    }

    this.input.once('pointerdown', () => {
      this.scene.start('Game')
    })
  }
}
