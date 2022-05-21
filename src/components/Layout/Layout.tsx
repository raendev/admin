import React from 'react'
import { ContractForm, Logo, Login } from '..'
import { Sidebar } from './Sidebar'
import css from './layout.module.css'
import useWindowDimensions from '../../hooks/useWindowDimensions'

export const Layout: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const { isMobile } = useWindowDimensions()
  return (
    <div className={css.layout}>
      <Sidebar />
      <div>
        <div className={css.topBar}>
          {isMobile && (
            <div className={css.tippityTop}>
              <Logo />
              <Login />
            </div>
          )}
          <ContractForm />
        </div>
        <div className="container">
          {children}
        </div>
      </div>
    </div>
  )
}
