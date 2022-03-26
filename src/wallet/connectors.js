import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import Web3 from "web3";

// Chain IDs
// These are the IDs of the Ethereum chains that MetaMask supports by default. Consult chainid.network (opens new window)for more.
// Hex	Decimal	Network
// 0x1	1	Ethereum Main Network (Mainnet)
// 0x3	3	Ropsten Test Network
// 0x4	4	Rinkeby Test Network
// 0x5	5	Goerli Test Network
// 0x2a	42	Kovan Test Network
export const injected = new InjectedConnector({
  supportedChainIds: [56, 97],
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 56: "https://bsc-dataseed4.binance.org/" },
  qrcode: true,
  pollingInterval: 12000,
});

export const getLibrary = (provider) => new Web3(provider);
