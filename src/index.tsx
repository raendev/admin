import React from "react";
import { createRoot } from "react-dom/client";
import { CosmWasmContract, NearContract, Home } from "./components"
import { HashRouter, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import "./styles/global.scss"

const container = document.getElementById("root")

const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <TooltipProvider delayDuration={0}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* keeping NearContract available at root route, for historical support. Not sure it's worth it, tbqh! */}
          <Route path=":nearContract" element={<NearContract />} />
          <Route path=":nearContract/:method" element={<NearContract />} />
          <Route path="near">
            <Route path=":nearContract" element={<NearContract />} />
            <Route path=":nearContract/:method" element={<NearContract />} />
          </Route>
          <Route path="cw">
            <Route path=":cwContract" element={<CosmWasmContract />} />
            <Route path=":cwContract/:method" element={<CosmWasmContract />} />
          </Route>
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
