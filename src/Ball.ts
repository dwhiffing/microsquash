import { BOUNCE, FRICTION } from './constants'
import { GameObject3D } from './GameObject3D'
import { Game } from './scenes/Game'

export class Ball extends GameObject3D {
  constructor(scene: Game) {
    const k = 'ball'
    super(scene, k, k, { x: 0.5, y: 0.1, z: 0.5 }, BOUNCE, FRICTION, 1)
    this.sprite.setScale(2).setDepth(9)
    this.shadow.setScale(2, 1).setDepth(9)
  }

  impulse = (
    minX = -0.002,
    maxX = 0.002,
    minY = 0.012,
    maxY = 0.012,
    minZ = 0.007,
    maxZ = 0.007,
  ) => {
    this.vel = {
      x: Phaser.Math.RND.realInRange(minX, maxX),
      y: Phaser.Math.RND.realInRange(minY, maxY),
      z: Phaser.Math.RND.realInRange(minZ, maxZ),
    }
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
    this.shadow.setVisible(this.scene.ball.gravityEnabled)
  }
}
