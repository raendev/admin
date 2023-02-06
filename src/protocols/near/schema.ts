import * as naj from "near-api-js"
import { init } from "."
import { readCustomSection } from "wasm-walrus-tools"
import { ContractCodeView } from "near-api-js/lib/providers/provider"
import * as localStorage from '../../utils/localStorage'
import { ContractMethodGroup, JSONSchema } from '../types'

const fetchSchemaCache: Record<string, Promise<JSONSchema>> = {}

export async function fetchSchema(contract: string): Promise<JSONSchema> {
  const cacheKey = `fetchSchema:${contract}`

  fetchSchemaCache[cacheKey] = fetchSchemaCache[cacheKey] ?? (async () => {
    const { near } = init(contract)

    // TODO handle either HTTP endpoint or IPFS hash
    const urlOrData = await fetchJsonAddressOrData(contract, near)

    // TODO cache schema JSON in localeStorage, return early here if available

    if (urlOrData.startsWith("https://")) {
      const schema = await fetch(urlOrData)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
          return response.json()
        })
      localStorage.set(contract, schema)
      return schema;
    }

    const schema = JSON.parse(urlOrData)
    localStorage.set(contract, schema)

    // TODO validate schema adheres to JSONSchema
    return schema
  })()

  const schema = await fetchSchemaCache[cacheKey]

  return schema
}

class NoCustomSection extends Error {
  constructor() {
    super("Contract Wasm does not have a custom section called \"json\"")
  }
}

class DecompressionFailure extends Error {
  constructor() {
    super("Failed to decompile custom section")
  }
}

async function fetchJsonAddressOrData(contract: string, near: naj.Near): Promise<string> {
  const code = await near.connection.provider.query({
    account_id: contract,
    finality: 'final',
    request_type: 'view_code',
  }) as ContractCodeView
  const wasm = Buffer.from(code.code_base64, "base64")
  const jsonCustomSection = await readCustomSection(wasm, "json")
  if (!jsonCustomSection) {
    throw new NoCustomSection()
  }

  let startOfJson = Buffer.from(jsonCustomSection.slice(0, 20)).toString('utf8');
  // if link return string
  if (startOfJson.startsWith("https://")) {
    return Buffer.from(jsonCustomSection).toString('utf8');
  }
  // Else is compressed data
  const brotli = await import("brotli-dec-wasm");
  let decompressedData = brotli.brotliDec(jsonCustomSection);

  if (!decompressedData) {
    throw new DecompressionFailure()
  }
  return Buffer.from(decompressedData).toString("utf8");
}

function hasContractMethodProperty(obj: {}): obj is { contractMethod: "change" | "view" } {
  return 'contractMethod' in obj
}

function hasAllowProperty(obj: {}): obj is { allow: string[] } {
  return 'allow' in obj
}

type MethodDefinition = {
  additionalProperties?: boolean
  contractMethod?: "view" | "change"
  allow?: string[]
  properties?: {
    args: {
      additionalProperties: boolean
      properties: Record<string, JSONSchema>
      required?: string[]
      type?: string
    }
    options?: {
      additionalProperties: boolean
      properties: Record<string, JSONSchema>
      required?: string[]
      type?: string
    }
  },
  required?: string[]
  type?: string
}

export interface SchemaInterface {
  schema: JSONSchema
  methods: ContractMethodGroup[],
  getMethod: (methodName: string | undefined) => JSONSchema | undefined
  getDefinition: (methodName: string) => MethodDefinition | undefined
  /**
   * Check if given method can be called by an account.
   * 
   * Assumes the method has an `allow` field specifying accounts and methods in
   * the following format:
   * 
   *     allow: [
   *       'ahalabs.near',
   *       '::owner',
   *       '::admins',
   *       '::dao.ahalabs.near::council'
   *     ]
   * 
   * Someday there will be an SDK macro that makes adding this easy. For now,
   * contracts can include comments above the method in the proper format, and
   * witme will generate the schema with the above `allow` structure. Here's the
   * proper comment format for a Rust contract:
   * 
   *     /// @allow ["::admins", "::owner"]
   *     pub fn some_method(&mut self, ...)
   * 
   * @param method string Method of contract to check permissions for
   * @param account string Account name that may or may not be allowed to call `method` on `contract`
   * @returns [boolean, string] boolean is true of `account` can call `method` on `contract`, false if not. string contains reason why user is forbidden.
   */
  canCall: (method: string, account?: string) => Promise<readonly [boolean, string | undefined]>
}

type InMemoryCachedSchema = SchemaInterface & {
  loadedAt: number
};

const inMemorySchemaCache: Record<string, InMemoryCachedSchema | undefined> = {}

