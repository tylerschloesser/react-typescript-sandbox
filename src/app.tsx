import * as React from 'react'
import { useEffect, useState, useRef } from 'react'

import './app.scss'

const times = n => {
  const arr = []
  for (let i = 0; i < n; i++) {
    arr.push(i)
  }
  return arr
}

const Star = ({ i }) => (
  <svg className={`__star --${i + 1}`} viewBox="0 0 16 24">
    <defs>
      <linearGradient id="story-image-star-gradient" gradientTransform="rotate(90)">
        <stop stopColor="#FFE7C2" offset="0%"/>
        <stop stopColor="#F87611" offset="100%"/>
      </linearGradient>
    </defs>
    <path d="M5.4 9.3C6.7 8 7.6 4.9 8 0 8.3 4.9 9.1 8 10.4 9.3 11.7 10.6 13.6 11.4 16 11.7 13.6 12 11.7 12.7 10.4 14 9.1 15.3 8.3 18.7 8 24.1 7.6 18.7 6.7 15.3 5.4 14 4 12.7 2.2 12 0 11.7 2.2 11.4 4 10.6 5.4 9.3Z" fill="url(#story-image-star-gradient)" />
  </svg>
)

const StoryImage = ({
  size = '181px', // size in the sketch mocks
  src,
  alt,
}) => {

  const [loaded,setLoaded] = useState(false)
  const onLoad = () => setLoaded(true)

  const crown = true
  const throne = true
  const stars = true

  const modifiers = { loaded }

  const style = {
    '--image-width': size,
  } as React.CSSProperties

  const className = [
    'story-image',
    ...Object.entries(modifiers)
      .filter(([k,v]) => v)
      .map(([k]) => `--${k}`)
  ].join(' ')


  return (
    <div className={className} style={style}>
      {throne && <>
        <div className="__throne --bg --l" />
        <div className="__throne --bg --r" />
      </>}
      {crown && <div className="__crown" />}
      <img className="__image" src={src} alt={alt} onLoad={onLoad} />
      {throne && <>
        <div className="__throne --fg --l" />
        <div className="__throne --fg --r" />
      </>}
      {stars && times(3).map(i => <Star key={i} i={i} />)}
    </div>
  )
}

export const App = () => {

  const block = 'story-detail-page'

  const bem = (element, modifiers: string[] = []) => ([
    `${block}__${element}`,
  ].join(' '))

  const x = 400
  const y = 400

  const alt = ""

  return (
    <div className="demo">
      {times(4).map((i) => (
        <div key={i} className="__item">
          <StoryImage
            key={i}
            size="33vw"
            src={`https://source.unsplash.com/random/${
              `${375 + i}x${375 + i}`
            }`}
            alt=""
          />
      </div>
      ))}
    </div>
  )

  // return (
  //   <>
  //     <div className="story-detail-page">
  //       <div className="__header">todo header</div>
  //       <div className="__image-wrapper">
  //         <img className="__image" src={src} alt={alt} />
  //         <div className="__crown" />
  //       </div>
  //       <h1 className="__title">
  //         {`Tea Cups and Train Wrecks`}
  //       </h1>
  //       <div className="__author">
  //         {'by'} {`Kelly Yonce`}
  //       </div>
  //       <div className="episode">
  //         {'Hughton Cremmer is just a regular teen. When Nothing becomes Something, all bets are off. But friendship? That\'s forever. Or so...'}
  //       </div>
  //     </div>
  //   </>
  // )
}
