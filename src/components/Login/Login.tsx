import * as React from "react"
import useNear from "../../hooks/useNear"
import { Dropdown } from ".."

export function Login() {
  const { wallet, signIn, signOut } = useNear()

  if (!wallet) return null

  const currentUser = wallet.getAccountId()

  if (currentUser) return (
    <Dropdown
      trigger={currentUser}
      items={[{ children: "Sign Out", onSelect: signOut }]}
    />
  )

  return <button onClick={signIn}>Sign In</button>
}
