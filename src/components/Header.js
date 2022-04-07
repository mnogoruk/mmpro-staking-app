import React, { useState } from "react";
import Button from "./common/Button.js";
import ConnectModal from "./common/ConnectModal.js";
import { useWeb3React } from "@web3-react/core";

const Header = () => {
  const { account, deactivate, active } = useWeb3React();
  const [onOpen, onClose] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(false);

  const disconnect = () => {
    deactivate();
  };

  function truncate(str) {
    console.log(
      str,
      str.substr(0, 6) + "..." + str.substr(str.length - 4, str.length - 1)
    );
    return str.length > 0
      ? str.substr(0, 6) + "..." + str.substr(str.length - 4, str.length - 1)
      : str;
  }

  return (
    <>
      <header className="container px-4 mx-auto py-4">
        <div className="flex flex-row justify-between items-center w-full">
          <div>
            <a href="/#">
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
            <Button onClick={disconnect} bgColor="secondary">
              {truncate(account)}
            </Button>
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
