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
  score: number
  w: Phaser.Input.Keyboard.Key
  a: Phaser.Input.Keyboard.Key
  s: Phaser.Input.Keyboard.Key
  d: Phaser.Input.Keyboard.Key
  space: Phaser.Input.Keyboard.Key

  constructor() {
    super('Game')
  }

  create() {
    this.background = this.add.image(0, 0, 'background').setOrigin(0)
    this.ball = new Ball(this)
    this.marker = new Marker(this)
    this.player = new Player(this)
    this.score = 0

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
      this.space = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      )
    }
  }

  updateScore = (value: number) => {
    this.ball.bounceCount = 0
    if (value === 0) {
      this.score = 0
    } else {
      this.score += 1
    }
    this.text.text = `${this.score}`
  }

  updatePrediction() {
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
  }

  update(_: number, delta: number) {
    let directions = []
    if (this.w.isDown) directions.push(2)
    if (this.a.isDown) directions.push(1)
    if (this.s.isDown) directions.push(0)
    if (this.d.isDown) directions.push(3)
    if (Phaser.Input.Keyboard.JustDown(this.space)) this.player.onAction()
    this.player.move(directions)

    this.ball.update(delta)
    this.player.update(delta)
    this.marker.update(delta)
  }
}
