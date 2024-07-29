import { PLAYER_MAX_SPEED, PLAYER_SPEED } from './constants'
import { GameObject3D } from './GameObject3D'
import { Game } from './scenes/Game'

export class Player extends GameObject3D {
  hasBall: boolean

  constructor(scene: Game) {
    super(scene, 'player', 'ball', { x: 0.5, y: 0, z: 0.5 }, 0, 0.93, 6)

    this.sprite.setDepth(10).setTintFill(0xaa0000)
    this.shadow.setScale(6, 1).setDepth(10)
    this.hasBall = false
  }

  move(directions: number[]) {
    const max = PLAYER_MAX_SPEED
    const speed = PLAYER_SPEED / Math.sqrt(directions.length)

    if (directions.includes(0)) {
      this.vel.z = Math.max(-max, this.vel.z - speed)
    } else if (directions.includes(2)) {
      this.vel.z = Math.min(max, this.vel.z + speed)
    }
    if (directions.includes(1)) {
      this.vel.x = Math.max(-max, this.vel.x - speed)
    } else if (directions.includes(3)) {
      this.vel.x = Math.min(max, this.vel.x + speed)
    }
  }

  update(delta: number) {
    if (this.hasBall) {
      this.scene.ball.pos = { ...this.pos, y: this.pos.y + 0.1 }
      this.scene.ball.vel = { ...this.vel, y: this.vel.y }
    }

    super.update(delta)
  }

  togglePickup(value: boolean) {
    this.hasBall = value
    this.scene.ball.togglePickup(value)
    this.sprite.setTintFill(value ? 0xff0000 : 0xaa0000)
    if (this.hasBall) {
      this.scene.ball.vel = { ...this.vel }
      this.scene.ball.pos = { ...this.pos, y: this.pos.y + 0.1 }
    }
  }

  onAction = () => {
    if (this.hasBall) {
      this.togglePickup(false)
      this.hitBall()
    } else if (this.canPickup()) {
      this.togglePickup(true)
      this.scene.updateScore(0)
    } else if (this.canSwing()) {
      this.hitBall()
      this.scene.updateScore(1)
    }
  }

  hitBall() {
    this.scene.ball.impulse()
    this.scene.updatePrediction()
  }

  canSwing() {
    if (this.getBallDistance() > 0.2) return false
    if (this.scene.ball.pos.y > 0.25) return false
    if (this.scene.ball.bounceCount >= 2) return false
    return true
  }

  canPickup = () => {
    if (this.getBallDistance() > 0.15) return false
    if (this.hasBall) return false
    if (this.scene.ball.isDead) return false
    return true
  }

  getBallDistance = () =>
    Math.abs(this.pos.x - this.scene.ball.pos.x) +
    Math.abs(this.pos.z - this.scene.ball.pos.z)
}
