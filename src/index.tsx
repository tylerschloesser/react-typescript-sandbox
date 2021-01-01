import React from 'react'
import ReactDOM from 'react-dom'

import { omit, pipe, get, negate, isNull, stubTrue, has, compose, update, cond, identity } from 'lodash/fp'

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
  IFrameData,
} from './common'

import {
  getInitialState,
  updateGameState,
} from './update-game-state'

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



const gameState$ = new BehaviorSubject<GameState>(getInitialState(canvas))

const keysDown$ = fromEvent<KeyboardEvent>(document, 'keydown')
  .pipe(
    map((event) => event.key),
  )



const frames$ = of(undefined)
  .pipe(
    expand((val: IFrameData | undefined) => calculateFrame(val)),
    filter(frame => typeof frame !== 'undefined'),
    map(frame => ({
      ...frame,
      elapsed: Math.min(frame.elapsed, 1/30),
    })),
    share()
  )


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

const translateCircle = (circle: GameCircle, state: GameState): GameCircle => ({
  ...circle,
  radius: circle.radius * state.vmin,
  pos: {
    x: circle.pos.x * state.vmin,
    y: circle.pos.y * state.vmin,
  },
})

function renderGame(gameState: GameState): void {
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)

  const { vmin } = gameState


  // context.transform(
  //   1,
  //   0,
  //   0,
  //   1,
  //   (canvas.width - gameState.vx) / 2,
  //   (canvas.height - gameState.vy) / 2,
  // )

  gameState.targets.map(target => translateCircle(target, gameState))
    .forEach((circle, i) => {
      if (i === 1) {
        context.globalAlpha = .25
      }
      const radius = circle.radius
      context.beginPath()
      context.fillStyle = circle.color
      context.arc(circle.pos.x, circle.pos.y, radius, 0, 2 * Math.PI)
      context.fill()
    })
  context.globalAlpha = 1

  {
    const ball = translateCircle(gameState.ball, gameState)
    const radius = ball.radius
    context.beginPath()
    context.fillStyle = ball.color
    context.arc(ball.pos.x, ball.pos.y, radius, 0, 2 * Math.PI)
    context.fill()
  }



  context.beginPath();
  context.strokeStyle='rgba(255,0,0,.5)'
  context.rect(0, 0, gameState.vx, gameState.vy);
  context.stroke();

  context.resetTransform()

  const { input } = gameState
  if (input !== null) {
    input.swipes.forEach(({ start, end }) => {
      context.strokeStyle = 'white'
      context.beginPath()
      context.moveTo(start.x, start.y)
      context.lineTo(end.x, end.y)
      context.stroke()

      context.beginPath()
      context.fillStyle = 'white'
      context.arc(start.x, start.y, vmin*.02, 0, 2 * Math.PI)
      context.fill()

      context.beginPath()
      context.fillStyle = 'white'
      context.arc(end.x, end.y, vmin*.02, 0, 2 * Math.PI)
      context.fill()
    })
  }
}

frames$
  .pipe(
    withLatestFrom(gameState$, keysDownPerFrame$, inputState$),
    map(([ elapsed, gameState, keysDown, inputState ]) => updateGameState(elapsed, gameState, keysDown, inputState)),

    // TODO why is this not in .subscribe below?
    tap(gameState => gameState$.next(gameState))
  )
  .subscribe(renderGame)

interface DebugProps {
  gameState$: BehaviorSubject<GameState>
}

const nonNull = negate(isNull)

const Debug = ({
  gameState$,
}: DebugProps) => {

  const [gameState, setGameState] = React.useState<GameState>(gameState$.getValue())

  React.useEffect(() => {
    const sub = gameState$.subscribe(setGameState)
    return () => sub.unsubscribe()
  }, [])

  return (
    <>
      <div className="score">
        <div className="score__label">Score</div>
        <div className="score__number">{gameState.score}</div>
      </div>
      <pre className="debug">
        {JSON.stringify(
          compose(
            omit('score'),
            update('ball.pos.x', v => v.toFixed(2)),
            update('ball.pos.y', v => v.toFixed(2)),
            update('ball.vel.x', v => v.toFixed(2)),
            update('ball.vel.y', v => v.toFixed(2)),
            update('targets[0].pos.x', v => v.toFixed(2)),
            update('targets[0].pos.y', v => v.toFixed(2)),
            update('targets[1].pos.x', v => v.toFixed(2)),
            update('targets[1].pos.y', v => v.toFixed(2)),
            // cond([
            //   [pipe(get('input'), nonNull), compose(
            //     update('input.start.x', v => v.toFixed()),
            //     update('input.start.y', v => v.toFixed()),
            //     update('input.end.x', v => v.toFixed()),
            //     update('input.end.y', v => v.toFixed()),
            //   )],
            //   [stubTrue, identity],
            // ]),
          )(gameState), null, 2)}
      </pre>
    </>
  )
}

ReactDOM.render((
  <Debug
    gameState$={gameState$}
  />
), document.querySelector('#root'))
