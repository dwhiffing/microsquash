import { Scene } from 'phaser'
import { Player } from '../Player'
import { Ball } from '../Ball'
import { predictBounce } from '../utils'
import { GRAVITY, PLAYER_PALETTES } from '../constants'
import { Marker } from '../Marker'

export class Game extends Scene {
  background: Phaser.GameObjects.Image
  text: Phaser.GameObjects.BitmapText
  ball: Ball
  marker: Marker
  player: Player
  score: number
  w: Phaser.Input.Keyboard.Key
  a: Phaser.Input.Keyboard.Key
  s: Phaser.Input.Keyboard.Key
  d: Phaser.Input.Keyboard.Key
  space: Phaser.Input.Keyboard.Key

  constructor() {
    super('Game')
  }

  create() {
    this.createSprites()

    this.background = this.add.image(0, 0, 'background').setOrigin(0)
    this.ball = new Ball(this)
    this.marker = new Marker(this)
    this.player = new Player(this)
    this.score = 0

    this.text = this.add
      .bitmapText(1, 66, 'pixel-dan', '0')
      .setTintFill(0x000000)
      .setFontSize(5)
      .setOrigin(0, 1)
      .setDepth(999)

    if (this.input.keyboard) {
      this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
      this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
      this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
      this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      this.space = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      )
    }
  }

  update(_: number, delta: number) {
    if (Phaser.Input.Keyboard.JustDown(this.space)) this.player.onAction()

    let directions = []
    if (this.w.isDown) directions.push(2)
    if (this.a.isDown) directions.push(1)
    if (this.s.isDown) directions.push(0)
    if (this.d.isDown) directions.push(3)
    this.player.handleInput(directions)

    this.ball.update(delta)
    this.player.update(delta)
    this.marker.update(delta)
  }

  updateScore = (value: number) => {
    this.ball.bounceCount = 0
    if (value === 0) {
      this.score = 0
    } else {
      this.score += 1
    }
    this.text.text = `${this.score}`
  }

  updatePrediction() {
    const { x, z } = predictBounce(
      this.ball.pos,
      this.ball.vel,
      this.ball.bounce,
      this.ball.friction,
      GRAVITY,
      2,
    )

    this.marker.pos.y = 0
    this.marker.pos.x = x
    this.marker.pos.z = z
  }

  sleep = (d: number) => new Promise((r) => this.time.delayedCall(d, r))

  createSprites = () => {
    const texture = this.textures.get('player-base')
    const { width: frameWidth, height: frameHeight } =
      texture.getFramesFromTextureSource(0)[0]
    Object.entries(PLAYER_PALETTES).forEach(([name, colors]) => {
      const atlasKey = `player-${name}`

      if (name !== 'base') {
        const sheet = texture.getSourceImage() as HTMLCanvasElement
        const canvasTexture = this.textures.createCanvas(
          `${atlasKey}-temp`,
          sheet.width,
          sheet.height,
        )!
        const context = (
          canvasTexture.getSourceImage() as HTMLCanvasElement
        ).getContext('2d')!
        context.drawImage(sheet, 0, 0)

        const imageData = context.getImageData(0, 0, sheet.width, sheet.height)
        for (var p = 0; p < imageData.data.length / 4; p++) {
          var index = 4 * p

          var r = imageData.data[index]
          var g = imageData.data[++index]
          var b = imageData.data[++index]
          var alpha = imageData.data[++index]

          if (alpha !== 255) continue

          for (let color of colors) {
            if (r === color.old.r && g === color.old.g && b === color.old.b) {
              imageData.data[--index] = color.new.b
              imageData.data[--index] = color.new.g
              imageData.data[--index] = color.new.r
            }
          }
        }

        context.putImageData(imageData, 0, 0)

        this.textures.addSpriteSheet(
          atlasKey,
          canvasTexture.getSourceImage() as HTMLImageElement,
          { frameWidth, frameHeight },
        )
        this.textures.get(`${atlasKey}-temp`).destroy()
      }

      this.anims.create({
        key: `${atlasKey}_walk`,
        frames: this.anims.generateFrameNumbers(atlasKey, { start: 2, end: 5 }),
        repeat: -1,
        frameRate: 6,
      })
      this.anims.create({
        key: `${atlasKey}_idle`,
        frames: this.anims.generateFrameNumbers(atlasKey, { start: 0, end: 0 }),
        repeat: -1,
        frameRate: 1,
      })
      this.anims.create({
        key: `${atlasKey}_swing`,
        frames: this.anims.generateFrameNumbers(atlasKey, { start: 7, end: 7 }),
        frameRate: 3,
      })
      this.anims.create({
        key: `${atlasKey}_swingover`,
        frames: this.anims.generateFrameNumbers(atlasKey, { start: 6, end: 6 }),
        frameRate: 3,
      })
    })
  }
}
