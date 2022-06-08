import React, { useState } from "react";
import css from './section.module.css';
import { Root as Collapsible, Trigger, Content } from '@radix-ui/react-collapsible';
import { Method } from './Method'

export const Section: React.FC<React.PropsWithChildren<{
  heading: string,
  methods: string[]
}>> = ({ heading, methods }) => {
  const [open, setOpen] = useState(true)

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
        {methods.map(method => (
          <Method key={method} method={method} />
        ))}
      </Content>
    </Collapsible>
  )
};

