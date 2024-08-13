import {
  LEFT_BOX,
  PLAYER_MAX_SPEED,
  PLAYER_SPEED,
  RIGHT_BOX,
} from './constants'
import { GameObject3D } from './GameObject3D'
import { Game } from './scenes/Game'

const MIN_CHARGE = 70
const MAX_CHARGE = 150
export class Player extends GameObject3D {
  hasBall: boolean
  autoPlay: boolean
  isGettingBall: boolean
  isResetting: boolean
  hasReset: boolean
  isCharging: boolean
  isServing: boolean
  isSwingReady: boolean
  chargeTimer: number
  palette: string
  targetPosition?: { x: number; z: number }
  sideIndex: number
  onReachTarget?: (value: unknown) => void

  constructor(scene: Game, palette = 'base', sideIndex = 0, autoPlay = false) {
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
    this.autoPlay = autoPlay

    this.isSwingReady = true
    this.chargeTimer = 0
    this.sideIndex = sideIndex
    this.sprite.setDepth(10)

    this.sprite.anims.play(`player-${this.palette}_idle`)
    this.shadow.setScale(5, 1).setDepth(10)
    this.hasBall = false
  }

  update(delta: number) {
    // get ball if its our serve and point is over
    if (
      !this.scene.ball.inPlay &&
      !this.isGettingBall &&
      this.isOurTurn &&
      !this.hasBall &&
      !this.isServing
    ) {
      this.isGettingBall = true
      this.scene.sleep(500).then(this.onGetBall)
    }

    // reset position when other player is getting ball
    if (
      !this.scene.ball.inPlay &&
      !this.isResetting &&
      !this.isOurTurn &&
      !this.hasReset
    ) {
      this.isResetting = true
      this.scene.sleep(500).then(this.onReset)
    }

    // if we are charging, increment charge
    if (this.isCharging && this.chargeTimer < MAX_CHARGE) {
      this.chargeTimer += delta / 7
    }

    // if we have the ball, keep it fixed to our position
    if (this.isServing && !this.hasBall && this.scene.ball.pos.y < 0.05) {
      this.togglePickup(true)
      this.isServing = false
    }

    // if we have the ball, keep it fixed to our position
    if (this.hasBall && !this.isServing) {
      this.scene.ball.pos = {
        ...this.pos,
        x: this.pos.x + 0.02,
        y: this.pos.y + 0.1,
      }
      this.scene.ball.vel = { ...this.vel, y: this.vel.y }
    }

    // if we are a cpu player, play automatically
    if (this.autoPlay) {
      if (this.hasBall && !this.isGettingBall) {
        this.onAction()
        this.scene.sleep(150).then(() => {
          this.startSwing()
          this.onSwing()
          this.scene.sleep(250).then(() => {
            this.onMoveTo({ x: 0.5, z: 0.5 })
          })
        })
      }
      if (this.isOurTurn) {
        if (this.sprite.alpha !== 1) {
          this.scene.tweens.add({
            targets: this.sprite,
            alpha: 1,
            duration: 250,
          })
        }
        if (!this.targetPosition && this.scene.ball.inPlay) {
          const diff =
            Math.abs(this.pos.z - this.scene.marker.pos.z) +
            Math.abs(this.pos.x - this.scene.marker.pos.x)
          if (diff > 0.1) this.onMoveTo(this.scene.marker.pos)
        }
        if (
          !this.isServing &&
          !this.hasBall &&
          this.canSwing() &&
          this.doesSwingHit()
        ) {
          this.onMoveTo({ x: 0.5, z: 0.5 })
          this.startSwing()
          this.chargeTimer = Phaser.Math.RND.between(MIN_CHARGE, MAX_CHARGE)
          this.onSwing()
        }
      }
    }

    // if we have a target position, move us toward that position
    if (this.targetPosition) {
      let directions: number[] = []
      const xdiff = this.pos.x - this.targetPosition.x
      const zdiff = this.pos.z - this.targetPosition.z

      if (Math.abs(xdiff) + Math.abs(zdiff) < 0.1) {
        this.onReachTarget?.(undefined)
        this.onReachTarget = undefined
        this.targetPosition = undefined
        this.scene.sleep(150).then(() => {
          this.sprite.anims.play(`player-${this.palette}_idle`)
        })
      }
      if (Math.abs(xdiff) > 0.05) {
        directions.push(xdiff > 0 ? 1 : 3)
      }
      if (Math.abs(zdiff) > 0.05) {
        directions.push(zdiff > 0 ? 0 : 2)
      }

      this.onMove(directions)
    }

    super.update(delta)
  }

  handleInput(directions: number[]) {
    if (this.targetPosition || this.isGettingBall) return
    this.onMove(directions)
  }

