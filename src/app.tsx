import * as React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

import { MediumClap } from './medium-clap'

import './app.scss'

interface Page {
  path: string
  name: string
  component: React.Component,
}

const Home = () => <h1>Hello World</h1>

export const App = () => {

  const pages = [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/medium-clap',
      name: 'Medium Clap',
      component: MediumClap,
    },
  ]

  return (
    <div className="app">
      <Router>
        <nav>
          <ul>
            {pages.map(({ path, name }) => (
              <li>
                <Link to={path}>{name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <Switch>
          {pages.map(({ path, component }, i) => (
            <Route exact path={path} component={component} />
          ))}
        </Switch>
      </Router>
    </div>
  )
}
