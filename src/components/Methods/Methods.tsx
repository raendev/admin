import React, { useState } from "react";
import useNear from '../../hooks/useNear';
import { Section } from './Section';

export const Methods = () => {
  const { changeMethods, viewMethods } = useNear()

  if (!viewMethods && !changeMethods) return null

  return (
    <>
      {viewMethods.length && (
        <Section heading="View Methods" methods={viewMethods} />
      )}
      {changeMethods.length && (
        <Section heading="Change Methods" methods={changeMethods} />
      )}
    </>
  )
}
