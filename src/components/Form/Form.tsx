import React, { useEffect, useMemo, useState } from "react";
import FormComponent from "@rjsf/core";
import snake from "to-snake-case";
import { useParams, useSearchParams } from "react-router-dom"
import useNear from "../../hooks/useNear"

import css from "./form.module.css"

type Data = Record<string, any>

type FormData = {
  args: Data
  options?: Data
}

type WrappedFormData = {
  formData?: FormData
}

let mainTitle: string

const Display: React.FC<React.PropsWithChildren<{
  result?: string
  error?: string
}>> = ({ result, error }) => {
  if (!result && !error) return null

  return (
    <>
      <strong style={{ paddingBottom: 5 }}>
        {result ? "Result" : "Error"}:
      </strong>
      <pre className={error && css.error}>
        <code className={css.result}>
          {result ?? error}
        </code>
      </pre>
    </>
  )
}

function encodeData(formData: FormData): { data: string } {
  const data = encodeURIComponent(JSON.stringify(formData))
  return { data }
}

const decodeDataCache: [string | undefined, FormData | undefined] = [undefined, undefined]

/**
 * Parse URL search params for `data` param and decode it using `decodeURIComponent` and `JSON.parse`.
 * @param searchParams URLSearchParams object from `useSearchParams` from `react-router-dom`
 * @returns value of decoded `data` param with exact same object identity as long as param has not changed. This allows using it in React effect dependencies without infinite loops.
 */
function decodeData(searchParams: URLSearchParams): undefined | FormData {
  const entries = Object.fromEntries(searchParams.entries())
  const { data } = entries ?? '{}' as { data?: string }
  if (!data) return undefined
  if (decodeDataCache[0] === data) return decodeDataCache[1]
  decodeDataCache[0] = data
  decodeDataCache[1] = JSON.parse(decodeURIComponent(data))
  return decodeDataCache[1]
}

function allFilled(formData?: FormData, required?: string[]) {
  if (!required) return true
  if (!formData) return false
  return required.reduce(
    (acc, field) => acc && ![undefined, null, ''].includes(formData.args[field]),
    true
  )
}

export function Form() {
  const { wallet, getMethod, getDefinition } = useNear()
  const { contract, method } = useParams<{ contract: string, method: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const formData = decodeData(searchParams)
  const [liveValidate, setLiveValidate] = useState<boolean>(false)
  const [result, setResult] = useState<any>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>()
  const schema = method && getMethod(method)?.schema

  const setFormData = useMemo(() => ({ formData: newFormData }: WrappedFormData) => {
    setSearchParams(
      newFormData ? encodeData(newFormData) : '',
      { replace: true }
    )
  }, [setSearchParams])

  // reset result and error when URL changes
  useEffect(() => {
    setResult(undefined)
    setError(undefined)
  }, [contract, method]);


  const onSubmit = useMemo(() => async ({ formData }: WrappedFormData) => {
    setLoading(true)
    setError(undefined)
    if (!contract || !method) return
    try {
      const res = getDefinition(method)?.contractMethod === 'change'
        ? await wallet?.account().functionCall({
          contractId: contract,
          methodName: snake(method),
          args: formData?.args ?? {},
          ...formData?.options ?? {}
        })
        : await wallet?.account().viewFunction(contract, snake(method), formData?.args)
      setResult(JSON.stringify(res, null, 2));
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? JSON.stringify(e.message, null, 2)
          : JSON.stringify(e)
      )
    } finally {
      setLoading(false)
    }
  }, [contract, getDefinition, method, wallet])

  // update page title based on current contract & method; reset on component unmount
  useEffect(() => {
    mainTitle = mainTitle || document.title
    document.title = `${method ? `${snake(method)} ‹ ` : ''}${contract} ‹ ${mainTitle}`
    return () => { document.title = mainTitle }
  }, [contract, method])

  // at first load, auto-submit if required arguments are fill in
  useEffect(() => {
    if (!method) return
    const def = getDefinition(method)
    if (def?.contractMethod === 'view' && allFilled(formData, def?.properties?.args?.required)) {
      setTimeout(() => onSubmit({ formData }), 100)
    }
    // purposely only re-check this when method changes or when schema fetch completes (wallet becomes defined);
    // don't want to auto-submit while filling in form, but do when changing methods
  }, [wallet, method]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {method && (
        <h1>
          {/* insert <wbr> (word break opportunity) tags after underscores */}
          {snake(method).split('_').map((word, i) => (
            <>
              {i !== 0 && <>_<wbr /></>}
              {word}
            </>
          ))}
        </h1>
      )}
      {schema && (
        <div className="columns" style={{ alignItems: 'flex-start' }}>
          <FormComponent
            key={method /* re-initialize form when method changes */}
            liveValidate={liveValidate}
            schema={schema}
            formData={formData}
            onChange={setFormData}
            onSubmit={onSubmit}
          />
          <label>
            <input
              type="checkbox"
              onChange={e => setLiveValidate(e.target.checked)}
            />
            Live Validation
          </label>
          <div>
            {loading
              ? <div className={css.loader} />
              : <Display result={result} error={error} />
            }
          </div>
        </div>
      )}
    </>
  );
}
