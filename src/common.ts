
export interface Vec2 {
  x: number
  y: number
}

export interface GameInput {
  startTime: number
  start: Vec2
  end: Vec2
}

export interface GameCircle {
  pos: Vec2
  radius: number
  color: string
}

export interface GameTarget extends GameCircle {
}

export interface GameBall extends GameCircle {
  vel: Vec2
}

export interface GameState {
  vmin: number
  vx: number
  vy: number
  isPaused: boolean
  input: GameInput | null
  ball: GameBall
  target: GameTarget
  targets: GameTarget[]
  score: number
}

export const vec2 = (x: number, y: number): Vec2 => ({ x, y })

export interface InputState {
  down: boolean
  drag: PointerEvent[]
}

export function toVec2(event: PointerEvent): Vec2 {
  return {
    x: event.clientX,
    y: event.clientY,
  }
}

export function subtractVec2(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  }
}

export function divideVec2(v: Vec2, s: number): Vec2 {
  return {
    x: v.x / s,
    y: v.y / s,
  }
}

export function distVec2(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx*dx+dy*dy)
}

export interface IFrameData {
  timestamp: DOMHighResTimeStamp;
  elapsed: number;
}
