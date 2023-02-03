import { ContractMethod, JSONSchema } from '../types'
import cw20Schema from './cw20-ics20.json'

export interface SchemaInterface {
  schema: JSONSchema
  methods: ContractMethod[],
}

export function getSchema(contract?: string): SchemaInterface {
  const schema = cw20Schema
  return buildInterface(schema)
}

// type CosmWasmSchema = any
interface CosmWasmSchema {
  contract_name: string
  contract_version: string
  idl_version: string
  instantiate: JSONSchema
  execute: JSONSchema | null
  migrate: JSONSchema | null
  query: JSONSchema | null
  sudo: JSONSchema | null
  responses: Record<string, JSONSchema>
}

function buildInterface(schema: CosmWasmSchema): SchemaInterface {
  const methods: ContractMethod[] = []

  methods.push({ label: 'initialize' })

  methods.push({
    label: "Query",
    methods: schema.query?.oneOf
      .map((m: JSONSchema) => m.properties)
      .map((p: JSONSchema) => {
        if (Object.keys(p).length > 1) {
          throw new Error(
            'Expected `schema.query.oneOf` values to each have a `properties` key with only one key!'
          );
        }
        return Object.keys(p)
      })
      .flat()
  })

  methods.push({
    label: 'Execute',
    methods: Object.keys(schema.execute?.definitions)
      .filter(d => d.match(/Msg$/)).map(d => d.replace(/Msg$/, ''))
  })

  return {
    schema,
    methods,
  }
}
