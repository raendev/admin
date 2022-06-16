import React from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import css from "./dropdown.module.css"

export const Dropdown: React.FC<React.PropsWithChildren<{
  trigger: React.ReactElement
  items: DropdownMenu.MenuItemProps[]
}>> = ({ trigger, items }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={css.trigger} asChild>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={css.content}>
          {items.map(({ className, ...props }, i) => (
            <DropdownMenu.Item
              key={i}
              className={`${css.item} ${className}`}
              {...props}
            />
          ))}
          <DropdownMenu.Arrow className={css.arrow} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
