import React, { useEffect, useMemo, useState } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter'
import { anOldHope as dark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { JsonRpcProvider, FinalExecutionStatus, FinalExecutionStatusBasic } from 'near-api-js/lib/providers';
import snake from "to-snake-case";
import { useParams } from "react-router-dom"
import useNear from "../../../hooks/useNear"
import useWindowDimensions from '../../../hooks/useWindowDimensions'
import { WithWBRs, JsonSchemaForm, JsonSchemaFormDataWrapped } from '../..'

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

export function Form() {
  const { near, canCall, config, currentUser, getMethod, getDefinition } = useNear()
  const { isMobile } = useWindowDimensions()
  const { contract, method } = useParams<{ contract: string, method: string }>()
  const def = method ? getDefinition(method) : undefined
  const [result, setResult] = useState<string>()
  const [tx, setTx] = useState<string>()
  const [logs, setLogs] = useState<string[]>()
  const [error, setError] = useState<any>()
  const [whyForbidden, setWhyForbidden] = useState<string>()
  const schema = method && getMethod(method)?.schema
  const nonReactParams = window.location.search

  // if redirected back to this page from NEAR Wallet confirmation, check results
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

  // check if current user is allowed to call current method
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

  // reset result and error when URL changes
  useEffect(() => {
    setResult(undefined)
    setError(undefined)
    setTx(undefined)
    setLogs(undefined)
  }, [contract, method]);

  const onSubmit = useMemo(() => async ({ formData }: JsonSchemaFormDataWrapped) => {
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
    }
  }, [near, contract, getDefinition, method, currentUser])

  // update page title based on current contract & method; reset on component unmount
  useEffect(() => {
    mainTitle = mainTitle || document.title
    document.title = `${method ? `${snake(method)} ‹ ` : ''}${contract} ‹ ${mainTitle}`
    return () => { document.title = mainTitle }
  }, [contract, method])

  if (!contract) return null

  if (!method || !schema) {
    return (
      <>
        <h1 style={{ margin: 0 }}>
          <WithWBRs word={contract} breakOn="." />
        </h1>
        {!method && (
          <p>
            Inspect <strong><WithWBRs word={contract} breakOn="." /></strong> using a schema built with <a href="https://raen.dev/admin">RAEN</a> and stored on <a href="https://near.org">NEAR</a>. Select a method from {isMobile ? 'the menu above' : 'the sidebar'} to get started.
          </p>
        )}
        {!schema && (
          <p>
            Cannot load schema for <strong><WithWBRs word={method ?? ''} /></strong> 🤔
          </p>
        )}
      </>
    )
  }

  const hasInputs = def?.contractMethod === 'change' ||
    Object.keys(def?.properties?.args?.properties ?? {}).length > 0

  return (
    <JsonSchemaForm
      title={snake(method)}
      whyForbidden={whyForbidden}
      hideSubmitButton={!hasInputs}
      schema={schema}
      onSubmit={onSubmit}
      autoSubmit={def?.contractMethod === 'view'}
      requiredFields={def?.properties?.args?.required}
    >
      <Display result={result} error={error} tx={tx} logs={logs} />
    </JsonSchemaForm>
  );
}
