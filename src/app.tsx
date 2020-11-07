import * as React from 'react'
import { useEffect, useState, useRef } from 'react'
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom"

import './app.scss'

interface AppParams {
  tool: string
}

const Environment = () => {
  return (
    <div id="tool-environment" />
  )
}

const Tool = () => {
  const { tool } = useParams<AppParams>()
  console.log({ tool })
  return (
    <div className={`app ${tool ? `app__${tool}` : ''}`}>
      <div className="app__environment">
        <h1>
          <a href="#environment">
            environment
          </a>
        </h1>
      </div>
    </div>
  )
}

export const App = () => {
  useEffect(() => {
    console.log('main')
  }, [])
  return (
    <Router hashType="noslash">
      <Switch>
        <Route path="/:tool?" component={Tool} />
      </Switch>
    </Router>
  )
}
