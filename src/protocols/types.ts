import { JSONSchemaType } from "ajv/dist/2019"

// actual JSONSchema seems to always require 'type' (unless multiple libraries
// are malformed), but CosmWasm's variant either uses 'type' XOR 'oneOf'
export type JSONSchema =
  Omit<JSONSchemaType<unknown>, 'type'> |
  Omit<JSONSchemaType<unknown>, 'oneOf'>

export type ContractMethod = {
  title: string
  link: string
}

export interface ContractMethodGroup {
  heading: string
  methods: ContractMethod[]
}
