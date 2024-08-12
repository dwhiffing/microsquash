import { BOUNCE, FRICTION } from './constants'
import { GameObject3D } from './GameObject3D'
import { Game } from './scenes/Game'

export class Ball extends GameObject3D {
  constructor(scene: Game) {
    const k = 'ball'
    super(scene, k, k, { x: 0.5, y: 0.1, z: 0.5 }, BOUNCE, FRICTION, 1)
    this.sprite.setScale(2).setDepth(9)
    this.shadow.setScale(2, 1).setDepth(9)
    this.bounceCount = 3
  }

  impulse = (x = 0.005, y = 0.012, z = 0.015) => {
    this.vel = {
      x: Phaser.Math.RND.realInRange(-x, x),
      y: Phaser.Math.RND.realInRange(y, y),
      z: Phaser.Math.RND.realInRange(z, z),
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
    this.bounceCount = 0
    this.shadow.setVisible(this.scene.ball.gravityEnabled)
  }
}
