import equal from 'fast-deep-equal'
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  ContractInterface,
  init,
  getSchema,
  getSchemaCached,
  SchemaInterface,
} from "../protocols/near"

type ContractName = string

const stub = {
  contract: undefined,
  config: undefined,
  near: undefined,
  currentUser: Promise.resolve(undefined),
  signIn: () => { },
  signOut: () => { },
  schema: undefined,
  changeMethods: [] as string[],
  viewMethods: [] as string[],
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
  const [initialSchema] = useState(getSchemaCached(contract))
  const [cache, setCache] = useState<Record<ContractName, NearInterface>>(
    (!contract || !initialSchema) ? {} : {
      [contract]: {
        stale: true,
        ...init(contract),
        ...initialSchema,
      }
    }
  )

  useEffect(() => {
    if (!contract || (cache[contract] && !cache[contract].stale)) return

    (async () => {
      /* First update with schema cached from localStorage while new schema loads from remote endpoint */
      const schema = getSchemaCached(contract)
      if (schema && (!initialSchema || initialSchema.loadedAt !== schema.loadedAt)) {
        setCache({
          ...cache,
          [contract]: {
            ...init(contract),
            ...schema,
          }
        })
      }

      const freshSchema = await getSchema(contract)
      if (!equal(freshSchema.schema, schema?.schema)) {
        setCache({
          ...cache,
          [contract]: {
            ...init(contract),
            ...freshSchema,
          }
        })
      }
    })()
  }, [initialSchema, cache, contract])

  if (!contract) return stub
  return cache[contract] ?? stub
}
