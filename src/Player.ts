import { PLAYER_MAX_SPEED, PLAYER_SPEED } from './constants'
import { GameObject3D } from './GameObject3D'
import { Game } from './scenes/Game'

export class Player extends GameObject3D {
  hasBall: boolean
  swingTimer: number

  constructor(scene: Game) {
    super(scene, 'player', 'ball', { x: 0.5, y: 0, z: 0.5 }, 0, 0.93, 5)

    this.swingTimer = 0
    this.sprite.setDepth(10)
    this.scene.anims.create({
      key: 'player_walk',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 2,
        end: 5,
      }),
      repeat: -1,
      frameRate: 6,
    })
    this.scene.anims.create({
      key: 'player_idle',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 0,
        end: 0,
      }),
      repeat: -1,
      frameRate: 1,
    })
    this.scene.anims.create({
      key: 'player_swing',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 7,
        end: 7,
      }),
      frameRate: 3,
    })
    this.scene.anims.create({
      key: 'player_swingover',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 6,
        end: 6,
      }),
      frameRate: 3,
    })
    this.sprite.anims.play('player_idle')
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
    if (directions.length === 0) {
      if (this.sprite.anims.currentAnim?.key === 'player_walk') {
        this.sprite.anims.play('player_idle')
      }
    } else {
      if (this.sprite.anims.currentAnim?.key === 'player_idle') {
        this.sprite.anims.play('player_walk')
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
      this.onSwing()
    } else if (this.canPickup()) {
      this.togglePickup(true)
      this.scene.updateScore(0)
    } else if (this.canSwing()) {
      this.onSwing()
    }
  }

  onSwing() {
    const dist = this.getBallDistance()
    this.sprite.setFlipX(dist.x > 0)
    const isOverhead = dist.y < -0.15
    this.sprite.anims.play(isOverhead ? 'player_swingover' : 'player_swing')
    this.sprite.anims.chain(['player_idle'])

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

  getBallDistance = () => ({
    x: this.pos.x - this.scene.ball.pos.x,
    z: this.pos.z - this.scene.ball.pos.z,
    y: this.pos.y - this.scene.ball.pos.y,
  })
}
