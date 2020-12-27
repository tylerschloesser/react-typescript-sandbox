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
} from 'rxjs/operators'

const canvas = document.querySelector('canvas')
if (!canvas) throw Error('no canvas')
const context = canvas.getContext('2d')
if (!context) throw Error('no context')

canvas.height = window.innerHeight
canvas.width = window.innerWidth

context.fillStyle = 'black'
context.fillRect(0, 0, canvas.width, canvas.height)

function computeElapsed(now: DOMHighResTimeStamp, last?: DOMHighResTimeStamp) {
  if (typeof last === 'undefined') {
    return 0
  }
  return now - last
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
      color: '#000',
      pausedColor: '#0f0',
      velocity: {
        x: 30,
        y: 40,
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
      color: '#0f0',
      pausedColor: '#00f',
      velocity: {
        x: -30,
        y: 20,
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
