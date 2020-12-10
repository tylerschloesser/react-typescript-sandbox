import * as React from 'react'
import { useState } from 'react'

import { times } from './util'

import './vella-like.scss'

const LikeIcon = () => (
<svg viewBox="0 0 14 16" className="like-svg">
    <path d="M2.42 6.48c-.46 0-.91.05-1.03.11-.32.19-.52.45-.44 1.13.05.51 1.27 6.34 1.54 6.88.14.19.22.29 1.38.3h8.66V8.77H10.5l-.13-.22c-.35-.56-2.1-3.4-2.3-4.1-.3-.96-.33-2.75-.3-3.47-.58-.14-1-.04-1.56.82-.27.4-.41.91-.43 1.53-.02.5 0 .9.05 1.27l.13.9.13.98H2.61l-.2-.01zm11.04 9.34H3.87c-1.33 0-1.73-.13-2.15-.7-.4-.57-1.7-7.24-1.7-7.3-.1-.96.2-1.63.91-2.04.45-.25 1.4-.24 1.7-.23h2.4l-.12-.8a7.57 7.57 0 01-.06-1.44c.03-.8.22-1.46.58-2.02.5-.76 1.2-1.5 2.5-1.23.39.07.79.45.77.93-.04.83.04 2.46.26 3.21.12.42 1.27 2.37 2.06 3.65h2.44v7.97z" />
</svg>
)

export const VellaLike = () => {
	const [on,setOn] = useState(false)
  return (
    <div className="vella-like">
      <button 
        className={`like-button ${on ? '--on' : ''}`}
        onClick={() => setOn(last => !last)}
      >
        <div className={`inner ${on ? '--on' : ''}`}>
          <LikeIcon />
          <div className="sparkle">
            {times(3).map(i => <div key={i} />)}
          </div>
        </div>
      </button>
    </div>
  )
}
