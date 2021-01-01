import React from 'react'
import ReactDOM from 'react-dom'

import {
  BehaviorSubject,
  Observable,
  of,
  fromEvent,
  merge,
} from 'rxjs'

import {
  scan,
  buffer,
  expand,
  filter,
  map,
  share,
  withLatestFrom,
  tap,
  mergeMap,
  takeUntil,
  startWith,
} from 'rxjs/operators'

import './index.scss'

// TODO error handling
const canvas = document.querySelector('canvas')!
const context = canvas.getContext('2d')!

canvas.height = window.innerHeight
canvas.width = window.innerWidth

context.fillStyle = 'black'
context.fillRect(0, 0, canvas.width, canvas.height)

function computeElapsed(now: DOMHighResTimeStamp, last?: DOMHighResTimeStamp) {
  if (typeof last === 'undefined') {
    return 0
  }
  return (now - last) / 1000 // convert ms to seconds
}

interface IFrameData {
  timestamp: DOMHighResTimeStamp;
  elapsed: number;
}

function calculateFrame(lastFrame: IFrameData | undefined): Observable<IFrameData> {
  return new Observable<IFrameData>(observer => {

    requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
      observer.next({
        timestamp,
        elapsed: computeElapsed(timestamp, lastFrame?.timestamp)
      })
    })

  })
}

interface Vec2 {
  x: number
  y: number
}

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  color: string
  pausedColor: string
  velocity: Vec2
  maxVelocity: Vec2
}

interface GameInput {
  start: Vec2
  end: Vec2
}

interface GameBall {
  pos: Vec2
  vel: Vec2
  radius: number
  color: string
}

interface GameState {
  vmin: number
  vx: number
  vy: number
  isPaused: boolean
  input: GameInput | null
  ball: GameBall
}

let initialState = ((): GameState => {
  const vmin = Math.min(canvas.height, canvas.width)

  return {
    vmin,
    vx: vmin,
    vy: vmin,
    isPaused: false,
    input: null,
    ball: {
      pos: { x: vmin / 2, y: vmin / 2 },
      vel: { x: 0, y: 0 },
      radius: vmin * .08,
      color: 'blue',
    },
  }
})()

const gameState$ = new BehaviorSubject<GameState>(initialState)

const keysDown$ = fromEvent<KeyboardEvent>(document, 'keydown')
  .pipe(
    map((event) => event.key),
  )



const frames$ = of(undefined)
  .pipe(
    expand((val: IFrameData | undefined) => calculateFrame(val)),
    filter(frame => typeof frame !== 'undefined'),
    map((frame) => frame.elapsed),
    share()
  )

interface InputState {
  down: boolean
  drag: PointerEvent[]
}

// disable scroll on iphone
fromEvent<TouchEvent>(document, 'touchmove', { passive: false }).pipe(tap(e => e.preventDefault())).subscribe(() => {})

const pointerDown$ = fromEvent<PointerEvent>(document, 'pointerdown')
const pointerUp$ = fromEvent<PointerEvent>(document, 'pointerup')
const pointerMove$ = fromEvent<PointerEvent>(document, 'pointermove')

const inputState$ = merge<PointerEvent>(pointerDown$, pointerMove$, pointerUp$).pipe(
  scan<PointerEvent, InputState>((acc, event) => {
    switch (event.type) {
      case 'pointerdown': {
        return {
          down: true,
          drag: [ event ],
        }
      }
      case 'pointermove': {
        if (acc.down) {
          return {
            ...acc,
            drag: [ ...acc.drag, event ],
          }
        }
        return acc
      }
      case 'pointerup': {
        return {
          down: false,
          drag: [ ...acc.drag, event ],
        }
      }
    }
    return acc // shouldn't happen
  }, {
    down: false,
    drag: [],
  }),
  // TODO redundant
  startWith({ down: false, drag: [] }),
)

const keysDownPerFrame$ = keysDown$
  .pipe(
    buffer(frames$),
    tap(hmm => {
      if (hmm.length) {
        console.log(hmm)
      }
    })
  )

function toVec2(event: PointerEvent): Vec2 {
  return {
    x: event.clientX,
    y: event.clientY,
  }
}

function subtractVec2(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  }
}

