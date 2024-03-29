/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import Modal from "./Modal";
import { useWeb3React } from "@web3-react/core";
import { injected, walletconnect, switchNetwork } from "../../wallet";

export default function ConnectModal(props) {
  const { chainId, activate, active, error } = useWeb3React();
  const { opened, closeHandle, setError } = props;

  useEffect(() => {
    const initNetwork = async () => {
      setError(56 !== chainId && active);
      if (56 !== chainId) {
        await switchNetwork();
      }
    };
    initNetwork();
  }, [active, chainId, error]);

  return (
    <>
      {opened && (
        <Modal title="ConnectWallet" onClose={closeHandle}>
          <div className="flex flex-col">
            <button
              className="flex flex-row items-center m-1 p-1 border-black rounded-md border-solid border-2 cursor-pointer"
              onClick={() => {
                activate(injected);
                // setProvider("coinbaseWallet");
                closeHandle();
              }}
            >
              <img
                src="/images/wallet/metamask.svg"
                alt="metamask"
                width="50"
                height="50"
                className="mr-3"
              />
              <p className="text-black">Metamask</p>
            </button>
            <button
              className="flex flex-row items-center m-1 p-1 border-black rounded-md border-solid border-2 cursor-pointer"
              onClick={() => {
                activate(walletconnect);
                // setProvider("coinbaseWallet");
                closeHandle();
              }}
            >
              <img
                src="/images/wallet/trustwallet.svg"
                alt="metamask"
                width="50"
                height="50"
                className="mr-3"
              />
              <p className="text-black">Wallet connect</p>
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
