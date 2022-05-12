import React, { useEffect, useRef, useState } from "react"
import featuredContracts from "./featured-contracts.json"
import { Layout } from ".."
import { init } from "../../near"
import { Link, useNavigate } from "react-router-dom";

export function Home() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [custom, setCustom] = useState<string>()
  const [error, setError] = useState<string>()
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <Layout>
      <h2>NEAR Smart Contract Explorer</h2>
      <p>
        Install:
      </p>
      <pre>
        <code>cargo install raen</code>
      </pre>
      <p>
        This will eventually wrap near-cli, but for now you need it too:
      </p>
      <pre>
        <code>npm install --global near-cli</code>
      </pre>
      <p>
        Build (Rust only; other langs <a href="https://github.com/bytecodealliance/wit-bindgen">coming soon</a>): 
      </p>
      <pre>
        <code>raen build</code>
      </pre>
      <p>
        Deploy as usual:
      </p>
      <pre>
        <code>near deploy</code>
      </pre>
      <p>
        Then enter your contract's account name below:
      </p>
      <form onSubmit={e => {
        e.preventDefault()

        if (!custom) return

        try {
          navigate(init(custom).contract)
        } catch (e: unknown) {
          if (e instanceof Error) {
            setError(e.message)
          } else {
            setError(String(e))
          }
        }
      }}>
        <p>
          <label className="visuallyHidden" htmlFor="customContract">
            Contract Name
          </label>
          <input
            name="customContract"
            value={custom}
            ref={inputRef}
            onChange={e => setCustom(e.target.value)}
          />
          {error && (
            <div className="errorHint">{error}</div>
          )}
        </p>
      </form>
      <p>Or try one of these examples:</p>
      <ul>
        {featuredContracts.map(contract => (
          <li key={contract}>
            <Link to={contract}>{contract}</Link>
          </li>
        ))}
      </ul>
      <h2>How it works: Wasm 💖️ Wit</h2>
      <p>
        <a href="https://github.com/bytecodealliance/wit-bindgen">Wit</a> is an emerging standard to ease interoperability between programs compiled to WebAssembly, aka <a href="https://webassembly.org/">Wasm</a>. (Wit stands for "WebAssembly Interface Types.") Wit will eventually merge with Wasm, allowing all compiled Wasm modules to explain their interfaces to other Wasm modules and their developers.
      </p>
      <p>
        NEAR runs Wasm. Any Wasm language, though Rust has the most mature tooling and documentation.
      </p>
      <p>
        When you build your smart contracts with <code>raen</code>, it injects a full Wit specification for your contract into a Wasm <a href="https://webassembly.github.io/spec/core/appendix/custom.html">Custom Section</a>. It compresses it with <a href="https://www.brotli.org/">brotli</a> to reduce <a href="https://docs.near.org/docs/concepts/storage-staking">storage</a> requirements.
        </p>
      <p>
        How much does this increase your contract size? In our tests so far, contracts compiled with <code>raen</code> end up <strong>smaller</strong> than before!
        </p>
      <p>
        <code>raen</code> uses <a href="https://ahalabs.dev/posts/wit-bringing-types-to-near-contracts"><code>witme</code> to generate the Wit</a> and inject it into the Wasm Custom Section. Under the hood, <code>witme</code> uses <a href="https://github.com/AhaLabs/wasm-walrus-tools">walrus</a>, which optimizes the Wasm enough to reduce the total contract size, even with the Wit. We will add full benchmarks soon.
      </p>
      <p>
        (Note that currently a JSON <a href="https://ajv.js.org/">AJV</a> specification is added to a Wasm Custom Section <em>instead of</em> Wit, since 1. No Wit-to-AJV tooling currently exists for browsers, 2. This admin panel relies on AJV, and 3. No other tooling currently makes use of Wit. The AJV custom section will be swapped for a Wit custom section once Wit settles on an <a href="https://github.com/bytecodealliance/wit-bindgen/issues/214#issuecomment-1116237538">initial syntax version</a>.)
      </p>
      <p>
        This admin panel then reads in that Custom Section, decompresses the brotli, and uses <a href="https://github.com/rjsf-team/react-jsonschema-form">react-jsonschema-form</a> to allow interacting with the contract.
      </p>
    </Layout>
  )
}