import { useParams as useParamsGeneric } from "react-router-dom"

export type Params = {
  nearContract: string
  cwContract: string
  method: string
}

export function useParams(): Readonly<Partial<Params>> {
  return useParamsGeneric<Params>()
}