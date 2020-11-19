import * as React from 'react'
import { useEffect, useState, useRef } from 'react'

import './app.scss'

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
    <>
      <div className="story-detail-page">
        <div className="__header">todo header</div>
        <div className="__image-wrapper">
          <img className="__image" src={src} alt={alt} />
          <div className="__crown" />
        </div>
        <h1 className="__title">
          {`Tea Cups and Train Wrecks`}
        </h1>
        <div className="__author">
          {'by'} {`Kelly Yonce`}
        </div>
        <div className="episode">
          {'Hughton Cremmer is just a regular teen. When Nothing becomes Something, all bets are off. But friendship? That\'s forever. Or so...'}
        </div>
      </div>
    </>
  )
}
