import React from "react";
import useNear from '../../hooks/useNear';
import { Section } from './Section';

export const Methods = () => {
  const { methods } = useNear()

  return <>{
    methods.map(({ label, methods }) => (
      <Section heading={label} methods={methods} />
    ))
  }</>
}
