import * as React from "react";
import { useParams } from "react-router-dom"
import { init } from "../../near"
import useNear from "../../hooks/useNear"
import useWindowDimensions from '../../hooks/useWindowDimensions'
import { Form, Layout, NotFound } from ".."

export function Contract() {
  const { schema } = useNear()
  const { isMobile } = useWindowDimensions()
  const { contract, method } = useParams<{ contract: string, method: string }>()
  let errorMessage: string | null = null

  if (!contract) {
    errorMessage = "No `contract` param provided; how is this possible?"
  } else {
    try {
      init(contract)
    } catch (e: unknown) {
      if (e instanceof Error) {
        errorMessage = e.message
      } else {
        errorMessage = String(e)
      }
    }
  }

  if (errorMessage) {
    return (
      <Layout>
        <NotFound>
          {errorMessage}
        </NotFound>
      </Layout>
    )
  }

  if (!schema) {
    return (
      <div style={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100vh',
      }}>
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-l)',
        }}>
          <div className="loader" />
          <div>
            <h1>Loading schema...</h1>
            <p>A one-time thing. Should just take a second.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!method) {
    return (
      <Layout>
        <h1>{contract}</h1>
        <p>
          Inspect <strong>{contract}</strong> using a schema built with <a href="https://raen.dev/admin">RAEN</a> and stored on <a href="https://near.org">NEAR</a>. Select a method from {isMobile ? 'the menu above' : 'the sidebar'} to get started.
        </p>
      </Layout>
    )
  }

  return <Layout><Form /></Layout>
}
