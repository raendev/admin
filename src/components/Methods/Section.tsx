import React, { useState } from "react";
import { useParams } from "../../utils";
import { Root as Collapsible, Trigger, Content } from '@radix-ui/react-collapsible';
import { Method } from './Method'
import css from './section.module.css';

/**
 * A collapsible Sidebar section. Normally, you need to pass both a `heading`
 * and `methods`, and all the methods will be nested under the `heading`. But!
 * You can also pass JUST a `heading`, and it will be rendered AS a method, for
 * methods that don't fit in any particular category.
 */
export const Section: React.FC<React.PropsWithChildren<{
  heading: string,
  methods?: string[]
}>> = ({ heading, methods }) => {
  const [open, setOpen] = useState(true)
  const { nearContract, cwContract, method: currentMethod } = useParams()
  const contract = nearContract ?? cwContract

  if (!contract) return null

  // can pass only heading to render it as a Method
  if (!methods) {
    return (
      <Method
        contract={contract}
        isCurrentMethod={heading === currentMethod}
        method={heading}
        protocol={nearContract ? 'near' : 'cw'}
      />
    )
  }

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
            contract={contract}
            isCurrentMethod={method === currentMethod}
            method={method}
            protocol={nearContract ? 'near' : 'cw'}
          />
        )}
      </Content>
    </Collapsible>
  )
};

