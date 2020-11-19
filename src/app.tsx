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
  const src = `https://source.unsplash.com/random/${x}x${y}`
  const alt = ""

  return (
    <div className="story-detail-page">
      <div className="__img">
        <img src={src} alt={alt} />
      </div>
    </div>
  )
}