export function getSchemaCached(contract?: string): undefined | InMemoryCachedSchema {
  if (!contract) return undefined
  if (inMemorySchemaCache[contract]) return inMemorySchemaCache[contract]
  const schema = localStorage.get(contract) as JSONSchema | undefined
  if (!schema) return undefined
  inMemorySchemaCache[contract] = {
    loadedAt: new Date().getTime(),
    ...buildInterface(contract, schema),
  };
  return inMemorySchemaCache[contract]
}

export async function getSchema(contract: string): Promise<SchemaInterface> {
  const schema = await fetchSchema(contract)
  return buildInterface(contract, schema)
}

const canCallCache: Record<string, Promise<string | string[]>> = {}

function buildInterface(contract: string, schema: JSONSchema): SchemaInterface {
  const { near } = init(contract)

  function hasContractMethod(m: string, equalTo?: "change" | "view"): boolean {
    const def = schema?.definitions?.[m]
    if (!def) return false
    const hasField = hasContractMethodProperty(def)
    if (!hasField) return false
    if (!equalTo) return true
    return def.contractMethod === equalTo
  }

  const changeMethods = Object.keys(schema?.definitions ?? {}).filter(m =>
    hasContractMethod(m, "change")
  ) as string[]

  const viewMethods = Object.keys(schema?.definitions ?? {}).filter(m =>
    hasContractMethod(m, "view")
  ) as string[]

  const methods: ContractMethodGroup[] = []

  if (viewMethods.length) {
    methods.push({
      heading: "View Methods",
      methods: viewMethods.map(m => ({
        title: m,
        link: m,
      })),
    })
  }

  if (changeMethods.length) {
    methods.push({
      heading: "Change Methods",
      methods: changeMethods.map(m => ({
        title: m,
        link: m,
      })),
    })
  }

  function getMethod(m?: string | undefined): JSONSchema | undefined {
    if (!m) return undefined
    if (!hasContractMethod(m)) return undefined
    return {
      $ref: `#/definitions/${m}`,
      ...schema,
    }
  }

  function getDefinition(m?: string): MethodDefinition | undefined {
    if (!m) return undefined
    const def = schema?.definitions?.[m]
    if (!def) return undefined
    if (!hasContractMethodProperty(def)) return undefined
    return def as MethodDefinition
  }

  async function canCall(method: string, account?: string): Promise<readonly [false, string]>;
  async function canCall(method: string, account?: string): Promise<readonly [true, undefined]>;
  async function canCall(method: string, account?: string): Promise<readonly [boolean, string | undefined]> {
    const def = getDefinition(method)

    if (!def || !def.contractMethod) return [false, `No method "${method}" exists for contract "${contract}"`]

    if (def.contractMethod === 'view') return [true, undefined]

    if (!account) return [false, 'Must sign in']

    const hasField = hasAllowProperty(def)

    // if no `allows` field, then anyone can call this method; return true
    if (!hasField) return [true, undefined]

    const inRestrictedGroup = (await Promise.all(def.allow.map(async accountOrMethod => {
      // if `allow` value doesn't start with `::`, then it's a literal account name
      if (accountOrMethod.slice(0, 2) !== '::') {
        return accountOrMethod === account
      }
      // if only has a `::` at beginning, is the name of a method in `contract`
      if (accountOrMethod.split('::').length === 2) {
        const [, method] = accountOrMethod.split('::')
        const accountObj = await near.account(contract);

        canCallCache[accountOrMethod] = canCallCache[accountOrMethod] ?? (async () => {
          return accountObj.viewFunction(contract, method)
        })();

        // TODO check that res is a string or an array of strings
        const res = await canCallCache[accountOrMethod]
        const accounts = Array.from(res)

        return accounts.includes(account)
      }
      const [, contractName, method] = accountOrMethod.split('::')
      const accountObj = await near.account(contractName);

      canCallCache[accountOrMethod] = canCallCache[accountOrMethod] ?? (async () => {
        return accountObj.viewFunction(contractName, method)
      })();

      // TODO check that res is a string or an array of strings
      const res = await canCallCache[accountOrMethod]
      const accounts = Array.from(res)

      return accounts.includes(account)
    }))).reduce((acc, inGroup) => acc || inGroup, false)

    const restrictedTo = def.allow.map((group, i) => {
      const suffix = def.allow.length - 1 === i
        ? ''
        : def.allow.length - 2 === i
          ? ' & '
          : ', '
      return group.replace(/^::/, '') + suffix
    }).join('')

    return inRestrictedGroup
      ? [true, undefined]
      : [false, `Only callable by ${restrictedTo}`]
  }

  return {
    schema,
    methods,
    getMethod,
    getDefinition,
    canCall,
  }
}
