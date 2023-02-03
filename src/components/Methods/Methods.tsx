import React from "react";
import useNear from '../../hooks/useNear';
import useCosmWasm from '../../hooks/useCosmWasm';
import { Section } from './Section';

export const Methods = () => {
  const { methods: nearMethods } = useNear()
  const { methods: cwMethods } = useCosmWasm()

  // only one of these will have content
  const methods = nearMethods.concat(cwMethods)

  return <>{
    methods.map(contractMethod => (
      <Section key={contractMethod.heading} {...contractMethod} />
    ))
  }</>
}
