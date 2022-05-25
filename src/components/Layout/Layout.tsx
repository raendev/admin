import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom"
import { ContractForm, Logo, Login } from '..'
import { Sidebar } from './Sidebar'
import css from './layout.module.css'
import useWindowDimensions from '../../hooks/useWindowDimensions'

export const Layout: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const { isMobile } = useWindowDimensions()
  const { method } = useParams<{ method: string }>()
  const [open, setOpen] = useState(false)

  // close method when switching between mobile and desktop
  // also close menu after method selected from sidebar
  useEffect(() => {
    setOpen(false)
  }, [isMobile, method])

  return (
    <div className={css.layout}>
      {!isMobile && <Sidebar />}
      <div>
        <div className={`${isMobile ? 'bokeh' : ''} ${css.topBar}`}>
          {isMobile && (
            <div className={css.mobileTop}>
              <button
                className={`${css.menu} ${open ? css.open : css.closed}`}
                onClick={() => setOpen(!open)}
              >
                <span className="visuallyHidden">{open ? 'close' : 'open'}</span>
              </button>
              <Logo padding="0" />
              <Login />
            </div>
          )}
          <ContractForm />
        </div>
        {open && <Sidebar />}
        <div className="container" style={{ marginTop: 'var(--spacing-l)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
