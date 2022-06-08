import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  ContractInterface,
  init,
  getSchema,
  getSchemaCached,
  SchemaInterface,
} from "../near"

type ContractName = string

const stub = {
  contract: undefined,
  config: undefined,
  near: undefined,
  wallet: undefined,
  signIn: () => { },
  signOut: () => { },
  schema: undefined,
  changeMethods: [] as string[],
  viewMethods: [] as string[],
  methods: {},
  getMethod: () => undefined,
  getDefinition: () => undefined,
  canCall: () => Promise.resolve([true, undefined] as const),
} as const

type NearInterface = ContractInterface & SchemaInterface & { stale?: true }

/**
 * Get `contract` from url params and use it to initialize near connection.
 *
 * If no `contract` in url params, returns blanks
 */
export default function useNear(): NearInterface | typeof stub {
  const { contract } = useParams<{ contract: ContractName }>()
  const schema = contract && getSchemaCached(contract)
  const [cache, setCache] = useState<Record<ContractName, NearInterface>>(!schema ? {} : {
    [contract]: {
      stale: true,
      ...init(contract),
      ...schema,
    }
  })

  useEffect(() => {
    if (!contract || (cache[contract] && !cache[contract].stale)) return

    (async () => {
      /* First update with schema cached from localStorage while new schema loads from remote endpoint */
      const schema = getSchemaCached(contract)
      if (schema) {
        setCache({
          ...cache,
          [contract]: {
            ...init(contract),
            ...schema,
          }
        })
      }

      setCache({
        ...cache,
        [contract]: {
          ...init(contract),
          ...await getSchema(contract),
        }
      })
    })()
  }, [cache, contract])

  if (!contract) return stub
  return cache[contract] ?? stub
}
