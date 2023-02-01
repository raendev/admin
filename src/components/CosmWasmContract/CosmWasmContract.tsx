import { Layout } from ".."
import SyntaxHighlighter from 'react-syntax-highlighter'
import { anOldHope as dark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import schema from '../../protocols/cw/cw20-ics20.json';

export function CosmWasmContract() {
  return <Layout showLogin={false}>
    <h1>Example CW Schema</h1>
    <p>
      Taken from <a href="https://github.com/CosmWasm/cw-plus">cw-plus</a> contract {schema.contract_name} v{schema.contract_version}
    </p>
    <p>Raw Schema, generated with <code>cargo schema</code>:</p>
    <SyntaxHighlighter
      style={dark}
      language="json"
      children={JSON.stringify(schema, null, 2)}
      wrapLongLines
    />
  </Layout>
}
