import { S, W, AVG_DELTA, GRAVITY, TIMESCALE } from './constants'
import { Game } from './scenes/Game'
import { doUpdate, IVec3, lerp } from './utils'

export class GameObject3D {
  scene: Game
  sprite: Phaser.GameObjects.Sprite
  shadow: Phaser.GameObjects.Sprite
  pos: IVec3
  vel: IVec3
  bounce: number
  friction: number
  width: number
  bounceCount: number
  gravityEnabled: boolean

  constructor(
    scene: Game,
    spriteKey: string,
    shadowKey: string,
    initialPos: IVec3,
    bounce: number,
    friction: number,
    width: number,
  ) {
    this.scene = scene
    this.shadow = scene.add
      .sprite(0, 0, shadowKey)
      .setAlpha(0.4)
      .setOrigin(0.5, 0)
    this.sprite = scene.add.sprite(0, 0, spriteKey).setOrigin(0.5, 1)
    this.pos = initialPos
    this.vel = { x: 0, y: 0, z: 0 }
    this.bounce = bounce
    this.width = width
    this.friction = friction
    this.bounceCount = 0
    this.gravityEnabled = true
  }

  setPosition = () => {
    const { x, y, z } = this.pos
    const l = lerp(S + 1, S / 2 - this.width, z)
    const _x = (S - l) / 2 + lerp(0, l, x)
    const _z = S - W + (1 - z) * W

    const l2 = lerp(S, S - W - 1, z)
    const _y = _z - y * l2

    this.sprite.setPosition(_x, Math.round(_y))
    this.shadow.setPosition(_x, Math.round(_z))
  }

  update(delta: number) {
    const mult = (delta / AVG_DELTA) * TIMESCALE
    doUpdate(
      this.pos,
      this.vel,
      mult,
      this.bounce,
      this.friction,
      this.gravityEnabled ? GRAVITY : 0,
      () => {
        this.bounceCount++
      },
    )

    if (this.scene.player.hasBall && this.sprite.texture.key === 'ball') {
      this.sprite.setDepth(-1)
    } else {
      this.sprite.setDepth(100 - Math.floor(this.pos.z * 100))
      this.shadow.setDepth(100 - Math.floor(this.pos.z * 100))
    }

    this.setPosition()
  }
}
