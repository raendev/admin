import React, { useEffect, useMemo, useState } from "react";
import toSnake from "to-snake-case";
import useNear from '../../hooks/useNear';
import { Section } from './Section';
import { Root as Tooltip, Trigger, Content, Arrow } from '@radix-ui/react-tooltip';
import { Crown } from './Crown'
import css from './methods.module.css';

type Items = {
  'Change Methods': (readonly [string, JSX.Element])[]
  'View Methods': (readonly [string, JSX.Element])[]
}

export const Methods = () => {
  const {
    canCall,
    changeMethods,
    getDefinition,
    viewMethods,
    wallet,
  } = useNear()
  const [items, setItems] = useState<Items>()
  const user = wallet?.getAccountId() as string

  const toItem = useMemo(() => async (camel: string) => {
    const snake = toSnake(camel)
    const restrictedTo = getDefinition(camel)?.allow
    const allowed = await canCall(camel, user)

    const Tip = restrictedTo && (
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
            {restrictedTo
              .map(x => x.replace(/^::/, ''))
              .join(', ')}
          </div>
          <Arrow />
        </Content>
      </Tooltip>
    )

    return [
      camel,
      <span className={allowed ? undefined : css.forbidden}>
        {snake}
        {Tip}
      </span>
    ] as const
  }, [canCall, getDefinition, user])

  useEffect(() => {
    (async () => {
      setItems({
        'View Methods': await Promise.all(viewMethods.map(toItem)),
        'Change Methods': await Promise.all(changeMethods.map(toItem)),
      })
    })()
  }, [viewMethods, changeMethods, toItem]);

  if (!items) return null

  return (
    <>
      {Object.entries(items).map(([heading, methods]) => (
        <Section
          key={heading}
          heading={heading}
          methods={methods}
        />
      ))}
    </>
  )
}
