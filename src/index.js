import "./styles/tailwind.css";
import "./styles/index.css";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Web3ReactProvider } from "@web3-react/core";
import App from "./App";
import { getLibrary } from "./wallet";

const baseUrl = document.getElementsByTagName("base")[0].getAttribute("href");
const rootElement = document.getElementById("root");

ReactDOM.render(
  <BrowserRouter basename={baseUrl}>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </BrowserRouter>,
  rootElement
);
