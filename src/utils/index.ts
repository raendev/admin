import { useParams as useParamsGeneric } from "react-router-dom"

export type Params = {
  nearContract: string
  cwContract: string
  method: string
}

export function useParams(): Readonly<Partial<Params>> {
  return useParamsGeneric<Params>()
}

export function prettifyJsonString(input: string): string {
  try {
    return JSON.stringify(JSON.parse(input), null, 2)
  } catch {
    return input
  }
}