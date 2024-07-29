import { BOUNCE, FRICTION } from './constants'
import { GameObject3D } from './GameObject3D'
import { Game } from './scenes/Game'

export class Ball extends GameObject3D {
  constructor(scene: Game) {
    super(
      scene,
      'ball',
      'ball',
      {
        x: 0.5,
        y: 0.5,
        z: 0.5,
      },
      BOUNCE,
      FRICTION,
      1,
    )
    this.sprite.setScale(2).setDepth(9)
    this.shadow.setScale(2, 1).setDepth(9)
  }

  impulse = () => {
    this.vel = {
      x: Phaser.Math.RND.realInRange(-0.02, 0.02),
      y: Phaser.Math.RND.realInRange(0.015, 0.015),
      z: Phaser.Math.RND.realInRange(0.008, 0.012),
    }
  }

  togglePickup = () => {
    this.scene.ball.gravityEnabled = !this.scene.ball.gravityEnabled
    this.shadow.setVisible(this.scene.ball.gravityEnabled)
  }
}
