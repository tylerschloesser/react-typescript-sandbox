import * as React from 'react'
import { HashRouter as Router, Switch, Route, NavLink, Redirect } from 'react-router-dom'

import './background-tricks.scss'

const tricks = [
  {
    path: '/radial-gradient',
    name: 'Radial Gradient',
    component: () => <div className="radial-gradient" />,
  },
  {
    path: '/conic-gradient',
    name: 'Conic Gradient',
    component: () => <div className="conic-gradient" />,
  },
]

export const BackgroundTricks = () => {
  return (
    <div className="background-tricks">
      <Router>
        <nav>
          <ul>
            {tricks.map(({ path, name }) => (
              <li key={path}>
                <NavLink exact to={path} activeClassName="active">
                  {name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Switch>
          {tricks.map(({ path, component }) => (
            <Route key={path} exact path={path} component={component} />
          ))}
          <Route path="/">
            <Redirect to={tricks[0].path} />
          </Route>
        </Switch>
      </Router>
    </div>
  )
}
