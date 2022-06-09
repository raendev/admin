import React, { useEffect, useState } from "react";
import snake from "to-snake-case";
import { Link } from "react-router-dom";
import { Root as Tooltip, Trigger, Content, Arrow } from '@radix-ui/react-tooltip';
import useNear from '../../hooks/useNear';
import css from './methods.module.css';
import { Crown } from './Crown'

const Tip: React.FC<{ method: string }> = ({ method }) => {
  const { getDefinition } = useNear()
  const [restrictedTo, setRestrictedTo] = useState<string>()

  useEffect(() => {
    setRestrictedTo(
      getDefinition(method)?.allow
        ?.map(x => x.replace(/^::/, ''))
        ?.join(', ')
    )
  }, [getDefinition, method])

  if (!restrictedTo) return null

  return (
    <Tooltip>
      <Trigger asChild>
        <span className={css.crown}>
          <span className="visuallyHidden">Restricted</span>
          <Crown />
        </span>
      </Trigger>
      <Content className="tooltip">
        <div className={css.restrictedTo}>
          <span>Restricted to:</span>
          <Crown fill="var(--gray-6)" />
        </div>
        <div>
          {restrictedTo}
        </div>
        <Arrow />
      </Content>
    </Tooltip>
  )
};

export const Method: React.FC<{
  method: string
  contract?: string
  isCurrentMethod: boolean
}> = ({ method, contract, isCurrentMethod }) => {
  const { canCall, wallet } = useNear()
  const user = wallet?.getAccountId() as string
  const [allowed, setAllowed] = useState<boolean>(true)
  const [whyForbidden, setWhyForbidden] = useState<string>()

  useEffect(() => {
    canCall(method, user).then(can => {
      setAllowed(can[0])
      setWhyForbidden(can[1] || undefined)
    })
  }, [method, user, canCall])


  if (isCurrentMethod) {
    return (
      <div>
        {snake(method)}
        <Tip method={method} />
      </div>
    )
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
      {snake(method)}
      <Tip method={method} />
    </Link>
  )
}
