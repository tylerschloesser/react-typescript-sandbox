import * as React from 'react'
import { useState } from 'react'

import { times } from './util'

import './vella-like.scss'

const LikeIcon = () => (
<svg viewBox="0 0 15.11 17.76" className="like-svg">
    <path d="M15.11,17.76H4.35c-1.5,0-1.95-.15-2.42-.79S0,8.85,0,8.78a2.11,2.11,0,0,1,1-2.29,4.63,4.63,0,0,1,1.89-.26h2.7c0-.31-.08-.61-.13-.9a9.19,9.19,0,0,1-.07-1.63A4.3,4.3,0,0,1,6.1,1.45,2.54,2.54,0,0,1,8.91.06a1.09,1.09,0,0,1,.85,1.05h0a14.81,14.81,0,0,0,.3,3.61,41.38,41.38,0,0,0,2.31,4.09h2.74ZM8.72,1.07Z" />
</svg>
)

export const VellaLike = () => {
	const [on,setOn] = useState(null)
  return (
    <div className="vella-like">
      <button 
        className={`like-button ${on === null ? '' : on ? '--on' : '--off'}`}
        onClick={() => setOn(last => !last)}
      >
        <div className={`inner ${on === null ? '' : on ? '--on' : '--off'}`}>
          <LikeIcon />
          <div className="sparkle">
            {times(3).map(i => <div key={i} />)}
          </div>
        </div>
      </button>
    </div>
  )
}
