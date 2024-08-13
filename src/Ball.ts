import { BOUNCE, FRICTION } from './constants'
import { GameObject3D } from './GameObject3D'
import { Game } from './scenes/Game'

const bounceEmitterConfig = {
  lifespan: 2000,
  tint: 0x000000,
  tintFill: true,
  emitting: false,
  alpha: { start: 0.35, end: 0 },
}

export class Ball extends GameObject3D {
  hasFaulted = false
  hitBackWall = false
  inPlay = false
  isServe = false
  trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter
  bounceEmitterZ: Phaser.GameObjects.Particles.ParticleEmitter
  bounceEmitterX: Phaser.GameObjects.Particles.ParticleEmitter
  bounceEmitterY: Phaser.GameObjects.Particles.ParticleEmitter

  constructor(scene: Game) {
    const k = 'ball'
    super(scene, k, k, { x: 0.5, y: 0.1, z: 0.5 }, BOUNCE, FRICTION, 1)
    this.sprite.setScale(2).setDepth(9)
    this.shadow.setScale(2, 1).setDepth(9)
    this.bounceCount = 3
    this.hitBackWall = false
    this.hasFaulted = false
    this.inPlay = false
    this.trailEmitter = this.scene.add
      .particles(0, 0, 'ball', {
        tintFill: true,
        alpha: { start: 0.5, end: 0 },
        scale: 2,
      })
      .startFollow(this.sprite, -1, -2)

    this.bounceEmitterZ = this.scene.add
      .particles(0, 0, 'ball', {
        ...bounceEmitterConfig,
        scale: 2,
      })
      .setDepth(0)
    this.bounceEmitterY = this.scene.add
      .particles(0, 0, 'ball', {
        ...bounceEmitterConfig,
        scaleX: 2,
        scaleY: 1,
      })
      .setDepth(0)
    this.bounceEmitterX = this.scene.add
      .particles(0, 0, 'ball', {
        ...bounceEmitterConfig,
        scaleX: 1,
        scaleY: 2,
      })
      .setDepth(0)
  }

  impulse = (x = 0.005, y = 0.012, z = 0.015) => {
    this.hitBackWall = false
    this.hasFaulted = false
    this.inPlay = true
    this.bounceCount = 0
    this.vel = { x, y, z }
    this.trailEmitter.particleTint =
      this.scene.playerTurnIndex === 0 ? 0xe53030 : 0xedcf4c
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
    if (Math.abs(this.vel.z) > 0.001 && this.inPlay) {
      this.trailEmitter.lifespan = Math.abs(this.vel.z) * 20000
      this.trailEmitter.start()
    } else {
      this.trailEmitter.stop()
    }

    super.update(delta)
  }

  onBounce(axis: string, isGround: boolean) {
    if (!this.gravityEnabled) return

    if (axis === 'z') {
      this.bounceEmitterZ.emitParticleAt(this.sprite.x - 1, this.sprite.y - 2)
    }

    if (axis === 'x') {
      const offset = this.pos.x > 0.5 ? 1 : -1
      this.bounceEmitterX.emitParticleAt(
        this.sprite.x + offset,
        this.sprite.y - 1,
      )
    }

    if (axis === 'y' && this.bounceCount < 2) {
      this.bounceEmitterY.emitParticleAt(this.sprite.x, this.sprite.y - 1)
    }

    if (!isGround && this.pos.z === 1) {
      this.hitBackWall = true
      // hit outside red lines
      const yThres = this.isServe ? 0.42 : 0.15
      this.hasFaulted = this.pos.y <= yThres || this.pos.y > 0.92
    }

    // hit ceiling
    if (!isGround && this.pos.y === 1) {
      this.hasFaulted = true
    }

    if (axis === 'y' && isGround) {
      this.bounceCount++
      if (this.isServe && !this.hasFaulted) {
        const isXValid =
          this.scene.playerTurnIndex === 0 ? this.pos.x < 0.5 : this.pos.x > 0.5
        this.hasFaulted = this.pos.z > 0.55 || !isXValid
      }
      if (this.bounceCount === 2) {
        this.scene.onBallOut()
      }
    }

    if (this.hasFaulted) {
      this.scene.onBallOut()
    }
  }
}
