export * from './schema'
export * from '../types'

type ContractName = string

export interface ContractInterface {
  contract: string,
}

const cache: Record<ContractName, ContractInterface> = {}

/**
 * Get contract data given a contract account name/id.
 *
 * Memoizes return values so that same object references are always returned for
 * a given contract, so React won't rerender needlessly.
 *
 * @param contract Contract account id/name to sign in against
 */
export function init(contract: string): ContractInterface {
  if (cache[contract]) return cache[contract]

  cache[contract] = {
    contract,
  }

  return cache[contract]
}