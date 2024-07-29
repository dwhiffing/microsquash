import { GameObject3D } from './GameObject3D'
import { Game } from './scenes/Game'

export class Player extends GameObject3D {
  hasBall: boolean
  constructor(scene: Game) {
    super(
      scene,
      'player',
      'ball',
      {
        x: 0.5,
        y: 0,
        z: 0.5,
      },
      0.1,
      0.7,
      6,
    )
    this.sprite.setOrigin(0.5, 1).setDepth(10)
    this.shadow.setScale(6, 1).setDepth(10)
    this.hasBall = false
    this.sprite.setTintFill(0xaa0000)
  }

  serve() {
    if (!this.hasBall) return
    // this.cameras.main.shake(150, 0.01)
    this.hasBall = false
    this.sprite.setTintFill(0xaa0000)
    this.scene.ball.impulse()
    this.scene.ball.togglePickup()
  }

  canPickup() {
    const dist =
      Math.abs(this.pos.x - this.scene.ball.pos.x) +
      Math.abs(this.pos.z - this.scene.ball.pos.z)

    if (
      this.scene.ball.vel.x > 0.01 ||
      this.scene.ball.vel.z > 0.01 ||
      this.scene.ball.vel.y > 0
    )
      return

    return dist < 0.15
  }
  pickup() {
    if (this.hasBall) return

    if (!this.canPickup()) return
    this.hasBall = true
    this.sprite.setTintFill(0xff0000)
    this.scene.ball.vel = { ...this.vel }
    this.scene.ball.pos = { ...this.pos, y: this.pos.y + 0.1 }
    this.scene.ball.togglePickup()
  }

  move(direction: number) {
    if (direction === 0) {
      this.vel.z = Math.max(-0.005, this.vel.z - 0.001)
    } else if (direction === 2) {
      this.vel.z = Math.min(0.005, this.vel.z + 0.001)
    }
    if (direction === 1) {
      this.vel.x = Math.max(-0.005, this.vel.x - 0.001)
    } else if (direction === 3) {
      this.vel.x = Math.min(0.005, this.vel.x + 0.001)
    }
  }

  update(delta: number) {
    if (this.hasBall) {
      this.scene.ball.pos = { ...this.pos, y: this.pos.y + 0.1 }
      this.scene.ball.vel = { ...this.vel, y: this.vel.y }
    }

    super.update(delta)
  }
}
