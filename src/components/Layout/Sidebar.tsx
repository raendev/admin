import React from 'react'
import { Link } from "react-router-dom"
import { NearLogin, Logo, Methods } from '..'
import css from './sidebar.module.css'
import useWindowDimensions from '../../hooks/useWindowDimensions'

export const Sidebar: React.FC<React.PropsWithChildren<{
  showLogin: 'near' | false,
}>> = ({ showLogin }) => {
  const { isMobile } = useWindowDimensions()
  return (
    <div className={`bokeh ${css.sidebar} ${isMobile ? css.mobile : ''}`}>
      {!isMobile && (
        <div className={css.nav}>
          <div className={css.logo}>
            <Link to="/" style={{ border: 'none', background: 'transparent' }}>
              <Logo padding="var(--spacing-xs) 0 var(--spacing-s)" />
            </Link>
          </div>
          {showLogin === 'near' && <NearLogin />}
        </div>
      )}
      <Methods />
      {isMobile && <div className={css.arrow} />}
    </div>
  )
}
