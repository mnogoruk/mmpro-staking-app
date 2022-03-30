/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import MMPRO from "../contracts/MMPRO.json";
import BUSD from "../contracts/Busd.json";
import { getMMProAddress, getBUSDAddress } from "../utils/getAddress";
import { useFlexibleStaking } from "../hooks/useContracts";
import { useWeb3React } from "@web3-react/core";
import SelectFlexibleToken from "./SelectFlexibleToken";
import FlexibleStaking from "./FlexibleStaking";

const stakeTokenDataList = [
  {
    name: "MMPro",
    abi: MMPRO.abi,
    addr: getMMProAddress(),
    img: "/images/mmpro.png",
  },
  {
    name: "Busd",
    abi: BUSD.abi,
    addr: getBUSDAddress(),
    img: "/images/busd.png",
  },
];

export default function FlexibleLayout() {
  const flexibleContract = useFlexibleStaking();
  const { account, active } = useWeb3React();
  const [initLoading, setInitLoading] = useState(false);
  const [stakeTokenBoxList, setStakeTokenBoxList] = useState(Array);
  const [flexibleAPY, setFlexibleAPY] = useState(Array);
  // const [amount, setAmount] = useState(0);
  const [curStakeTokenID, setCurStakeTokenID] = useState(-1);

  const cAPY = async (index, amount, emission) => {
    const totalStaked = await flexibleContract.methods
      .tokenStakeInfo(stakeTokenDataList[index]["addr"])
      .call()[2];
    console.log(totalStaked);
    if (totalStaked && amount) {
      const shareRate = BigInt(amount * 100) / (totalStaked + BigInt(amount));
      const currentRewardsPerday =
        (BigInt(shareRate) * BigInt(emission)) / BigInt(100);
      const estAnnualRewards = BigInt(currentRewardsPerday) * BigInt(365);
      const apy = (BigInt(estAnnualRewards) * BigInt(100)) / BigInt(amount);
      return apy.toString() + "%";
    }
    return "0%";
  };

  const init = async () => {
    var tempStakeList = [];
    for (var i = 0; i < stakeTokenDataList.length; i++) {
      var stakeTokenInfo = {};
      stakeTokenInfo["name"] = stakeTokenDataList[i]["name"];
      stakeTokenInfo["img"] = stakeTokenDataList[i]["img"];
      stakeTokenInfo["addr"] = stakeTokenDataList[i]["addr"];
      stakeTokenInfo["TVL"] = (
        await flexibleContract.methods
          .tokenStakeInfo(stakeTokenDataList[i]["addr"])
          .call()
      )[2];
      stakeTokenInfo["emission"] = (
        await flexibleContract.methods
          .tokenStakeInfo(stakeTokenDataList[i]["addr"])
          .call()
      )[1];
      tempStakeList.push({ ...stakeTokenInfo, id: i });
    }
    let tempAPY = [];
    for (i = 0; i < tempStakeList.length; i++) {
      const apy = await cAPY(i, amount, tempStakeList[i]["emission"]);
      tempAPY.push({ id: i, APY: apy });
    }
    setFlexibleAPY(tempAPY);
    setStakeTokenBoxList(tempStakeList);
  };

  useEffect(() => {
    const initialize = async () => {
      setInitLoading(true);
      await init();
      setInitLoading(false);
    };
    initialize();
  }, [account, active]);

  return (
    <div className="grid grid-col-1 gap-6 w-full">
      {/* className="transparentCard justify-between w-auto mx-12" */}
      <div className="text-center">
        {initLoading === true ? (
          <>loading...</>
        ) : (
          <>
            {curStakeTokenID === -1 ? (
              <SelectFlexibleToken
                stakeTokenBoxList={stakeTokenBoxList}
                flexibleAPY={flexibleAPY}
                setCurStakeTokenID={setCurStakeTokenID}
              />
            ) : (
              <FlexibleStaking />
            )}
          </>
        )}
      </div>
    </div>
  );
}
