import React, { useState } from "react";
import { initWeb3 } from "../utils.js";
import cx from "classnames";
import { useEffect } from "react/cjs/react.production.min";
import Button from "./common/Button.js";
import Modal from "./common/Modal.js";
import ConnectModal from "./common/ConnectModal.js";
import { useWeb3React } from "@web3-react/core";

const Header = () => {
  const { library, chainId, account, activate, deactivate, active } =
    useWeb3React();
  const [network, setNetwork] = useState(undefined);
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [verified, setVerified] = useState();
  const [onOpen, onClose] = useState(false);
  const [error, setError] = useState(false);

  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
    setNetwork("");
    setMessage("");
    setSignature("");
    setVerified(undefined);
  };

  const disconnect = () => {
    refreshState();
    deactivate();
  };

  function truncate(str) {
    return str.length > 0
      ? str.substr(0, 4) + "..." + str.substr(str.length - 4, str.length - 1)
      : str;
  }

  return (
    <>
      <header className="container px-4 mx-auto py-4">
        <div className="flex flex-row justify-between items-center w-full">
          <div>
            <a href="https://fstaking.github.io/">
              <img
                src="/images/full-logo.png"
                width="180"
                className="cursor-pointer"
                alt="FStaking"
              />
            </a>
          </div>
          {!active ? (
            <Button
              onClick={() => {
                onClose(true);
              }}
            >
              Connect Wallet
            </Button>
          ) : (
            <Button onClick={disconnect}>{truncate(account)}</Button>
          )}
        </div>
      </header>
      <ConnectModal
        opened={onOpen}
        setError={setError}
        closeHandle={() => {
          onClose(false);
        }}
      />
    </>
  );
};

export default Header;
