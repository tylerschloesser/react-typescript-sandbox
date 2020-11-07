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

const Tool = () => {
  const { tool } = useParams<AppParams>()
  return <div>{tool}</div>
}

export const App = () => {
  useEffect(() => {
    console.log('main')
  }, [])
  return (
    <Router hashType="noslash">
      <Switch>
        <Route path="/:tool" component={Tool} />
      </Switch>
      <div className="app">
        <div id="environment" className="app-a1">
          <h1>
            <a href="#environment">
              environment
            </a>
          </h1>
        </div>
      </div>
    </Router>
  )
}
