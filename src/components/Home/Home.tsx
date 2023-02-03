import React from "react"
import featuredContracts from "./featured-contracts.json"
import { Logo } from ".."
import { ContractNameForm, WithWBRs } from ".."
import { Link } from "react-router-dom";
import css from "./home.module.css"
import Markdown from "react-markdown"

export function Home() {
  return (
    <>
      <div className={`bokeh ${css.hero}`}>
        <div className={css.logo}>
          <Logo />
        </div>
        <div className="container">
          <h1>RAEN makes it easy to explore contracts on NEAR.</h1>
          <p className={css.lead}>
            Enter a contract name below (i.e. <Link to="/near/counter.raendev.testnet">counter.raendev.testnet</Link>)
          </p>
          <ContractNameForm autoFocus />
        </div>
        <div className={css.wave}>
          <svg width="100%" viewBox="0 0 1440 72" fill="none">
            <path d="M565 26.6842C347.8 -17.7789 104.833 34.9474 0 72L1440 72V0.5C1230.5 28.9211 782.2 71.1474 565 26.6842Z" fill="var(--color)" />
          </svg>
        </div>
      </div>
      <div className={`container ${css.body}`}>
        <div className="responsiveVideoWrap">
          <iframe src="https://www.youtube-nocookie.com/embed/m5dOyaKp18Y" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </div>
        <h2 style={{ paddingTop: 'var(--spacing-l)' }}>Try it</h2>
        <p>Poke at one of these examples:</p>
        <ul>
          {featuredContracts.map(([contract, description]) => (
            <li key={contract}>
              <h3>
                <Link to={`/near/${contract}`}>
                  <WithWBRs word={contract} breakOn="." />
                </Link>
              </h3>
              <Markdown>{description}</Markdown>
            </li>
          ))}
        </ul>
        <p>And learn to use it with <strong><a href="https://raen.dev/guide">✨ The Guide ✨</a></strong></p>
        <p>Curious how it works? Want to report bugs or feature requests? Visit the repositories on GitHub: <a href="https://github.com/raendev/raen">RAEN CLI</a> & <a href="https://github.com/raendev/admin">this website</a>.</p>
      </div>
    </>
  )
}
