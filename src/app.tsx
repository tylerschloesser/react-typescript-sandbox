import * as React from 'react'
import { BrowserRouter as Router, Switch, Route, NavLink } from 'react-router-dom'

import { MediumClap } from './medium-clap'
import { BackgroundTricks } from './background-tricks'
import { VellaLike } from './vella-like'

import './app.scss'

const pages = [
  {
    path: '/',
    name: 'Home',
    component: () => <h1>Hello World</h1>,
  },
  {
    path: '/medium-clap',
    name: 'Medium Clap',
    component: MediumClap,
  },
  {
    path: '/vella-like',
    name: 'Vella Like',
    component: VellaLike,
  },
  {
    path: '/background-tricks',
    name: 'Background Tricks',
    component: BackgroundTricks,
  },
]

export const App = () => (
  <div className="app">
    <Router>
      <Switch>
        {pages.map(({ path, component }) => (
          <Route key={path} exact path={path} component={component} />
        ))}
      </Switch>
      <nav>
        <ul>
          {pages.map(({ path, name }) => (
            <li key={path}>
              <NavLink exact to={path} activeClassName="active">
                {name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </Router>
  </div>
)
