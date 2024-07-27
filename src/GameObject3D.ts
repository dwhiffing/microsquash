import {
  S,
  W,
  AVG_DELTA,
  BOUNCE,
  MIN_VEL,
  FRICTION,
  GRAVITY,
} from './constants'
import { Game } from './scenes/Game'

const lerp = function (start: number, end: number, t: number) {
  return start * (1 - t) + end * t
}

export class GameObject3D {
  scene: Game
  sprite: Phaser.GameObjects.Sprite
  shadow: Phaser.GameObjects.Sprite
  pos: { x: number; y: number; z: number }
  vel: { x: number; y: number; z: number }

  constructor(scene: Game) {
    this.scene = scene
    this.sprite = scene.add.sprite(0, 0, 'ball').setScale(2)
    this.shadow = scene.add.sprite(0, 0, 'ball').setAlpha(0.4).setScale(2, 1)
    this.pos = { x: 0.5, y: 0.5, z: 0.5 }
    this.vel = { x: 0, y: 0, z: 0 }
  }

  impulse = () => {
    this.vel = {
      x: Phaser.Math.RND.realInRange(-0.02, 0.02),
      y: Phaser.Math.RND.realInRange(0.005, 0.02),
      z: Phaser.Math.RND.realInRange(0.01, 0.02),
    }
  }

  setPosition = () => {
    const { x, y, z } = this.pos
    const l = lerp(S + 1, S / 2, z)
    const _x = (S - l) / 2 + lerp(0, l, x)
    const _z = S - W + (1 - z) * W

    const l2 = lerp(S, S - W - 1, z)
    const _y = _z - y * l2

    this.sprite.setPosition(_x, _y)
    this.shadow.setPosition(_x, _z)
  }

  update(delta: number) {
    const mult = delta / AVG_DELTA
    this.pos.x += this.vel.x * mult
    this.pos.y += this.vel.y * mult
    this.pos.z += this.vel.z * mult

    const coords: ('x' | 'y' | 'z')[] = ['x', 'y', 'z']
    for (let axis of coords) {
      const bounce = axis === 'y' ? -BOUNCE : -BOUNCE

      const handleBounce = (isGround = false) => {
        if (axis === 'y' && isGround) {
          this.scene.onBounce()
        }
        if (Math.abs(this.vel[axis]) < MIN_VEL) {
          this.vel[axis] *= 0
        } else {
          this.vel[axis] *= bounce
        }
      }

      if (this.pos[axis] > 1) {
        this.pos[axis] = 1
        handleBounce(false)
      }

      if (this.pos[axis] < 0) {
        this.pos[axis] = 0
        handleBounce(true)
      }

      if (axis !== 'y' && this.pos.y === 0 && this.vel.y === 0) {
        this.vel[axis] *= FRICTION
      }
    }

    if (this.pos.y > 0) {
      this.vel.y -= GRAVITY
    }
    this.setPosition()
  }
}
