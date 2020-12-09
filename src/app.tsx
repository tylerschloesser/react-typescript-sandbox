import * as React from 'react'
import { BrowserRouter as Router, Switch, Route, NavLink } from 'react-router-dom'

import { MediumClap } from './medium-clap'
import { GradientTricks } from './gradient-tricks'

import './app.scss'

interface Page {
  path: string
  name: string
  component: React.Component,
}

const Home = () => <h1>Hello World</h1>

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
  {
    path: '/gradient-tricks',
    name: 'Gradient Tricks',
    component: GradientTricks,
  },
]

export const App = () => (
  <div className="app">
    <Router>
      <nav>
        <ul>
          {pages.map(({ path, name }) => (
            <li>
              <NavLink exact to={path} activeClassName="active">
                {name}
              </NavLink>
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
