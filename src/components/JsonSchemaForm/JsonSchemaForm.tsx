import FormComponent, { WidgetProps } from "@rjsf/core";
import { useEffect, useMemo, useState } from "react"
import SyntaxHighlighter from 'react-syntax-highlighter'
import { anOldHope as dark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { useSearchParams } from "react-router-dom"
// @ts-expect-error untyped boo!
import TextareaWidget from "@rjsf/core/lib/components/widgets/TextareaWidget";
import css from "./form.module.css"
import { JSONSchema7 } from "json-schema"
import { WithWBRs } from '..'
import { prettifyJsonString } from "../../utils"

const Textarea = (props: WidgetProps) => (
  <TextareaWidget {...props} options={{ rows: 1, ...props.options }} />
)

type Data = Record<string, any>

export type JsonSchemaFormData = {
  args: Data
  options?: Data
}

export type JsonSchemaFormDataWrapped = {
  formData?: JsonSchemaFormData
}

const decodeDataCache: [string | undefined, JsonSchemaFormData | undefined] = [undefined, undefined]

/**
 * Parse URL search params for `data` param and decode it using `decodeURIComponent` and `JSON.parse`.
 * @param searchParams URLSearchParams object from `useSearchParams` from `react-router-dom`
 * @returns value of decoded `data` param with exact same object identity as long as param has not changed. This allows using it in React effect dependencies without infinite loops.
 */
function decodeData(searchParams: URLSearchParams): undefined | JsonSchemaFormData {
  const entries = Object.fromEntries(searchParams.entries())
  const { data } = entries ?? '{}' as { data?: string }
  if (!data) return undefined
  if (decodeDataCache[0] === data) return decodeDataCache[1]
  decodeDataCache[0] = data
  decodeDataCache[1] = JSON.parse(decodeURIComponent(data))
  return decodeDataCache[1]
}

function encodeData(formData: JsonSchemaFormData): { data: string } {
  const data = encodeURIComponent(JSON.stringify(formData))
  return { data }
}

function allFilled(formData?: JsonSchemaFormData, required?: string[]) {
  if (!required) return true
  if (!formData) return false
  return required.reduce(
    (acc, field) => acc && ![undefined, null, ''].includes(formData.args[field]),
    true
  )
}

export const JsonSchemaForm: React.FC<React.PropsWithChildren<{
  title: string
  schema: JSONSchema7
  onSubmit: (data: JsonSchemaFormDataWrapped) => Promise<void>
  whyForbidden?: string
  hideSubmitButton?: boolean
  /**
   * Whether to try auto-submitting the form. Form will only be auto-submitted if all `requiredFields` are filled.
   */
  autoSubmit?: boolean
  requiredFields?: string[]
}>> = ({
  title,
  whyForbidden,
  hideSubmitButton = false,
  schema,
  onSubmit,
  children,
  autoSubmit = false,
  requiredFields = [],
}) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<any>()
    const [searchParams, setSearchParams] = useSearchParams()
    const formData = decodeData(searchParams)

    const setFormData = useMemo(() => ({ formData: newFormData }: JsonSchemaFormDataWrapped) => {
      setSearchParams(
        newFormData ? encodeData(newFormData) : '',
        { replace: true }
      )
    }, [setSearchParams])

    const onSubmitWrapped = useMemo(() => async ({ formData }: JsonSchemaFormDataWrapped) => {
      setLoading(true)
      setError(undefined)
      try {
        await onSubmit({ formData })
      } catch (e: unknown) {
        setError(
          e instanceof Error
            ? prettifyJsonString(e.message)
            : JSON.stringify(e)
        )
      } finally {
        setLoading(false)
      }
    }, [onSubmit])

    // at first load, auto-submit if required arguments are fill in
    useEffect(() => {
      if (autoSubmit && allFilled(formData, requiredFields)) {
        setTimeout(() => onSubmit({ formData }), 100)
      }
      // purposely only re-check this when method changes or when schema fetch completes;
      // don't want to auto-submit while filling in form, but do when changing methods
    }, [title]) // eslint-disable-line react-hooks/exhaustive-deps


    return (
      <>
        <h1 style={{ margin: 0 }}>
          <WithWBRs word={title} />
        </h1>
        {whyForbidden && <p className="errorHint">Forbidden: {whyForbidden}</p>}
        <FormComponent
          key={title /* rerender when title/method changes */}
          className={css.form}
          disabled={!!whyForbidden}
          widgets={{ TextWidget: Textarea }}
          uiSchema={{
            'ui:submitButtonOptions': {
              norender: hideSubmitButton,
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
          onSubmit={onSubmitWrapped}
        />
        <div style={{ margin: 'var(--spacing-l) 0' }}>
          {loading ? <div className="loader" /> : error ? (
            <>
              <h1>Error:</h1>
              <SyntaxHighlighter
                style={dark}
                language="json"
                children={error}
                wrapLongLines
              />
            </>
          ) : children}
        </div>
      </>
    )
  }
