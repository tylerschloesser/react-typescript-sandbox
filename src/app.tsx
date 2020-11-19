import * as React from 'react'
import { useEffect, useState, useRef } from 'react'

import './app.scss'

export const App = () => {

  const bem = (block, modifiers: string[] = []) => ([
    block,
    ...modifiers.map(m=>`${block}--${m}`),
  ].join(' '))

  return (
    <div className={bem('app')}>
      hi
    </div>
  )
}
