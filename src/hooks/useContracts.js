import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";

import {
  getBUSDAddress,
  getFlexibleStakingAddress,
  getLPAddress,
  getMMProAddress,
} from "../utils/getAddress";
// import MMPRO from "../contracts/MMPRO.json";
import FlexibleStake from "../contracts/FlexibleStake.json";
import LPContract from "../contracts/LPContract.json";
import MMPRO from "../contracts/MMPRO.json";
import BUSD from "../contracts/Busd.json";
import getRpcUrl from "../utils/getRpcUrl";

const RPC_URL = getRpcUrl();
const httpProvider = new Web3.providers.HttpProvider(RPC_URL, {
  timeout: 10000,
});

export const useWeb3 = () => {
  const { library } = useWeb3React();
  let web3;
  if (library) {
    web3 = new Web3(library.currentProvider || httpProvider);
  } else {
    web3 = new Web3(httpProvider);
  }
  return web3;
};

const useContract = (abi, address) => {
  const { library } = useWeb3React();
  const web3 = new Web3(library.currentProvider || httpProvider);
  return new web3.eth.Contract(abi, address);
};

export const useFlexibleStaking = (_) => {
  const abi = FlexibleStake.abi;
  return useContract(abi, getFlexibleStakingAddress());
};

export const useLPContract = (web3) => {
  const abi = LPContract.abi;
  return new web3.eth.Contract(abi, getLPAddress());
};

export const useBUSDContract = (web3) => {
  const abi = BUSD.abi;
  return new web3.eth.Contract(abi, getBUSDAddress());
};

export const useMMProContract = (web3) => {
  const abi = MMPRO.abi;
  return new web3.eth.Contract(abi, getMMProAddress());
};
