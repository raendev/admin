import React from "react"
import featuredContracts from "./featured-contracts.json"
import { Logo } from ".."
import { ContractForm } from "./ContractForm"
import { Link } from "react-router-dom";
import css from "./home.module.css"

export function Home() {
  return (
    <>
      <div className={`dark ${css.hero}`}>
        <Logo />
        <div className="container">
          <h1>Raen makes it easy to explore contracts on NEAR.</h1>
          <p className={css.lead}>
            Enter a contract name below (i.e. <strong>v2.tenk.testnet</strong>)
          </p>
          <ContractForm />
        </div>
        <div className={css.wave}>
          <svg width="100%" viewBox="0 0 1440 72" fill="none">
            <path d="M565 26.6842C347.8 -17.7789 104.833 34.9474 0 72L1440 72V0.5C1230.5 28.9211 782.2 71.1474 565 26.6842Z" fill="var(--color)" />
          </svg>
        </div>
      </div>
      <div className={`container ${css.body}`}>
        <h2>Use it</h2>
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
          Deploy:
        </p>
        <pre>
          <code>near deploy --wasmFile target/res/CRATE_NAME.wasm</code>
        </pre>
        <p>
          Then enter your contract's account name above.
        </p>
        <p>Not ready to deploy a contract? Try one of these examples:</p>
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
          <code>raen</code> uses <code>witme</code> <a href="https://ahalabs.dev/posts/wit-bringing-types-to-near-contracts">to generate the Wit</a> and inject it into the Wasm Custom Section. Under the hood, <code>witme</code> uses <a href="https://github.com/AhaLabs/wasm-walrus-tools">walrus</a>, which optimizes the Wasm enough to reduce the total contract size, even with the Wit. We will add full benchmarks soon.
        </p>
        <p>
          (Note that currently a JSON <a href="https://ajv.js.org/">AJV</a> specification is added to a Wasm Custom Section <em>instead of</em> Wit, since 1. No Wit-to-AJV tooling currently exists for browsers, 2. This admin panel relies on AJV, and 3. No other tooling currently makes use of Wit. The AJV custom section will be swapped for a Wit custom section once Wit settles on an <a href="https://github.com/bytecodealliance/wit-bindgen/issues/214#issuecomment-1116237538">initial syntax version</a>.)
        </p>
        <p>
          This admin panel then reads in that Custom Section, decompresses the brotli, and uses <a href="https://github.com/rjsf-team/react-jsonschema-form">react-jsonschema-form</a> to allow interacting with the contract.
        </p>
      </div>
    </>
  )
}
