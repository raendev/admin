import React, { useEffect, useMemo, useState } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter'
import { anOldHope as dark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { JsonRpcProvider, FinalExecutionStatus, FinalExecutionStatusBasic } from 'near-api-js/lib/providers';
import FormComponent, { WidgetProps } from "@rjsf/core";
// @ts-expect-error untyped boo!
import TextareaWidget from "@rjsf/core/lib/components/widgets/TextareaWidget";
import snake from "to-snake-case";
import { useParams, useSearchParams } from "react-router-dom"
import useNear from "../../hooks/useNear"
import useWindowDimensions from '../../hooks/useWindowDimensions'
import { WithWBRs } from '..'
import css from "./form.module.css"
import './form.scss';

const Textarea = (props: WidgetProps) => (
  <TextareaWidget {...props} options={{rows: 1, ...props.options}} />
)

type Data = Record<string, any>

type FormData = {
  args: Data
  options?: Data
}

type WrappedFormData = {
  formData?: FormData
}

function isBasic(status: FinalExecutionStatusBasic | FinalExecutionStatus): status is FinalExecutionStatusBasic {
  return status === 'NotStarted' ||
    status === 'Started' ||
    status === 'Failure'
}

function hasSuccessValue(obj: {}): obj is { SuccessValue: string } {
  return 'SuccessValue' in obj
}

function prettifyJsonString(input: string): string {
  try {
    return JSON.stringify(JSON.parse(input), null, 2)
  } catch {
    return input
  }
}
function parseResult(result: string): string {
  if (!result) return result
  return prettifyJsonString(
    Buffer.from(result, 'base64').toString()
  )
}

let mainTitle: string

const Display: React.FC<React.PropsWithChildren<{
  result?: string
  error?: string
  tx?: string
  logs?: string[]
}>> = ({ result, error, tx, logs }) => {
  const { config } = useNear()
  if (result === undefined && error === undefined) return null

  return (
    <>
      <h1>{result !== undefined ? "Result" : "Error"}</h1>
      {tx && (
        <p>
          View full transaction details on{' '}
          <a
            rel="noreferrer"
            href={`https://explorer.${config?.networkId}.near.org/transactions/${tx}`}
            target="_blank"
          >NEAR Explorer</a> or{' '}
          <a
            rel="noreferrer"
            href={`https://${config?.networkId === 'testnet' ? 'testnet.' : ''}nearblocks.io/txns/${tx}`}
            target="_blank"
          >nearblocks.io</a>.
        </p>
      )}
      {Boolean(logs?.length || tx) && (
        <h2>Return value</h2>
      )}
      <SyntaxHighlighter
        style={dark}
        language="json"
        children={result ?? error ?? "null"}
        wrapLongLines
      />
      {(logs && logs.length > 0) && (
        <>
          <h2>Logs</h2>
          <ul>
            {logs.map((log, i) =>
              <li key={i}>{log}</li>
            )}
          </ul>
        </>
      )}
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
  const { near, canCall, config, currentUser, getMethod, getDefinition } = useNear()
  const { isMobile } = useWindowDimensions()
  const { contract, method } = useParams<{ contract: string, method: string }>()
  const def = method ? getDefinition(method) : undefined
  const [searchParams, setSearchParams] = useSearchParams()
  const formData = decodeData(searchParams)
  const [result, setResult] = useState<string>()
  const [tx, setTx] = useState<string>()
  const [logs, setLogs] = useState<string[]>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>()
  const [whyForbidden, setWhyForbidden] = useState<string>()
  const schema = method && getMethod(method)?.schema
  const nonReactParams = window.location.search

  useEffect(() => {
    (async () => {
      const user = await currentUser
      if (!user || !config || !nonReactParams) return

      const params = new URLSearchParams(nonReactParams)
      const txHash = params.get('transactionHashes') ?? undefined
      const errMsg = params.get('errorMessage') ?? undefined
      const errCode = params.get('errorCode') ?? undefined

      if (errMsg) setError(decodeURIComponent(errMsg))
      else if (errCode) setError(decodeURIComponent(errCode))
      else if (txHash) {
        const rpc = new JsonRpcProvider(config.nodeUrl)
        const tx = await rpc.txStatus(txHash, user.accountId)
        if (!hasSuccessValue(tx.status)) return undefined
        setResult(parseResult(tx.status.SuccessValue))
        setTx(txHash)
      }
    })()
  }, [config, currentUser, nonReactParams])

  useEffect(() => {
    if (!method) {
      setWhyForbidden(undefined)
    } else {
      (async () => {
        const [, why] = await canCall(method, (await currentUser)?.accountId)
        setWhyForbidden(why)
      })()
    }
  }, [canCall, method, currentUser]);

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
    setTx(undefined)
    setLogs(undefined)
  }, [contract, method]);

  const onSubmit = useMemo(() => async ({ formData }: WrappedFormData) => {
    setLoading(true)
    setResult(undefined)
    setError(undefined)
    setTx(undefined)
    setLogs(undefined)
    if (!near || !contract || !method) return
    try {
      if (getDefinition(method)?.contractMethod === 'view') {
        const account = await near.account(contract)
        const res = await account.viewFunction(
          contract,
          snake(method),
          formData?.args
        )
        setResult(JSON.stringify(res, null, 2));
      } else {
        const user = await currentUser
        if (!user) throw new Error('Forbidden: must sign in')
        const res = await user.functionCall({
          contractId: contract,
          methodName: snake(method),
          args: formData?.args ?? {},
          ...formData?.options ?? {}
        })

        setTx(res?.transaction_outcome?.id)
        setLogs(res?.receipts_outcome.map(receipt => receipt.outcome.logs).flat())

        const status = res?.status
        if (!status) setResult(undefined)
        else if (isBasic(status)) setResult(status)
        else if (status.SuccessValue !== undefined) {
          setResult(parseResult(status.SuccessValue))
        } else if (status.Failure) {
          setResult(`${status.Failure.error_type}: ${status.Failure.error_message}`)
        } else {
          console.error(new Error('RPC response contained no status!'))
          setResult(undefined)
        }
      }
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? prettifyJsonString(e.message)
          : JSON.stringify(e)
      )
    } finally {
      setLoading(false)
    }
  }, [near, contract, getDefinition, method, currentUser])

  // update page title based on current contract & method; reset on component unmount
  useEffect(() => {
    mainTitle = mainTitle || document.title
    document.title = `${method ? `${snake(method)} ‹ ` : ''}${contract} ‹ ${mainTitle}`
    return () => { document.title = mainTitle }
  }, [contract, method])

  // at first load, auto-submit if required arguments are fill in
  useEffect(() => {
    if (!def) return
    if (def.contractMethod === 'view' && allFilled(formData, def.properties?.args?.required)) {
      setTimeout(() => onSubmit({ formData }), 100)
    }
    // purposely only re-check this when method changes or when schema fetch completes;
    // don't want to auto-submit while filling in form, but do when changing methods
  }, [def]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!contract) return null

  if (!method) {
    return (
      <>
        <h1 style={{ margin: 0 }}>
          <WithWBRs word={contract} breakOn="." />
        </h1>
        <p>
          Inspect <strong><WithWBRs word={contract} breakOn="." /></strong> using a schema built with <a href="https://raen.dev/admin">RAEN</a> and stored on <a href="https://near.org">NEAR</a>. Select a method from {isMobile ? 'the menu above' : 'the sidebar'} to get started.
        </p>
      </>
    )
  }

  const hasInputs = def?.contractMethod === 'change' ||
    Object.keys(def?.properties?.args?.properties ?? {}).length > 0
  return (
    <>
      <h1 style={!result || !hasInputs ? { marginLeft: 'auto', marginRight: 'auto', width: '500px' } : { margin: 0 }}>
        <WithWBRs word={snake(method)} />
      </h1>
      {whyForbidden && <p className="errorHint">Forbidden: {whyForbidden}</p>}
      {schema && (
        <div className={`inner-form-wrapper ${hasInputs && result && 'form-and-result'}`}>
          {hasInputs && <FormComponent
            className={css.form}
            key={method /* re-initialize form when method changes */}
            disabled={!!whyForbidden}
            widgets={{ TextWidget: Textarea }}
            uiSchema={{
              'ui:submitButtonOptions': {
                norender: !hasInputs,
                submitText: 'Submit',
                props: {
                  disabled: !!whyForbidden,
                  title: whyForbidden,
                },
              }
            }}
            schema={schema}
            formData={formData}
            onChange={setFormData}
            onSubmit={onSubmit}
          />}
          {result && <div className={`${!hasInputs && 'results-only'} ${hasInputs && result && 'input-and-results'}`}>
            {loading
              ? <div className="loader" />
              : <Display result={result} error={error} tx={tx} logs={logs} />
            }
          </div>}
        </div>
      )}
    </>
  );
}
