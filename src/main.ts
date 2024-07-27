import { Game as GameScene } from './scenes/Game'
import { Menu as MenuScene } from './scenes/Menu'
import { Boot as BootScene } from './scenes/Boot'
import { Game, Types } from 'phaser'

const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 64,
  height: 64,
  parent: 'game-container',
  backgroundColor: '#028af8',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene],
}

export default new Game(config)
