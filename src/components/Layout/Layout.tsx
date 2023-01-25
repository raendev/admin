import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"
import { ContractNameForm, Logo, NearLogin } from '..'
import { Sidebar } from './Sidebar'
import css from './layout.module.css'
import useWindowDimensions from '../../hooks/useWindowDimensions'

let hideSidebarTimeout: number

// set to match the timing of the CSS `slideUp` animation; must be at least as long
const HIDE_SIDEBAR_AFTER = 200

export const Layout: React.FC<React.PropsWithChildren<{
  showLogin?: 'near' | false
}>> = ({
  children,
  showLogin = 'near'
}) => {
    const { isMobile } = useWindowDimensions()
    const { method } = useParams<{ method: string }>()
    const [open, setOpenRaw] = useState(false)
    const [displaySidebar, setDisplaySidebar] = useState(false)

    function setOpen(newOpen: boolean) {
      setOpenRaw(newOpen)
      if (newOpen) {
        clearTimeout(hideSidebarTimeout)
        setDisplaySidebar(true)
      } else {
        hideSidebarTimeout = window.setTimeout(
          () => setDisplaySidebar(false),
          HIDE_SIDEBAR_AFTER
        )
      }
    }

    // close method when switching between mobile and desktop
    // also close menu after method selected from sidebar
    useEffect(() => {
      setOpen(false)
    }, [isMobile, method])

    return (
      <div className={css.layout}>
        {!isMobile && <Sidebar showLogin={showLogin} />}
        <div>
          <div className={`${isMobile ? 'bokeh' : ''} ${css.topBar}`}>
            {isMobile && (
              <div className={css.mobileTop}>
                <div style={{ display: 'flex', gap: 'var(--spacing-m)', alignItems: 'center' }}>
                  <button
                    aria-controls="mobileSidebarWrap"
                    className={css.menu}
                    onClick={() => setOpen(!open)}
                    style={{ flex: '0 0 auto' }}
                  >
                    <span className={open ? css.open : css.closed} aria-hidden />
                    <span className="visuallyHidden">{open ? 'Close Menu' : 'Open Menu'}</span>
                  </button>
                  <Link to="/" style={{
                    border: 'none',
                    background: 'transparent',
                    flex: '0 1 90px',
                  }}>
                    <Logo padding="0" width="auto" />
                  </Link>
                </div>
                {showLogin === 'near' && <NearLogin />}
              </div>
            )}
            <ContractNameForm />
          </div>
          {isMobile && (
            <div
              className={css.mobileSidebarWrap}
              data-state={open ? 'open' : 'closed'}
              id="mobileSidebarWrap"
              aria-live="polite"
              style={{ display: displaySidebar ? undefined : 'none' }}
            >
              <Sidebar showLogin={false} />
            </div>
          )}
          <div
            className="container"
            style={{ marginTop: 'var(--spacing-l)' }}
            id="mainContent" // referenced by links in `Methods/Method.tsx`
            aria-live="polite"
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
