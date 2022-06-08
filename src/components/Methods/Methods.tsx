import React from "react";
import useNear from '../../hooks/useNear';
import { Section } from './Section';

export const Methods = () => {
  const { changeMethods, viewMethods } = useNear()

  return (
    <>
      {viewMethods.length > 0 && (
        <Section heading="View Methods" methods={viewMethods} />
      )}
      {changeMethods.length > 0 && (
        <Section heading="Change Methods" methods={changeMethods} />
      )}
    </>
  )
}
