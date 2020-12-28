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

interface GameState {
  isPaused: boolean
  objects: GameObject[]
  input: GameInput | null
}

const gameState$ = new BehaviorSubject<GameState>({
  isPaused: false,
  input: null,
  objects: [
    {
      x: 10,
      y: 10,
      width: 20,
      height: 30,
      color: 'red',
      pausedColor: 'green',
      velocity: {
        x: 60,
        y: 80,
      },
      maxVelocity: {
        x: 250,
        y: 200,
      },
    },
    {
      x: 200,
      y: 200,
      width: 50,
      height: 20,
      color: 'blue',
      pausedColor: 'yellow',
      velocity: {
        x: -60,
        y: 40,
      },
      maxVelocity: {
        x: 200,
        y: 100,
      },
    },
  ],
})

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

function update(elapsed: number, gameState: GameState, keysDown: string[], inputState: InputState): GameState {

  let { isPaused } = gameState

  if (keysDown.includes(' ')) {
    isPaused = !isPaused
  }

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
    }
  }

  return {
    ...gameState,
    input,
    isPaused,
    objects: gameState.objects.map(obj => {

      if (isPaused) {
        return obj
      }

      const nextX = obj.x + obj.velocity.x * elapsed
      const nextY = obj.y + obj.velocity.y * elapsed

      let nextVx = obj.velocity.x
      let nextVy = obj.velocity.y

      if (nextX < 0 || (nextX + obj.width) > canvas.width) {
        nextVx = nextVx * -1 * 1.1
      }
      if (nextY < 0 || (nextY + obj.height) > canvas.height) {
        nextVy = nextVy * -1 * 1.1
      }

      const nextVxs = nextVx / Math.abs(nextVx)
      const nextVys = nextVy / Math.abs(nextVy)
      nextVx = nextVxs * Math.min(Math.abs(nextVx), obj.maxVelocity.x)
      nextVy = nextVys * Math.min(Math.abs(nextVy), obj.maxVelocity.y)

      return {
        ...obj,
        x: nextX,
        y: nextY,
        velocity: {
          x: nextVx,
          y: nextVy,
        }
      }
    })
  }
}

function render(gameState: GameState): void {
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)

  gameState.objects.forEach(obj => {
    context.fillStyle = gameState.isPaused ? obj.pausedColor : obj.color
    context.fillRect(obj.x, obj.y, obj.width, obj.height)
  })

  const { input } = gameState
  if (input === null) {
    return
  }

  context.strokeStyle = 'white'
  context.beginPath()
  context.moveTo(input.start.x, input.start.y)
  context.lineTo(input.end.x, input.end.y)
  context.stroke()

  context.beginPath()
  context.fillStyle = 'white'
  context.arc(input.start.x, input.start.y, 10, 0, 2 * Math.PI)
  context.fill()

  context.beginPath()
  context.fillStyle = 'white'
  context.arc(input.end.x, input.end.y, 10, 0, 2 * Math.PI)
  context.fill()
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
