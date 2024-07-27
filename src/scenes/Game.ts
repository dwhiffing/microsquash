import { Scene } from 'phaser'
const S = 64
const W = 35
const lerp = function (start: number, end: number, t: number) {
  return start * (1 - t) + end * t
}
export class Game extends Scene {
  background: Phaser.GameObjects.Image
  ball: Phaser.GameObjects.Sprite
  ballShadow: Phaser.GameObjects.Sprite
  ballPos: { x: number; y: number; z: number }
  ballVel: { x: number; y: number; z: number }

  constructor() {
    super('Game')
  }

  create() {
    this.background = this.add.image(0, 0, 'background').setOrigin(0)
    this.ball = this.add.sprite(0, 0, 'ball').setScale(2)
    this.ballShadow = this.add.sprite(0, 0, 'ball').setAlpha(0.4).setScale(2, 1)
    this.ballPos = { x: 0.5, y: 0.5, z: 0.5 }
    this.ballVel = { x: 0, y: 0, z: 0 }
    this.ballImpulse()
  }

  ballImpulse = () => {
    this.ballVel = {
      x: Math.random() / 200,
      y: Math.random() / 200,
      z: Math.random() / 200,
    }
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

  update(time: number, delta: number) {
    this.ballPos.x += this.ballVel.x * (delta / 8.3)
    this.ballPos.y += this.ballVel.y * (delta / 8.3)
    this.ballPos.z += this.ballVel.z * (delta / 8.3)

    const coords: ('x' | 'y' | 'z')[] = ['x', 'y', 'z']
    for (let axis of coords) {
      if (this.ballPos[axis] > 1) {
        this.ballPos[axis] = 1
        this.ballVel[axis] *= -1
      }

      if (this.ballPos[axis] < 0) {
        this.ballPos[axis] = 0
        this.ballVel[axis] *= -1
      }
    }

    // if (this.ballPos.y < 1) {
    //   console.log(this.ballVel.y)
    //   this.ballVel.y -= 0.000001
    //   // if (this.ballVel.y < 0) this.ballVel.y = 0
    // }
    this.updateBall()
  }
}
