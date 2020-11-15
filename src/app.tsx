import * as React from 'react'
import { useContext, Fragment, useEffect, useState, useRef } from 'react'
import firebase from 'firebase'

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
  topStoryIds: Future<number[]>,
  firebaseApp: firebase.app.App,
  storyIdToStory: Map<number, HnStory>,
}

const QueueStep = () => {

  const { queue } = useContext(AppContext)

  const index = parseInt(useParams<{ index: string }>().index) - 1

  const post = queue[index]

  useEffect(() => {
    if (post) {
			window.open(post.link);
    }
  }, [ post ])

  if (!post) {
    return <div>Invalid index :(</div>
  }

  return (
    <div className="queue-step">
      <div className="queue-step__header">
        {post.title}
        <Link to={`/queue/${index+2}`}>next</Link>
      </div>
      <div className="queue-step__content">
        todo
      </div>
    </div>
  )
}

const AppContext = React.createContext<IAppContext>(null)

interface HnStory {
  title: string
}

interface HnApiV2 {
  getTopStories(): Promise<HnStory[]>,
}

export const App = () => {

  const [state, setState] = useState<AppState>(null)

  useEffect(() => {
    const app = firebase.initializeApp({
      databaseURL: "https://hacker-news.firebaseio.com",
    })
    setState({
      queue: [],
      topStoryIds: {
        ready: false,
      },
      firebaseApp: app,
      storyIdToStory: new Map(),
    })

    app.database().ref('/v0/topstories').once('value', snapshot => {
      setState(prev => ({
        ...prev,
        topStoryIds: {
          ready: true,
          value: snapshot.val(),
        },
      }))

      const storyIds: number[] = snapshot.val()
      storyIds.slice(0, 10).forEach(storyId => {
        app.database().ref(`/v0/item/${storyId}`)
          .once('value', snapshot => {
            setState(prev => ({
              ...prev,
              storyIdToStory: {
                ...prev.storyIdToStory,
                [storyId]: snapshot.val(),
              }
            }))
          })
      })
    })

  }, [])

  useEffect(() => {
    console.log(state)
  }, [ state ])

  if (!state) {
    return null
  }

  const context: IAppContext = {
    ...state,
    enqueue: post => setState(prev => ({
      ...prev,
      queue: [ ...state.queue, post ],
    })),
    dequeue: post => setState(prev => ({
      ...prev,
      queue: state.queue.filter(p => p.guid !== post.guid),
    })),
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
