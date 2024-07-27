import { Scene } from 'phaser'
const S = 64
const W = 35
const FRICTION = 0.97
const BOUNCE = 0.65
const GRAVITY = 0.0002
const MIN_VEL = 0.005
const AVG_DELTA = 8.3
const lerp = function (start: number, end: number, t: number) {
  return start * (1 - t) + end * t
}
export class Game extends Scene {
  background: Phaser.GameObjects.Image
  ball: Phaser.GameObjects.Sprite
  ballShadow: Phaser.GameObjects.Sprite
  text: Phaser.GameObjects.BitmapText
  ballPos: { x: number; y: number; z: number }
  ballVel: { x: number; y: number; z: number }

  constructor() {
    super('Game')
  }

  create() {
    this.background = this.add.image(0, 0, 'background').setOrigin(0)
    this.ball = this.add.sprite(0, 0, 'ball').setScale(2)
    this.text = this.add
      .bitmapText(1, 66, 'pixel-dan', '0')
      .setTintFill(0x000000)
      .setFontSize(5)
      .setOrigin(0, 1)
    this.ballShadow = this.add.sprite(0, 0, 'ball').setAlpha(0.4).setScale(2, 1)
    this.ballPos = { x: 0.5, y: 0.5, z: 0.5 }
    this.ballVel = { x: 0, y: 0, z: 0 }

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.ballImpulse()
    })
  }

  ballImpulse = () => {
    this.text.text = `0`
    // this.cameras.main.shake(150, 0.01)
    this.ballVel = {
      x: Phaser.Math.RND.realInRange(-0.02, 0.02),
      y: Phaser.Math.RND.realInRange(0.005, 0.02),
      z: Phaser.Math.RND.realInRange(0.01, 0.02),
    }
  }

  onBounce = () => {
    this.text.text = `${+this.text.text + 1}`
  }

  updateBall = () => {
    const { x, y, z } = this.ballPos
    const l = lerp(S + 1, S / 2, z)
    const _x = (S - l) / 2 + lerp(0, l, x)
    const _z = S - W + (1 - z) * W

    const l2 = lerp(S, S - W - 1, z)
    const _y = _z - y * l2

    this.ball.setPosition(_x, _y)
    this.ballShadow.setPosition(_x, _z)
  }

  update(_: number, delta: number) {
    const mult = delta / AVG_DELTA
    this.ballPos.x += this.ballVel.x * mult
    this.ballPos.y += this.ballVel.y * mult
    this.ballPos.z += this.ballVel.z * mult

    const coords: ('x' | 'y' | 'z')[] = ['x', 'y', 'z']
    for (let axis of coords) {
      const bounce = axis === 'y' ? -BOUNCE : -BOUNCE

      const handleBounce = (isGround = false) => {
        if (axis === 'y' && isGround) {
          this.onBounce()
        }
        if (Math.abs(this.ballVel[axis]) < MIN_VEL) {
          this.ballVel[axis] *= 0
        } else {
          this.ballVel[axis] *= bounce
        }
      }

      if (this.ballPos[axis] > 1) {
        this.ballPos[axis] = 1
        handleBounce(false)
      }

      if (this.ballPos[axis] < 0) {
        this.ballPos[axis] = 0
        handleBounce(true)
      }

      if (axis !== 'y' && this.ballPos.y === 0 && this.ballVel.y === 0) {
        this.ballVel[axis] *= FRICTION
      }
    }

    if (this.ballPos.y > 0) {
      this.ballVel.y -= GRAVITY
    }
    this.updateBall()
  }
}
