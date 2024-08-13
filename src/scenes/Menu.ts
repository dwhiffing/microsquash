import { Scene, GameObjects } from 'phaser'

const BG_ALPHA = 0.2
const TWEEN_DURATION = 600

export class Menu extends Scene {
  bg: GameObjects.Rectangle
  titleText: GameObjects.BitmapText
  winnerText: GameObjects.BitmapText
  optionText: GameObjects.BitmapText
  helpText: GameObjects.BitmapText
  arrow: GameObjects.Graphics
  winnerIndex: number
  optionIndex: number
  helpIndex: number
  isActive: boolean
  isDifficultySelect: boolean
  isHelp: boolean

  constructor() {
    super('Menu')
  }

  create() {
    this.isActive = true
    this.isHelp = false
    this.isDifficultySelect = false
    this.optionIndex = 1
    this.winnerIndex = -1
    this.helpIndex = 0
    this.bg = this.add
      .rectangle(0, 0, 64, 64, 0xffffff)
      .setOrigin(0)
      .setAlpha(BG_ALPHA)
    this.titleText = this.add
      .bitmapText(32, 4, 'pixel-dan', 'MICRO\nSQUASH')
      .setTintFill(0x000)
      .setCenterAlign()
      .setLineSpacing(-1)
      .setFontSize(5)
      .setOrigin(0.5, 0)
    this.winnerText = this.add
      .bitmapText(32, 39, 'pixel-dan', '')
      .setCenterAlign()
      .setTintFill(0x000)
      .setFontSize(5)
      .setOrigin(0.5)
    this.optionText = this.add
      .bitmapText(33, 65, 'pixel-dan', 'PLAY\nHELP')
      .setTintFill(0x000)
      .setCenterAlign()
      .setFontSize(5)
      .setOrigin(0.5, 1)
    this.helpText = this.add
      .bitmapText(32, 34, 'pixel-dan', TEXTS[0])
      .setTintFill(0x000)
      .setCenterAlign()
      .setOrigin(0.5)
      .setFontSize(5)
      .setAlpha(0)

    this.arrow = this.add.graphics()
    this.setOption()

    this.scene.launch('Game')
    this.scene.bringToTop('Menu')

    this.events.on('gameOver', this.onGameOver)

    this.input.keyboard?.on('keydown-W', this.up)
    this.input.keyboard?.on('keydown-A', this.left)
    this.input.keyboard?.on('keydown-S', this.down)
    this.input.keyboard?.on('keydown-D', this.right)
    this.input.keyboard?.on('keydown-UP', this.up)
    this.input.keyboard?.on('keydown-DOWN', this.down)
    this.input.keyboard?.on('keydown-LEFT', this.left)
    this.input.keyboard?.on('keydown-RIGHT', this.right)
    this.input.keyboard?.on('keydown-SPACE', this.confirm)
  }

  onGameOver = (args: { winnerIndex: number }) => {
    this.isActive = true

    this.winnerIndex = args.winnerIndex
    if (typeof this.winnerIndex === 'number') {
      this.winnerText.setText(
        `${this.winnerIndex === 0 ? 'PLAYER' : 'CPU'} WINS`,
      )
    }
    this.fade(1, BG_ALPHA * 2)
  }

  setOption = () => {
    this.arrow.clear()
    const maxOptions = this.isDifficultySelect ? 3 : 2
    if (this.optionIndex < 0) this.optionIndex = maxOptions - 1
    if (this.optionIndex > maxOptions - 1) this.optionIndex = 0
    const x = 20
    const h = maxOptions === 2 ? 50 : 42
    const h2 = 8
    this.arrow
      .fillStyle(0x000000)
      .fillRect(x, h + h2 * this.optionIndex, 2, 3)
      .fillRect(x + 2, h + 1 + h2 * this.optionIndex, 1, 1)
  }

  confirm = () => {
    if (!this.isActive) return
    if (this.isDifficultySelect) {
      this.startGame()
    } else {
      if (this.optionIndex === 0) {
        this.showDifficulties()
      } else {
        this.toggleHelp()
      }
    }
  }

  toggleHelp = () => {
    if (!this.isHelp) {
      this.helpIndex = 0
      this.isHelp = true
    } else {
      this.helpIndex++
    }
    this.helpText.setText(TEXTS[this.helpIndex])
    if (this.helpIndex >= TEXTS.length) {
      this.isHelp = !this.isHelp
    }

    this.tweens.add({
      targets: this.helpText,
      alpha: this.isHelp ? 1 : 0,
      duration: TWEEN_DURATION,
    })
    this.fade(this.isHelp ? 0 : 1, this.isHelp ? BG_ALPHA * 2.5 : BG_ALPHA)
  }

  showDifficulties = () => {
    this.isDifficultySelect = true
    this.optionText.setText(`EASY\nFAIR\nHARD`)
    this.setOption()
  }

  startGame = () => {
    this.isActive = false
    this.isDifficultySelect = false

    this.fade(0).then(() => {
      this.optionText.setText('PLAY\nHELP')
      this.scene
        .get('Game')
        .events.emit('startGame', { skillLevel: this.optionIndex })
    })
  }

  fade = async (alpha = 0, bgAlpha?: number) => {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: [this.bg],
        alpha: typeof bgAlpha === 'number' ? bgAlpha : alpha,
        duration: TWEEN_DURATION,
        onComplete: resolve,
      })
      this.tweens.add({
        targets: [this.arrow, this.titleText, this.winnerText, this.optionText],
        alpha,
        duration: TWEEN_DURATION,
        onComplete: resolve,
      })
    })
  }

  up = () => {
    if (!this.isActive) return
    this.optionIndex--
    this.setOption()
  }
  down = () => {
    if (!this.isActive) return
    this.optionIndex++
    this.setOption()
  }
  left = () => {
    if (!this.isActive) return
    console.log('left')
  }
  right = () => {
    if (!this.isActive) return
    console.log('right')
  }
}

const TEXTS = [
  `BEAT THE CPU
AT SQUASH`,
  `MOVE WITH ARROWS
OR WASD`,
  `SPACE TO SERVE
OR SWING`,
  //   `M

  // TOGGLE MUTE
  // `,
  `CREATED BY

DANIEL
WHIFFING`,
]
