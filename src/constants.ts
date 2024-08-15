export const S = 64
export const W = 35
export const FRICTION = 0.97
export const BOUNCE = 0.4
export const GRAVITY = 0.0002
export const MIN_VEL = 0.005
export const AVG_DELTA = 8.3
export const TIMESCALE = 1
export const WIN_ROUNDS = 10

export const PLAYER_MAX_SPEED = 0.0045
export const PLAYER_SPEED = 0.0003

export const LEFT_BOX = {
  x: [0, 0.2],
  z: [0.23, 0.5],
}
export const RIGHT_BOX = {
  x: [0.8, 1],
  z: [0.23, 0.5],
}

export const PLAYER_PALETTES = {
  base: [],
  red: [
    // shirt
    { old: { r: 243, g: 206, b: 32 }, new: { r: 229, g: 48, b: 48 } },
    // skin
    { old: { r: 224, g: 105, b: 30 }, new: { r: 234, g: 158, b: 110 } },
    // pants
    { old: { r: 104, g: 66, b: 56 }, new: { r: 123, g: 118, b: 167 } },
    // racket
    { old: { r: 123, g: 118, b: 167 }, new: { r: 118, g: 76, b: 133 } },
  ],
}
