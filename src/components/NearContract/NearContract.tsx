import * as React from "react";
import { useParams } from "../../utils"
import { init } from "../../protocols/near"
import useNear from "../../hooks/useNear"
import { Layout, NotFound } from ".."
import { Form } from "./Form/Form"

export function NearContract() {
  const { schema } = useNear()
  const { nearContract } = useParams()
  let errorMessage: string | null = null

  if (!nearContract) {
    errorMessage = "No `nearContract` param provided; how is this possible?"
  } else {
    try {
      init(nearContract)
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

  return <Layout><Form /></Layout>
}
