import React from 'react'
import { Login, Logo, Methods } from '..'
import css from './sidebar.module.css'
import useWindowDimensions from '../../hooks/useWindowDimensions'

export const Sidebar: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { isMobile } = useWindowDimensions()
  return (
    <div className={`bokeh ${css.sidebar}`}>
      {!isMobile && (
        <>
          <div className={css.logo}><Logo /></div>
          <Login />
        </>
      )}
      {isMobile && <div className={css.arrow} />}
      <Methods />
    </div>
  )
}