  onMove(directions: number[]) {
    const max = PLAYER_MAX_SPEED
    const speed =
      (PLAYER_SPEED / Math.sqrt(directions.length)) *
      (this.isCharging ? 0.4 : 1)

    if (this.isServing) return

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

    // stay inside serving box
    if (this.hasBall && !this.isGettingBall) {
      const box = this.sideIndex === 0 ? LEFT_BOX : RIGHT_BOX
      this.pos.x = Phaser.Math.Clamp(this.pos.x, box.x[0], box.x[1])
      this.pos.z = Phaser.Math.Clamp(this.pos.z, box.z[0], box.z[1])
    }

    if (directions.length === 0 && !this.targetPosition) {
      if (this.sprite.anims.currentAnim?.key.includes('walk')) {
        this.sprite.anims.play(`player-${this.palette}_idle`)
      }
    } else {
      if (
        !this.isCharging &&
        this.sprite.anims.currentAnim?.key.includes('idle')
      ) {
        this.sprite.anims.play(`player-${this.palette}_walk`)
      }
    }
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
    if (this.isGettingBall || this.isResetting) return
    if (this.hasBall) {
      this.startServe()
    } else if (this.canSwing()) {
      this.startSwing()
    }
  }

  onActionEnd = () => {
    if (this.isCharging && this.canSwing()) {
      this.onSwing()
    }
  }

  startServe() {
    if (this.isServing) return
    this.isServing = true
    this.togglePickup(false)
    this.sprite.anims.play(`player-${this.palette}_idle`)
    this.vel = { x: 0, y: 0, z: 0 }
    this.scene.ball.vel = { x: 0, y: 0.009, z: 0 }
  }

  startSwing() {
    if (this.isCharging) return
    this.sprite.anims.play(`player-${this.palette}_idle`)
    this.chargeTimer = MIN_CHARGE
    this.isCharging = true
  }

  onSwing() {
    this.isCharging = false
    const dist = this.getBallDistance()
    this.sprite.setFlipX(dist.x > 0)
    const isOverhead = this.isServing || dist.y < -0.15
    this.sprite.anims.play(
      isOverhead
        ? `player-${this.palette}_swingover`
        : `player-${this.palette}_swing`,
    )
    this.sprite.anims.chain([`player-${this.palette}_idle`])

    this.isSwingReady = false
    this.scene.time.delayedCall(350, () => {
      this.isSwingReady = true
    })

    if (this.doesSwingHit()) {
      let currentSideIndex = this.scene.playerTurnIndex
      this.scene.playerTurnIndex = this.sideIndex ? 0 : 1

      const chargeRatio = this.chargeTimer / MAX_CHARGE
      const { w, a, s, d, left, right, up, down } = this.scene
      let yBias = 0.004 * chargeRatio
      let xBias = 0.01 * chargeRatio

      const check = getCheckKey(this.scene)

      const inYBias = check([w, up]) ? -yBias : check([s, down]) ? yBias : 0
      const inXBias = check([d, right]) ? xBias : check([a, left]) ? -xBias : 0

      let x = Phaser.Math.RND.realInRange(0.002, 0.005)
      if (this.sideIndex === 1) x *= -1
      let y = 0.012
      let z = 0.015

      if (this.isServing) {
        let serveBias = 0.006
        if (this.sideIndex === 1) serveBias *= -1
        x = serveBias

        z *= 0.25 + this.scene.ball.pos.y / 0.3
      } else {
        x += inXBias
        y += inYBias
        z *= chargeRatio
      }

      if (this.autoPlay) {
        this.scene.tweens.add({
          targets: this.sprite,
          alpha: 0.4,
          duration: 250,
        })
      }

      this.scene.ball.impulse(x, y, z)
      this.scene.ball.isServe = this.isServing
      this.isServing = false
      this.scene.updatePrediction()

      if (currentSideIndex !== this.sideIndex) {
        this.scene.ball.hasFaulted = true
        this.scene.onBallOut()
      }
    }
  }

  onMoveTo = async (pos: { x: number; z: number }) => {
    this.targetPosition = pos
    const promise = new Promise((r) => {
      this.onReachTarget = r
    })
    return promise
  }

  onGetBall = async () => {
    this.isGettingBall = true

    await this.onMoveTo(this.scene.ball.pos)
    this.togglePickup(true)
    await this.scene.sleep(500)

    const box = this.sideIndex === 0 ? LEFT_BOX : RIGHT_BOX
    const x = (box.x[0] + box.x[1]) / 2
    const z = (box.z[0] + box.z[1]) / 2
    await this.onMoveTo({ x, z })
    await this.scene.sleep(500)

    this.isGettingBall = false
  }

  onReset = async () => {
    this.isResetting = true
    this.hasReset = true
    await this.onMoveTo({ x: this.sideIndex === 0 ? 0.35 : 0.65, z: 0.35 })
    this.isResetting = false
  }

  canSwing() {
    if (this.sprite.anims.currentAnim?.key.includes('swing')) return false
    if (!this.isSwingReady) return false
    return true
  }

  doesSwingHit() {
    const dist = this.getBallDistance()
    if (Math.abs(dist.x) + Math.abs(dist.z) > 0.2) return false // too far
    if (this.scene.ball.pos.y > 0.3) return false // too high
    if (!this.scene.ball.inPlay && !this.isServing) return false // ball is out
    if (!this.scene.ball.hitBackWall && !this.isServing) return false // moving away from player

    return true
  }

  get isOurTurn() {
    return this.scene.playerTurnIndex === this.sideIndex
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

const getCheckKey = (scene: Game) => (keys: Phaser.Input.Keyboard.Key[]) =>
  keys.some((k) => k.isDown || Math.abs(k.timeUp - scene.time.now) < 200)