function update(elapsed: number, gameState: GameState, keysDown: string[], inputState: InputState): GameState {

  let { isPaused } = gameState

  if (keysDown.includes(' ')) {
    isPaused = !isPaused
  }

  let ball = gameState.ball
  let ballPosition = gameState.ball.pos
  let ballVelocity = gameState.ball.vel
  let input: GameInput | null = null
  {
    const { drag, down } = inputState
    if (inputState.down && drag.length > 1) {
      const first = drag[0]
      const last = drag[drag.length - 1]
      input = {
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
      console.log('add velocity')

      const first = toVec2(drag[0])
      const last = toVec2(drag[drag.length - 1])

      ballVelocity = subtractVec2(first, last)

    }
  }

  let nextBallX = ballPosition.x + (ballVelocity.x * elapsed)
  let nextBallY = ballPosition.y + (ballVelocity.y * elapsed)

  let nextBallVx = ballVelocity.x
  let nextBallVy = ballVelocity.y

  if ((nextBallX - ball.radius) < 0) {
    nextBallX = ball.radius + Math.abs(nextBallX - ball.radius)
    nextBallVx *= -1
  }
  if ((nextBallY - ball.radius) < 0) {
    nextBallY = ball.radius + Math.abs(nextBallY - ball.radius)
    nextBallVy *= -1
  }

  if ((nextBallX + ball.radius) > gameState.vx) {
    nextBallX = gameState.vx - ball.radius - ((nextBallX + ball.radius) - (gameState.vx))
    nextBallVx *= -1
  }
  if ((nextBallY + ball.radius) > gameState.vy) {
    nextBallY = gameState.vy - ball.radius - ((nextBallY + ball.radius) - (gameState.vy))
    nextBallVy *= -1
  }

  ballPosition = {
    x: nextBallX,
    y: nextBallY,
  }

  ballVelocity = {
    x: nextBallVx,
    y: nextBallVy,
  }

  {
    //let dx = ballPosition.x - ball.radius
  }

  // if (ballPosition.x - ball.radius < 0 || ballPosition.y - ball.radius < 0 || ballPosition.x + ball.radius > canvas.width || ballPosition.y + ball.radius > canvas.height) {
  //   ballVelocity = { x: 0, y: 0 }
  //   console.log("stop")
  // }

  return {
    ...gameState,
    input,
    isPaused,
    ball: {
      ...gameState.ball,
      vel: ballVelocity,
      pos: ballPosition,
    },
  }
}

function render(gameState: GameState): void {
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)

  const { vmin } = gameState

  const { input } = gameState
  if (input !== null) {
    context.strokeStyle = 'white'
    context.beginPath()
    context.moveTo(input.start.x, input.start.y)
    context.lineTo(input.end.x, input.end.y)
    context.stroke()

    context.beginPath()
    context.fillStyle = 'white'
    context.arc(input.start.x, input.start.y, vmin*.02, 0, 2 * Math.PI)
    context.fill()

    context.beginPath()
    context.fillStyle = 'white'
    context.arc(input.end.x, input.end.y, vmin*.02, 0, 2 * Math.PI)
    context.fill()
  }

  context.transform(
    1,
    0,
    0,
    1,
    (canvas.width - gameState.vx) / 2,
    (canvas.height - gameState.vy) / 2,
  )

  {
    const { ball } = gameState
    context.beginPath()
    context.fillStyle = ball.color
    context.arc(ball.pos.x, ball.pos.y, ball.radius, 0, 2 * Math.PI)
    context.fill()
  }


  context.beginPath();
  context.strokeStyle='red'
  context.rect(0, 0, gameState.vx, gameState.vy);
  context.stroke();

  context.resetTransform()
}

frames$
  .pipe(
    withLatestFrom(gameState$, keysDownPerFrame$, inputState$),
    map(([ elapsed, gameState, keysDown, inputState ]) => update(elapsed, gameState, keysDown, inputState)),

    // TODO why is this not in .subscribe below?
    tap(gameState => gameState$.next(gameState))
  )
  .subscribe(render)

interface DebugProps {
  gameState$: BehaviorSubject<GameState>
}

const Debug = ({
  gameState$,
}: DebugProps) => {

  const [gameState, setGameState] = React.useState<GameState>(gameState$.getValue())

  React.useEffect(() => {
    const sub = gameState$.subscribe(setGameState)
    return () => sub.unsubscribe()
  }, [])

  return (
    <pre className="debug">
      {JSON.stringify(gameState, null, 2)}
    </pre>
  )
}

ReactDOM.render((
  <Debug
    gameState$={gameState$}
  />
), document.querySelector('#root'))
