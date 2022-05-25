import React from "react"
import useNear from "../../hooks/useNear"
import { Dropdown } from ".."
import { Wallet } from './Wallet'
import css from './login.module.css'

export function Login() {
  const { wallet, signIn, signOut } = useNear()

  if (!wallet) return null

  const currentUser = wallet.getAccountId()

  const el = currentUser
    ? <Dropdown
        trigger={
          <button title={currentUser}>
            <Wallet />
            <span className="ellipsis">
              {currentUser}
            </span>
          </button>
        }
        items={[{ children: "Sign Out", onSelect: signOut }]}
      />
    : <button onClick={signIn}><Wallet />Sign In</button>;

  return <div className={css.login}>{el}</div>
}
