import { useParams } from "../utils"
import {
  ContractMethodGroup,
  ContractInterface,
  getSchema,
  SchemaInterface,
} from "../protocols/cw"

const stub: CosmWasmInterface = {
  contract: '',
  schema: {},
  methods: [] as ContractMethodGroup[],
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
