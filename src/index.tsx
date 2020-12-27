import {
  BehaviorSubject,
  Observable,
  of,
} from 'rxjs'

import {
  expand,
  filter,
  map,
  share,
  withLatestFrom,
  tap,
} from 'rxjs/operators'

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
  isPaused: boolean
  color: string
  pausedColor: string
  velocity: Vec2
  maxVelocity: Vec2
}

interface GameState {
  objects: GameObject[]
}

const gameState$ = new BehaviorSubject<GameState>({
  objects: [
    {
      x: 10,
      y: 10,
      width: 20,
      height: 30,
      isPaused: false,
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
      isPaused: false,
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

const frames$ = of(undefined)
  .pipe(
    expand((val: IFrameData | undefined) => calculateFrame(val)),
    filter(frame => typeof frame !== 'undefined'),
    map((frame) => frame.elapsed),
    share()
  )

function update(elapsed: number, gameState: GameState): GameState {
  return {
    ...gameState,
    objects: gameState.objects.map(obj => {

      if (obj.isPaused) {
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
    context.fillStyle = obj.isPaused ? obj.pausedColor : obj.color
    context.fillRect(obj.x, obj.y, obj.width, obj.height)
  })
}

frames$
  .pipe(
    withLatestFrom(gameState$),
    map(([ elapsed, gameState ]) => update(elapsed, gameState)),

    // TODO why is this not in .subscribe below?
    tap(gameState => gameState$.next(gameState))
  )
  .subscribe(render)
