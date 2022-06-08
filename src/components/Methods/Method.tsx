import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useNear from '../../hooks/useNear';
import css from './methods.module.css';

export const Method: React.FC<React.PropsWithChildren<{
  method: string,
  element: JSX.Element,
}>> = ({ method, element }) => {
  const { canCall, wallet } = useNear()
  const user = wallet?.getAccountId() as string
  const [allowed, setAllowed] = useState<boolean>(true)
  const [whyForbidden, setWhyForbidden] = useState<string>()
  const { contract, method: currentMethod } = useParams<{ contract: string, method: string }>()

  useEffect(() => {
    canCall(method, user).then(can => {
      setAllowed(can[0])
      setWhyForbidden(can[1] || undefined)
    })
  }, [method, user, canCall])

  if (currentMethod === method) {
    return <div>{element}</div>
  }

  return (
    <Link
      to={`/${contract}/${method}`}
      onClick={() => {
        // clear any params set by NEAR Wallet when navigating to new method
        window.history.pushState(null, '',
          window.location.href.replace(window.location.search, '')
        )
      }}
      className={allowed ? undefined : css.forbidden}
      title={allowed ? undefined : `Forbidden: ${whyForbidden}`}
    >
      {element}
    </Link>
  )
}
