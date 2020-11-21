import * as React from 'react'
import { useEffect, useState, useRef } from 'react'

import './app.scss'

const StoryImage = ({
  src,
  alt,
}) => {

  const [loaded,setLoaded] = useState(false)
  const onLoad = () => setLoaded(true)

  return (
    <div className={`story-image ${loaded ? '--loaded' : ''}`}>
      <div className="__crown" />
      <img className="__image" src={src} alt={alt} onLoad={onLoad} />
      <div className="__throne-fg" />
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
  const src =
    `https://source.unsplash.com/random/${x}x${y}`
  const alt = ""

  return (
    <div className="demo">
      <StoryImage src={src} alt={alt} />
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
