import React from "react"
import useNear from "../../hooks/useNear"
import { Dropdown } from ".."
import css from './login.module.css'

export function Login() {
  const { wallet, signIn, signOut } = useNear()

  if (!wallet) return null

  const currentUser = wallet.getAccountId()

  const el = currentUser
    ? <Dropdown
        trigger={currentUser}
        items={[{ children: "Sign Out", onSelect: signOut }]}
      />
    : <button onClick={signIn}>Sign In</button>

  return <div className={css.login}>{el}</div>
}
