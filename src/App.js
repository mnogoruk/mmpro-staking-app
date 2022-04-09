/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import Footer from "./components/Footer";
import Header from "./components/Header";
import {
  useMMProContract,
  useBUSDContract,
  useWeb3,
} from "./hooks/useContracts";
import { getLPAddress } from "./utils/getAddress";
import { getBalanceOfToken, getTotalSupply } from "./hooks/contractsFunction";
import Staking from "./pages/Staking";
import { injected } from "./wallet";

const App = () => {
  const { active, activate, networkError } = useWeb3React();
  const [mmproBalance, setMMProBalance] = useState(0);
  const [busdBalance, setBUSDBalance] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [mmCap, setMMCap] = useState(0);
  var web3 = useWeb3();
  const MMProContract = useMMProContract(web3);
  const BUSDContract = useBUSDContract(web3);
  const price = mmproBalance && busdBalance && busdBalance / mmproBalance;

  useEffect(() => {
    const init = async () => {
      setMMProBalance(await getBalanceOfToken(MMProContract, getLPAddress()));
      setBUSDBalance(await getBalanceOfToken(BUSDContract, getLPAddress()));
      const total = await getTotalSupply(MMProContract);
      setTotalSupply((total - 600000000000000000000000) / 1000000000000000000);
      const mMcap =
        (price * (total - 600000000000000000000000)) / 1000000000000000000;
      setMMCap(mMcap);
    };
    init();
  });

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized && !active && !networkError) {
        activate(injected);
      }
    });
  }, [activate, networkError]);

  return (
    <div className="w-full overflow-hidden main-gradient">
      <Header />
      <Staking price={price} totalSupply={totalSupply} mmcap={mmCap} />
      <Footer />
    </div>
  );
};

export default App;
