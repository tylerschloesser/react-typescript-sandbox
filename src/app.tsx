import * as React from 'react'
import { useEffect, useState, useRef } from 'react'

import './app.scss'

export const App = () => {

  const block = 'story-detail-page'

  const bem = (element, modifiers: string[] = []) => ([
    `${block}__${element}`,
  ].join(' '))

  const src = ""
  const alt = ""

  return (
    <div className="story-detail-page">
      <div className="__img">
        <img src={src} alt={alt} />
      </div>
      hi
    </div>
  )
}
