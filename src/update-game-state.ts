import {
  Vec2,
  GameInput,
  GameCircle,
  GameTarget,
  GameBall,
  GameState,
  vec2,
  InputState,
  toVec2,
  subtractVec2,
  divideVec2,
  distVec2,
  IFrameData,
} from './common'

function generateTarget(state?: GameState): GameTarget {

  const radius = .04
  const color = 'cyan'

  if (!state) {
    return {
      pos: vec2(.25, .25),
      radius,
      color,
    }
  }

  const minDist = (state.ball.radius + radius) * 2
  let x, y
  do {
    x = radius*2 + Math.random() * (1-radius*4)
    y = radius*2 + Math.random() * (1-radius*4)
  } while (distVec2({ x, y }, state.ball.pos) < minDist)

  return {
    pos: vec2(x, y),
    radius,
    color,
  }
}

export function getInitialState(canvas: HTMLCanvasElement): GameState {
  const vmin = Math.min(canvas.height, canvas.width)

  let vel: Vec2
  { 
    let theta = Math.random() * Math.PI * 2
    vel = divideVec2({
      x: Math.cos(theta),
      y: Math.sin(theta),
    }, 2)
  }

  const target = generateTarget()

  return {
    vmin,
    vx: vmin,
    vy: vmin,
    isPaused: false,
    input: null,
    ball: {
      pos: { x: .5, y: .5 },
      vel,
      radius: .08,
      color: 'blue',
    },
    targets: [ target ],
    score: 0
  }
}

export function updateGameState(
  frame: IFrameData,
  gameState: GameState,
  keysDown: string[],
  inputState: InputState,
): GameState {

  const { elapsed } = frame

  let { isPaused } = gameState

  if (keysDown.includes(' ')) {
    isPaused = !isPaused
  } else if (isPaused && inputState.down) {
    isPaused = false
  }
  if (isPaused) {
    return {
      ...gameState,
      isPaused,
      input: null,
    }
  }

  let ball = gameState.ball
  let nextBallPos = gameState.ball.pos
  let nextBallVel = gameState.ball.vel
  let input: GameInput | null = null
  {
    const { drag, down } = inputState
    if (inputState.down && drag.length > 1) {
      const first = drag[0]
      const last = drag[drag.length - 1]
      input = {
        startTime: first.timeStamp,
        start: {
          x: first.clientX,
          y: first.clientY,
        },
        end: {
          x: last.clientX,
          y: last.clientY,
        },
      }

    } else if (gameState.input) {
      // handle letting go of velocity trigger

      const first = toVec2(drag[0])
      const last = toVec2(drag[drag.length - 1])

      nextBallVel = divideVec2(subtractVec2(first, last), gameState.vmin)

    }
  }

  let inputScaledBallVx = nextBallVel.x
  let inputScaledBallVy = nextBallVel.y

  if (input && (frame.timestamp - input.startTime > 250)) {
    inputScaledBallVx *= .25
    inputScaledBallVy *= .25
  }

  let nextBallX = nextBallPos.x + (inputScaledBallVx * elapsed)
  let nextBallY = nextBallPos.y + (inputScaledBallVy * elapsed)

  let nextBallVx = nextBallVel.x
  let nextBallVy = nextBallVel.y

  {
    const radius = ball.radius

    if ((nextBallX - radius) < 0) {
      nextBallX = radius + Math.abs(nextBallX - radius)
      nextBallVx *= -1
    }
    if ((nextBallY - radius) < 0) {
      nextBallY = radius + Math.abs(nextBallY - radius)
      nextBallVy *= -1
    }

    if ((nextBallX + radius) > 1) {
      nextBallX = 1 - radius - ((nextBallX + radius) - (1))
      nextBallVx *= -1
    }
    if ((nextBallY + radius) > 1) {
      nextBallY = 1 - radius - ((nextBallY + radius) - (1))
      nextBallVy *= -1
    }
  }

  nextBallPos = {
    x: nextBallX,
    y: nextBallY,
  }

  nextBallVel = {
    x: nextBallVx,
    y: nextBallVy,
  }

  let { score } = gameState
  let [ target ] = gameState.targets

  {
    let dist = distVec2(nextBallPos, target.pos)
    if (dist < (ball.radius + target.radius)) {
      target = generateTarget(gameState)
      score++
    }
  }

  return {
    ...gameState,
    input,
    isPaused,
    ball: {
      ...gameState.ball,
      vel: nextBallVel,
      pos: nextBallPos,
    },
    targets: [ target ],
    score,
  }
}
