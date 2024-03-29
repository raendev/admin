import React, { useEffect, useState } from "react";
import snake from "to-snake-case";
import { Link } from "react-router-dom";
import { Root as Tooltip, Portal, Trigger, Content, Arrow } from '@radix-ui/react-tooltip';
import useNear from '../../hooks/useNear';
import { ContractMethod } from '../../protocols/types'
import css from './methods.module.css';
import { Crown } from './Crown'

const Tip: React.FC<{ method: ContractMethod }> = ({ method }) => {
  const { getDefinition } = useNear()
  const [restrictedTo, setRestrictedTo] = useState<string>()

  useEffect(() => {
    setRestrictedTo(
      getDefinition(method.title)?.allow
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
      <Portal>
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
      </Portal>
    </Tooltip>
  )
};

export const Method: React.FC<{
  contract?: string
  isCurrentMethod: boolean
  method: ContractMethod
  protocol: 'near' | 'cw'
}> = ({ contract, isCurrentMethod, method, protocol }) => {
  const { canCall, currentUser } = useNear()
  const [allowed, setAllowed] = useState<boolean>(true)
  const [whyForbidden, setWhyForbidden] = useState<string>()

  useEffect(() => {
    (async () => {
      const user = await currentUser
      canCall(method.title, user?.accountId).then(can => {
        setAllowed(can[0])
        setWhyForbidden(can[1] || undefined)
      })
    })()
  }, [method, currentUser, canCall])

  if (isCurrentMethod) {
    return (
      <div
        className={allowed ? undefined : css.forbidden}
        title={allowed ? undefined : `Forbidden: ${whyForbidden}`}
      >
        {snake(method.title)}
        <Tip method={method} />
      </div>
    )
  }

  return (
    <Link
      aria-controls="mainContent"
      to={`/${protocol}/${contract}/${method.link}`}
      onClick={() => {
        // clear any params set by NEAR Wallet when navigating to new method
        window.history.pushState(null, '',
          window.location.href.replace(window.location.search, '')
        )
      }}
      className={allowed ? undefined : css.forbidden}
      title={allowed ? undefined : `Forbidden: ${whyForbidden}`}
    >
      {snake(method.title)}
      <Tip method={method} />
    </Link>
  )
}
