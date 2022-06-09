import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Root as Collapsible, Trigger, Content } from '@radix-ui/react-collapsible';
import { Method } from './Method'
import css from './section.module.css';

export const Section: React.FC<React.PropsWithChildren<{
  heading: string,
  methods: string[]
}>> = ({ heading, methods }) => {
  const [open, setOpen] = useState(true)
  const { contract, method: currentMethod } = useParams<{ contract: string, method: string }>()

  if (!contract) return null

  return (
    <Collapsible
      open={open}
      className={`${css.section} ${!open && css.closed}`}
    >
      <label>
        <h3>{heading}</h3>
        <Trigger asChild>
          <button
            className={css.chevron}
            onClick={() => setOpen(!open)}
          >
            <span className="visuallyHidden">{open ? 'Collapse section' : 'Expand section'}</span>
          </button>
        </Trigger>
      </label>
      <Content className={css.content} forceMount>
        {methods.map(method =>
          <Method
            key={method}
            method={method}
            contract={contract}
            isCurrentMethod={method === currentMethod}
          />
        )}
      </Content>
    </Collapsible>
  )
};

