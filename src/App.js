/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import StakingPage from "./pages/StakingPage";
import {
  useMMProContract,
  useBUSDContract,
  useWeb3,
} from "./hooks/useContracts";
import { getLPAddress } from "./utils/getAddress";
import { getBalanceOfToken, getTotalSupply } from "./hooks/contractsFunction";

const App = () => {
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

  return (
    <div className="w-full overflow-hidden main-gradient">
      <Header />
      <StakingPage price={price} totalSupply={totalSupply} mmcap={mmCap} />
      <Footer />
    </div>
  );
};

export default App;
