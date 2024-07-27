import { Scene } from 'phaser'
import { GameObject3D } from '../GameObject3D'

export class Game extends Scene {
  background: Phaser.GameObjects.Image
  text: Phaser.GameObjects.BitmapText
  ball: GameObject3D

  constructor() {
    super('Game')
  }

  create() {
    this.background = this.add.image(0, 0, 'background').setOrigin(0)
    this.ball = new GameObject3D(this)
    this.text = this.add
      .bitmapText(1, 66, 'pixel-dan', '0')
      .setTintFill(0x000000)
      .setFontSize(5)
      .setOrigin(0, 1)

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.text.text = `0`
      // this.cameras.main.shake(150, 0.01)
      this.ball.impulse()
    })
  }

  onBounce = () => {
    this.text.text = `${+this.text.text + 1}`
  }

  update(_: number, delta: number) {
    this.ball.update(delta)
  }
}
