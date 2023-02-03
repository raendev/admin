import { useState } from "react"
import { useParams } from "../utils"
import {
  init,
  ContractMethod,
  ContractInterface,
  getSchema,
  SchemaInterface,
} from "../protocols/cw"

type ContractName = string

const stub: CosmWasmInterface = {
  contract: '',
  schema: {},
  methods: [] as ContractMethod[],
} as const

type CosmWasmInterface = ContractInterface & SchemaInterface & { stale?: true }

/**
 * Get `contract` from url params and use it to initialize near connection.
 *
 * If no `contract` in url params, returns blanks
 */
export default function useCosmWasm(): CosmWasmInterface {
  const { cwContract: contract } = useParams()
  if (!contract) return stub
  return { contract, ...getSchema(contract) }
}
