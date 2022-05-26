import React from 'react'
import { Link } from "react-router-dom"
import { Login, Logo, Methods } from '..'
import css from './sidebar.module.css'
import useWindowDimensions from '../../hooks/useWindowDimensions'

export const Sidebar: React.FC<React.PropsWithChildren<unknown>> = () => {
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
          <Login />
        </div>
      )}
      <Methods />
      {isMobile && <div className={css.arrow} />}
    </div>
  )
}
