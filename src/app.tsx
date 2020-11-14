import * as React from 'react'
import { useContext, Fragment, useEffect, useState, useRef } from 'react'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from 'react-router-dom'

import * as RssParser from 'rss-parser'

const rssParser = new RssParser()

import './app.scss'

interface IAppContext extends AppState {
  enqueue(post: RssParser.Item): void
  dequeue(post: RssParser.Item): void
}

interface FrontPage {
  rss: RssParser.Output
  json: string
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
      rss: parsed,
      json: JSON.stringify(parsed, null, 2),
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

interface PostProps {
  num: number
  title: string
  domain: string
}

interface PostListProps {
  posts: RssParser.Item[]
}

interface PostMetaProps {
  post: RssParser.Item
}

const PostMeta = ({
  post,
}: PostMetaProps) => {
  const domain = new URL(post.link).hostname
  return (
    <div className="post-meta">
      <a className="post-meta__title" href={post.link}>
        {post.title}
      </a>
      <a className="post-meta__domain" href={domain}>
        ({domain})
      </a>
    </div>
  )
}

interface PostActionProps {
  post: RssParser.Item
}

const PostAction = ({
  post,
}: PostActionProps) => {

  const {
    queue,
    enqueue,
    dequeue,
  } = useContext(AppContext)

  const isInQueue: boolean = !!queue.find(p => p.guid === post.guid)

  const onClick = () => (isInQueue ? dequeue : enqueue)(post)

  const className = [ 'post-action' ]
  if (isInQueue) {
    className.push('post-action--queued')
  }

  return (
    <button
      className={className.join(' ')}
      onClick={onClick}
    >
      {isInQueue ? '➖' : '➕'}
    </button>
  )
}

const PostList = ({
  posts,
}: PostListProps) => {
  return (
    <div className="posts">
      {posts.map((post, i) => (
        <Fragment key={post.guid}>
          <div className="posts__post-number">{i+1}.</div>
          <div className="posts__post-meta">
            <PostMeta post={post} />
          </div>
          <div className="posts__post-action">
            <PostAction post={post} />
          </div>
        </Fragment>
      ))}
    </div>
  )
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
      <div className="content__posts">
        <PostList posts={frontPage.value.rss.items} />
      </div>
      <pre style={{ display: 'none' }}>
        {frontPage.value.json}
      </pre>
    </div>
  )
}

const AppHeader = () => {
  return (
    <div className="header">
      <div className="header__logo">Y</div>
      <h1 className="header__text">Hacker News</h1>
    </div>
  )

}

const QueueStatus = () => {

  const { queue } = useContext(AppContext)

  if (!queue.length) {
    return null
  }

  return (
    <Link to="/queue/1" className="queue-status">
      {`start `}
      <span className="queue-status__count">
        ({queue.length} in queue)
      </span>
    </Link>
  )
}

interface AppState {
  queue: RssParser.Item[],
}

const QueueStep = () => {

  const { queue } = useContext(AppContext)

  const index = parseInt(useParams<{ index: string }>().index) - 1

  const post = queue[index]
  if (!post) {
    return <div>Invalid index :(</div>
  }

  return (
    <div className="queue-step">
      {post.title}
    </div>
  )
}

const AppContext = React.createContext<IAppContext>(null)

export const App = () => {

  const [state, setState] = useState<AppState>(null)

  useEffect(() => {
    const json = localStorage.getItem('state')
    if (json) {
      setState(JSON.parse(json))
    } else {
      setState({
        queue: [],
      })
    }
  }, [])

  useEffect(() => {
    if (state) {
      localStorage.setItem('state', JSON.stringify(state, null, 2))
    }
  }, [ state ])

  if (!state) {
    return null
  }

  const context: IAppContext = {
    ...state,
    enqueue: post => setState({
      ...state,
      queue: [ ...state.queue, post ],
    }),
    dequeue: post => setState({
      ...state,
      queue: state.queue.filter(p => p.guid !== post.guid),
    }),
  }

  return (
    <AppContext.Provider value={context}>
      <Router>
        <Route exact path="/">
          <div className="app">
            <QueueStatus />
            <AppHeader />
            <AppContent />
          </div>
        </Route>
        <Route exact path="/queue/:index" component={QueueStep} />
      </Router>
    </AppContext.Provider>
  )
}
