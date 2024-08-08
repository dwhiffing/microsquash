import {
  LEFT_BOX,
  PLAYER_MAX_SPEED,
  PLAYER_SPEED,
  RIGHT_BOX,
} from './constants'
import { GameObject3D } from './GameObject3D'
import { Game } from './scenes/Game'

export class Player extends GameObject3D {
  hasBall: boolean
  isResetting: boolean
  swingTimer: number
  palette: string
  targetPosition?: { x: number; z: number }
  sideIndex: number
  onReachTarget?: (value: unknown) => void

  constructor(scene: Game, palette = 'base') {
    super(
      scene,
      `player-${palette}`,
      'ball',
      { x: 0.5, y: 0, z: 0.5 },
      0,
      0.93,
      5,
    )
    this.palette = palette

    this.swingTimer = 0
    this.sideIndex = 0
    this.sprite.setDepth(10)

    this.sprite.anims.play(`player-${this.palette}_idle`)
    this.shadow.setScale(5, 1).setDepth(10)
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
      this.sprite.flipX = true
      this.vel.x = Math.max(-max, this.vel.x - speed)
    } else if (directions.includes(3)) {
      this.sprite.flipX = false
      this.vel.x = Math.min(max, this.vel.x + speed)
    }
    if (this.hasBall && !this.isResetting) {
      const box = this.sideIndex === 0 ? LEFT_BOX : RIGHT_BOX
      this.pos.x = Phaser.Math.Clamp(this.pos.x, box.x[0], box.x[1])
      this.pos.z = Phaser.Math.Clamp(this.pos.z, box.z[0], box.z[1])
    }
    if (directions.length === 0 && !this.targetPosition) {
      if (this.sprite.anims.currentAnim?.key.includes('walk')) {
        this.sprite.anims.play(`player-${this.palette}_idle`)
      }
    } else {
      if (this.sprite.anims.currentAnim?.key.includes('idle')) {
        this.sprite.anims.play(`player-${this.palette}_walk`)
      }
    }
  }

  update(delta: number) {
    if (this.hasBall) {
      this.scene.ball.pos = { ...this.pos, y: this.pos.y + 0.1 }
      this.scene.ball.vel = { ...this.vel, y: this.vel.y }
    }

    if (this.swingTimer > 0) {
      this.swingTimer--
    }

    if (this.targetPosition) {
      let directions: number[] = []
      const xdiff = this.pos.x - this.targetPosition.x
      const zdiff = this.pos.z - this.targetPosition.z

      if (Math.abs(xdiff) + Math.abs(zdiff) < 0.1) {
        this.onReachTarget?.(undefined)
        this.onReachTarget = undefined
        this.targetPosition = undefined
      }
      if (Math.abs(xdiff) > 0.05) {
        directions.push(xdiff > 0 ? 1 : 3)
      }
      if (Math.abs(zdiff) > 0.05) {
        directions.push(zdiff > 0 ? 0 : 2)
      }

      this.move(directions)
    }

    super.update(delta)
  }

  togglePickup(value: boolean) {
    this.hasBall = value
    this.scene.ball.togglePickup(value)
    // this.sprite.setTintFill(value ? 0xff0000 : 0xaa0000)
    if (this.hasBall) {
      this.scene.ball.vel = { ...this.vel }
      this.scene.ball.pos = { ...this.pos, y: this.pos.y + 0.1 }
    }
  }

  onAction = () => {
    if (this.hasBall) {
      this.togglePickup(false)
      // TODO: should toss ball upward and lock player movement
      this.onSwing(true)
    } else if (this.canSwing()) {
      this.onSwing()
    }
  }

  onSwing(isServe = false) {
    const dist = this.getBallDistance()
    this.sprite.setFlipX(dist.x > 0)
    const isOverhead = isServe || dist.y < -0.15
    this.sprite.anims.play(
      isOverhead
        ? `player-${this.palette}_swingover`
        : `player-${this.palette}_swing`,
    )
    this.sprite.anims.chain([`player-${this.palette}_idle`])

    this.swingTimer = 50
    if (this.doesSwingHit()) {
      this.scene.updateScore(1)
      this.scene.ball.impulse()
      this.scene.updatePrediction()
    }
  }

  canSwing() {
    if (this.sprite.anims.currentAnim?.key.includes('swing')) return false
    if (this.swingTimer > 0) return false
    return true
  }

  doesSwingHit() {
    const dist = this.getBallDistance()
    if (Math.abs(dist.x) + Math.abs(dist.z) > 0.2) return false
    if (this.scene.ball.pos.y > 0.25) return false
    if (this.scene.ball.bounceCount >= 2) return false
    return true
  }

  canPickup = () => {
    const dist = this.getBallDistance()
    if (Math.abs(dist.x) + Math.abs(dist.z) > 0.15) return false
    if (this.hasBall) return false
    if (this.scene.ball.isDead) return false
    return true
  }

  moveTo = async (pos: { x: number; z: number }) => {
    this.targetPosition = pos
    const promise = new Promise((r) => {
      this.onReachTarget = r
    })
    return promise
  }

  reset = async () => {
    this.isResetting = true
    this.sprite.alpha = 0.7

    await this.moveTo(this.scene.ball.pos)
    this.togglePickup(true)
    this.scene.updateScore(0)
    await this.scene.sleep(500)

    const box = this.sideIndex === 0 ? LEFT_BOX : RIGHT_BOX
    const x = (box.x[0] + box.x[1]) / 2
    const z = (box.z[0] + box.z[1]) / 2
    await this.moveTo({ x, z })
    await this.scene.sleep(500)

    this.sprite.alpha = 1
    this.isResetting = false
  }

  getBallDistance = () => ({
    x: this.pos.x - this.scene.ball.pos.x,
    z: this.pos.z - this.scene.ball.pos.z,
    y: this.pos.y - this.scene.ball.pos.y,
  })
}
