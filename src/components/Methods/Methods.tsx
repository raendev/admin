import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toSnake from "to-snake-case";
import useNear from '../../hooks/useNear';
import { Section } from './Section';
import { Root as Tooltip, Trigger, Content, Arrow } from '@radix-ui/react-tooltip';
import css from './methods.module.css';

type Items = {
  'Change Methods'?: JSX.Element[]
  'View Methods': JSX.Element[]
}

export const Methods = () => {
  const {
    canCall,
    changeMethods,
    contract,
    getDefinition,
    viewMethods,
    wallet,
  } = useNear()
  const { method: currentMethod } = useParams<{ contract: string, method: string }>()
  const [items, setItems] = useState<Items>()
  const user = wallet?.getAccountId() as string

  const toItem = useMemo(() => (camel: string) => {
    const snake = toSnake(camel)
    const allow = getDefinition(camel)?.allow

    const Tip = allow && (
      <Tooltip>
        <Trigger asChild>
          <span className={`visuallyHidden ${css.crown}`}>restricted</span>
        </Trigger>
        <Content>
          <div className={css.restrictedTo}>Restricted to: </div>
          <div>{allow.join(', ')}</div>
          <Arrow />
        </Content>
      </Tooltip>
    )

    if (currentMethod === camel) {
      return <div key={camel}>{snake}{Tip}</div>
    }

    return <Link to={`/${contract}/${camel}`} key={camel}>{snake}{Tip}</Link>
  }, [contract, currentMethod, getDefinition])

  useEffect(() => {
    (async () => {
      const itemsPartial: Items = { 'View Methods': viewMethods.map(toItem) }

      if (contract && user) {
        const allowed = await Promise.all(
          changeMethods.map(method => canCall(method, user))
        )

        const filteredChangeMethods = changeMethods.filter((_, i) => allowed[i])

        if (filteredChangeMethods.length > 0) {
          itemsPartial['Change Methods'] = filteredChangeMethods.map(toItem)
        }
      }

      setItems(itemsPartial)
    })()
  }, [contract, canCall, viewMethods, changeMethods, user, toItem]);

  if (!items) return null

  return (
    <>
      {Object.entries(items).map(([heading, methods]) => (
        <Section key={heading} heading={heading} methods={methods} />
      ))}
    </>
  )
}
