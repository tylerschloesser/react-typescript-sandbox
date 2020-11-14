import * as React from 'react'
import { Fragment, useEffect, useState, useRef } from 'react'

import * as RssParser from 'rss-parser'

const rssParser = new RssParser()

import './app.scss'

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

}

const PostAction = ({

}: PostActionProps) => {
  return (
    <button className="post-action">
      +
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
            <PostAction />
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

export const App = () => {
  return (
    <div className="app">
      <AppHeader />
      <AppContent />
    </div>
  )
}
