import { GameObject3D } from './GameObject3D'
import { Game } from './scenes/Game'

export class Marker extends GameObject3D {
  constructor(scene: Game) {
    super(
      scene,
      'ball',
      'ball',
      {
        x: -1,
        y: -1,
        z: -1,
      },
      0,
      0,
      1,
    )
    this.gravityEnabled = false
    this.sprite.setScale(2).setDepth(9).setTintFill(0xff00ff).setAlpha(0)
    this.shadow.setScale(2, 1).setDepth(9).setAlpha(0)
  }
}
