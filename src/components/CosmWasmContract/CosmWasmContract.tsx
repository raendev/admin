import { Layout } from ".."
import schema from '../../protocols/cw/cw20-ics20.json';

export function CosmWasmContract() {
  return <Layout showLogin={false}>
    <h1>{schema.contract_name} {schema.contract_version}</h1>
  </Layout>
}
