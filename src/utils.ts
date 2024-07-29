import { MIN_VEL } from './constants'
export type IVec3 = { x: number; y: number; z: number }

export const lerp = function (start: number, end: number, t: number) {
  return start * (1 - t) + end * t
}

export const doUpdate = (
  pos: IVec3,
  vel: IVec3,
  ratio: number,
  bounce: number,
  friction: number,
  gravity: number,
  onBounce: () => void,
) => {
  pos.x += vel.x * ratio
  pos.y += vel.y * ratio
  pos.z += vel.z * ratio

  const coords: ('x' | 'y' | 'z')[] = ['x', 'y', 'z']
  for (let axis of coords) {
    const bounceValue = axis === 'y' ? -bounce : -bounce

    const handleBounce = (isGround = false) => {
      if (axis === 'y' && isGround) {
        onBounce()
      }
      if (Math.abs(vel[axis]) < MIN_VEL) {
        vel[axis] *= 0
      } else {
        vel[axis] *= bounceValue
      }
    }

    if (pos[axis] > 1) {
      pos[axis] = 1
      handleBounce(false)
    }

    if (pos[axis] < 0) {
      pos[axis] = 0
      handleBounce(true)
    }

    if (axis !== 'y' && pos.y < 0.05 && vel.y < 0.05) {
      vel[axis] *= friction
    }

    if (Math.abs(vel[axis]) < 0.0001) {
      vel[axis] *= 0
    }
  }

  if (pos.y > 0 && gravity) {
    vel.y -= gravity
  }
}

export function predictBounce(
  pos: IVec3,
  vel: IVec3,
  bounce: number,
  friction: number,
  gravity: number,
  count = 1,
): { x: number; z: number } {
  let _pos = { ...pos }
  let _vel = { ...vel }
  let _count = 0

  let hasBounced = false
  while (true) {
    doUpdate(_pos, _vel, 1, bounce, friction, gravity, () => {
      hasBounced = true
    })
    if (hasBounced) {
      hasBounced = false
      if (++_count >= count) break
    }
  }

  return { x: _pos.x, z: _pos.z }
}
