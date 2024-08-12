import { BOUNCE, FRICTION } from './constants'
import { GameObject3D } from './GameObject3D'
import { Game } from './scenes/Game'

export class Ball extends GameObject3D {
  hasFaulted = false
  hitBackWall = false
  inPlay = false
  constructor(scene: Game) {
    const k = 'ball'
    super(scene, k, k, { x: 0.5, y: 0.1, z: 0.5 }, BOUNCE, FRICTION, 1)
    this.sprite.setScale(2).setDepth(9)
    this.shadow.setScale(2, 1).setDepth(9)
    this.bounceCount = 3
    this.hitBackWall = false
    this.hasFaulted = false
    this.inPlay = false
  }

  impulse = (x = 0.005, y = 0.012, z = 0.015) => {
    this.hitBackWall = false
    this.hasFaulted = false
    this.inPlay = true
    this.bounceCount = 0
    this.vel = { x, y, z }
  }

  get isDead() {
    return (
      Math.abs(this.scene.ball.vel.x) > 0.00001 ||
      Math.abs(this.scene.ball.vel.z) > 0.00001 ||
      Math.abs(this.scene.ball.vel.y) > 0.00001
    )
  }

  togglePickup = (value: boolean) => {
    this.scene.ball.gravityEnabled = !value
    this.bounceCount = 0
    this.shadow.setVisible(this.scene.ball.gravityEnabled)
  }

  update(delta: number) {
    super.update(delta)
  }

  onBounce(axis: string, isGround: boolean) {
    // this.pos.y >= 0.42 for serve
    if (!isGround && this.pos.z === 1) {
      this.hitBackWall = true
      // hit outside red lines
      this.hasFaulted = this.pos.y <= 0.15 && this.pos.y > 0.92
    }

    // hit ceiling
    if (!isGround && this.pos.y === 1) {
      this.hasFaulted = true
    }

    if (this.hasFaulted) {
      this.scene.onBallOut()
    }

    if (axis === 'y' && isGround) {
      this.bounceCount++
      if (this.bounceCount === 2) {
        this.scene.onBallOut()
      }
    }
  }
}
