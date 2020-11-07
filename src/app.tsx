import * as React from 'react'
import { useEffect, useState, useRef } from 'react'

import './app.scss'

export const App = () => {
  useEffect(() => {
    console.log('main')
  }, [])
  return (
    <div className="app">
      <div className="app-a1">
        <h1>
          <a href="#">
            environment
          </a>
        </h1>
      </div>
    </div>
  )
}
