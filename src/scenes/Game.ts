import { Scene } from 'phaser'
import { Player } from '../Player'
import { Ball } from '../Ball'
import { predictBounce } from '../utils'
import { GRAVITY } from '../constants'
import { Marker } from '../Marker'

export class Game extends Scene {
  background: Phaser.GameObjects.Image
  text: Phaser.GameObjects.BitmapText
  ball: Ball
  marker: Marker
  player: Player
  w: Phaser.Input.Keyboard.Key
  a: Phaser.Input.Keyboard.Key
  s: Phaser.Input.Keyboard.Key
  d: Phaser.Input.Keyboard.Key

  constructor() {
    super('Game')
  }

  create() {
    this.background = this.add.image(0, 0, 'background').setOrigin(0)
    this.ball = new Ball(this)
    this.marker = new Marker(this)
    this.player = new Player(this)

    this.text = this.add
      .bitmapText(1, 66, 'pixel-dan', '0')
      .setTintFill(0x000000)
      .setFontSize(5)
      .setOrigin(0, 1)
      .setDepth(999)

    if (this.input.keyboard) {
      this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
      this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
      this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
      this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    }

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.player.hasBall) {
        this.text.text = `0`
        this.player.serve()
        const { x, z } = predictBounce(
          this.ball.pos,
          this.ball.vel,
          this.ball.bounce,
          this.ball.friction,
          GRAVITY,
          2,
        )

        this.marker.pos.y = 0
        this.marker.pos.x = x
        this.marker.pos.z = z
        this.marker.sprite.setAlpha(1)
      } else {
        this.player.pickup()
      }
    })
  }

  onBounce = () => {
    this.text.text = `${+this.text.text + 1}`
  }

  update(_: number, delta: number) {
    if (this.w.isDown) this.player.move(2)
    if (this.a.isDown) this.player.move(1)
    if (this.s.isDown) this.player.move(0)
    if (this.d.isDown) this.player.move(3)

    this.ball.update(delta)
    this.player.update(delta)
    this.marker.update(delta)
  }
}
