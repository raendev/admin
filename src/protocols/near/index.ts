import * as naj from "near-api-js"

// TODO: remove pending https://github.com/near/near-api-js/issues/757
import { Buffer } from "buffer"
if (typeof window !== "undefined") window.Buffer = Buffer
if (typeof global !== "undefined") global.Buffer = Buffer

export * from './schema'
export * from '../types'

const mainnetConfig = {
  networkId: "mainnet",
  nodeUrl: "https://rpc.mainnet.near.org",
  walletUrl: "https://wallet.near.org",
  helperUrl: "https://helper.mainnet.near.org",
} as const

const testnetConfig = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
} as const

export class UnknownNetworkError extends Error {
  constructor(contract: string) {
    super(
      `Don't know what network settings to use for contract "${contract}". ` +
      `Expected name to end in 'testnet' or 'near'.`
    )
    this.name = 'UnknownNetworkError'
  }
}

type ContractName = string

export interface ContractInterface {
  contract: string,
  config: typeof testnetConfig | typeof mainnetConfig
  near: naj.Near
  currentUser: Promise<undefined | naj.ConnectedWalletAccount>
  signIn: () => void
  signOut: () => void
}

const cache: Record<ContractName, ContractInterface> = {}

/**
 * Get config, NEAR object, wallet connection, and signIn function given a
 * contract account name/id.
 *
 * Memoizes return values so that same object references are always returned for
 * a given contract, so React won't rerender needlessly.
 *
 * @param contract Contract account id/name to sign in against
 */
export function init(contract: string): ContractInterface {
  if (cache[contract]) return cache[contract]

  const config = /near$/.test(contract)
    ? mainnetConfig
    : /testnet$/.test(contract) || /dev-[0-9]+-[0-9]+/.test(contract)
      ? testnetConfig
      : undefined

  if (!config) throw new UnknownNetworkError(contract)

  const near = new naj.Near({
    ...config,
    keyStore: typeof window === "undefined"
      ? new naj.keyStores.InMemoryKeyStore()
      : new naj.keyStores.BrowserLocalStorageKeyStore()
  })

  const wallet = new naj.WalletConnection(near)

  /**
   * Only return current user if they're authenticated against the given contract.
   *
   * Put another way, make sure that current browser session has a FunctionCall
   * Access Key that allows it to call the given `contract` on behalf of the
   * current user.
   *
   * @param contract The address of a NEAR contract
   * @returns `wallet.account()` if authenticated against given `contract`
   */
  async function getCurrentUser(contract: string): Promise<undefined | naj.ConnectedWalletAccount> {
    // Use `setTimeout` with no wait time to give the current process time to
    // finish, and execute the rest of this function at the next tick. This
    // gives NAJ time to finish setting the new key to localStorage after a
    // round-trip to NEAR Wallet.
    await new Promise<void>(res => setTimeout(() => res()))

    if (!wallet.getAccountId()) return undefined

    const currentUser = wallet.account()

    // `findAccessKey` ignores the provided `contract` and returns whatever key is in localStorage
    const key = await currentUser.findAccessKey(contract, [])

    if (!key || !key.accessKey) return undefined

    // FullAccess keys don't provide info about what contract they target, so we
    // need to assume the worst. This should never happen for this app, though.
    if (key.accessKey.permission === 'FullAccess') return undefined

    return contract === key.accessKey.permission.FunctionCall.receiver_id
      ? currentUser
      : undefined
  }

  function signIn() {
    wallet.signOut()
    wallet.requestSignIn({ contractId: contract })
  }

  function signOut() {
    wallet.signOut()
    window.location.reload()
  }

  cache[contract] = {
    contract,
    config,
    near,
    currentUser: getCurrentUser(contract),
    signIn,
    signOut,
  }

  return cache[contract]
}

