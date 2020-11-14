import * as React from 'react'
import { useEffect, useState, useRef } from 'react'

import * as RssParser from 'rss-parser'

const rssParser = new RssParser()

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
    const res = await fetch('/api').then(res => {
      if (!res.ok || res.status !== 200) {
        throw Error('failed')
      }
      return res.text()
    })
    const parsed = await rssParser.parseString(res)
    return {
      test: JSON.stringify(parsed, null, 2),
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

const AppContent = () => {
  const frontPage = useFrontPage()

  if (!frontPage.ready) {
    return (
      <div className="content">
        loading front page
      </div>
    )
  }

  if (frontPage.error) {
    return (
      <div className="content">
        Failed to load front page :( - {frontPage.error.message}
      </div>
    )
  }

  return (
    <div className="content">
      <pre>
        {frontPage.value.test}
      </pre>
    </div>
  )
}

const AppHeader = () => {
  return (
    <div className="header">
      Hacker News
    </div>
  )

}

export const App = () => {
  return (
    <div className="app">
      <AppHeader />
      <AppContent />
    </div>
  )
}
