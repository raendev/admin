import * as React from "react"
import useNear from "../../hooks/useNear"
import { Dropdown } from ".."
import css from "./nav.module.css"

export function Nav() {
  const { contract, wallet, signIn, signOut } = useNear()
  return (
    <nav className={css.nav}>
      <h1 className={css.title}>
        {contract || 'raen admin'}
      </h1>
      {wallet && (
        wallet.getAccountId() ? (
          <Dropdown
            trigger={wallet.getAccountId()}
            items={[
              {
                children: "Sign Out",
                onSelect: signOut,
              },
            ]}
          />
        ) : (
          <button onClick={signIn}>Sign In</button>
        )
      )}
    </nav>
  )
}
