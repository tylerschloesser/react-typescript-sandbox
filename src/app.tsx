import * as React from 'react'
import { useEffect, useState, useRef } from 'react'

import './app.scss'

interface FrontPage {
  test: string
}

interface Api {
  getFrontPage(): Promise<FrontPage>
}

interface Future<T> {
  ready: boolean
  value?: T
  error?: Error
}

const api: Api = {
  getFrontPage: async () => {
    const res = await fetch('/api').then(res => res.text())
    return {
      test: res,
    }
  }
}

function useFrontPage(): Future<FrontPage> {
  const [state, setState] = useState<Future<FrontPage>>({
    ready: false,
  })

  useEffect(() => {
    api.getFrontPage().then(value => {
      setState({ ready: true, value })
    }).catch(error => {
      setState({ ready: true, error })
    })
  }, [])

  return state
}

export const App = () => {

  const frontPage = useFrontPage()

  if (!frontPage.ready) {
    return (
      <div className="app">
        loading front page
      </div>
    )
  }

  if (frontPage.error) {
    return (
      <div className="app">
        Failed to load front page :( - {frontPage.error.message}
      </div>
    )
  }

  return (
    <div className="app">
      {frontPage.value.test}
    </div>
  )
}
