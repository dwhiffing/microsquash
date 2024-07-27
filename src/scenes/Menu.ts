import { Scene, GameObjects } from 'phaser'

export class Menu extends Scene {
  title: GameObjects.BitmapText

  constructor() {
    super('Menu')
  }

  create() {
    this.title = this.add
      .bitmapText(32, 32, 'pixel-dan', 'CLICK TO START')
      .setCenterAlign()
      .setFontSize(5)
      .setOrigin(0.5)

    this.input.once('pointerdown', () => {
      this.scene.start('Game')
    })
  }
}
