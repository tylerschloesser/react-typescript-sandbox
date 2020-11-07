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
    <div id="environment" />
  )
}

const Tool = () => {
  const { tool } = useParams<AppParams>()
  console.log({ tool })
  return (
    <div className={`app ${tool ? `app--${tool}` : 'app--home'}`}>
      <div className="app__a">
        <Link to="/environment">
          Environment
        </Link>
      </div>
      <div className="app__b">
        TODO
      </div>
    </div>
  )
}

const Enviroment = () => {
  return (<div className="environment" />)
}

export const App = () => {
  useEffect(() => {
    console.log('main')
  }, [])
  return (
    <Router hashType="noslash">
      <Route path="/:tool?" component={Tool} />
    </Router>
  )
}
