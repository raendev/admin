import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import css from './section.module.css';
import { Root as Collapsible, Trigger, Content } from '@radix-ui/react-collapsible';

export const Section: React.FC<React.PropsWithChildren<{
  heading: string,
  methods: (readonly [string, JSX.Element])[]
}>> = ({ heading, methods }) => {
  const [open, setOpen] = useState(true)
  const { contract, method: currentMethod } = useParams<{ contract: string, method: string }>()

  if (!methods.length) return null

  return (
    <Collapsible
      open={open}
      className={`${css.section} ${!open && css.closed}`}
    >
      <header>
        <h3>{heading}</h3>
        <Trigger asChild>
          <button
            className={css.chevron}
            onClick={() => setOpen(!open)}
          >
            <span className="visuallyHidden">{open ? 'close' : 'open'}</span>
          </button>
        </Trigger>
      </header>
      <Content className={css.content} forceMount>
        {methods.map(([method, element]) => {
          if (currentMethod === method) {
            return <div key={method}>{element}</div>
          }

          return (
            <Link key={method} to={`/${contract}/${method}`}>
              {element}
            </Link>
          )
        })}
      </Content>
    </Collapsible>
  )
};

