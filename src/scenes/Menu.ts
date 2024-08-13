import { Scene, GameObjects } from 'phaser'

const BG_ALPHA = 0.2

export class Menu extends Scene {
  background: Phaser.GameObjects.Image
  title: GameObjects.BitmapText
  title2: GameObjects.BitmapText
  title3: GameObjects.BitmapText
  winnerIndex: number
  isActive: boolean

  constructor() {
    super('Menu')
  }

  create() {
    this.isActive = true
    const bg = this.add
      .rectangle(0, 0, 64, 64, 0xffffff)
      .setOrigin(0)
      .setAlpha(BG_ALPHA)
    this.title = this.add
      .bitmapText(32, 4, 'pixel-dan', 'MICRO\nSQUASH')
      .setTintFill(0x000)
      .setCenterAlign()
      .setLineSpacing(-1)
      .setFontSize(5)
      .setOrigin(0.5, 0)
    this.title2 = this.add
      .bitmapText(32, 39, 'pixel-dan', '')
      .setCenterAlign()
      .setTintFill(0x000)
      .setFontSize(5)
      .setOrigin(0.5)
    this.title3 = this.add
      .bitmapText(33, 66, 'pixel-dan', 'SPACE TO START')
      .setTintFill(0x000)
      .setCenterAlign()
      .setFontSize(5)
      .setOrigin(0.5, 1)

    this.scene.launch('Game')
    this.scene.bringToTop('Menu')

    this.events.on('gameOver', (args: { winnerIndex: number }) => {
      this.isActive = true

      this.winnerIndex = args.winnerIndex
      if (typeof this.winnerIndex === 'number') {
        this.title2.setText(`${this.winnerIndex === 0 ? 'PLAYER' : 'CPU'} WINS`)
      }

      this.tweens.add({
        targets: [bg],
        alpha: BG_ALPHA * 2,
        duration: 600,
      })
      this.tweens.add({
        targets: [this.title, this.title2, this.title3],
        alpha: 1,
        duration: 600,
      })
    })
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.isActive) return
      this.isActive = false
      this.tweens.add({
        targets: [bg, this.title, this.title2, this.title3],
        alpha: 0,
        duration: 600,
        onComplete: () => {
          this.scene.get('Game').events.emit('startGame')
        },
      })
    })
  }
}
