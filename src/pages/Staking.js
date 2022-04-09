/* eslint-disable react-hooks/exhaustive-deps */
import { useWeb3React } from "@web3-react/core";
import React, { useState, useEffect } from "react";
// import TabComp from "./TabComp";
import FixedLayout from "./FixedStake/FixedLayout";
// import FlexibleLayout from "./FlexibleStake/FlexibleLayout";
import numeral from "numeral";
import { useFixedStaking } from "../hooks/useContracts";
import { getMMProAddress } from "../utils/getAddress";
import { calcAPY } from "../utils/common";
// import MMPRO from "../contracts/MMPRO.json";

// const stakeTokenDataList = [
//   {
//     name: "MMPro",
//     abi: MMPRO.abi,
//     addr: getMMProAddress(),
//     img: "/images/mmpro.png",
//   },
//   // {
//   //   name: "Busd",
//   //   abi: BUSD.abi,
//   //   addr: getBUSDAddress(),
//   //   img: "/images/busd.png",
//   // },
// ];

export default function Staking(props) {
  const { active, account } = useWeb3React();
  const fixedStakeContract = useFixedStaking();
  // const flexibleContract = useFlexibleStaking();
  const { price, totalSupply, mmcap } = props;
  const [fixedAPY, setFixedAPY] = useState(0);
  // const [flexibleAPY, setFlexibleAPY] = useState(Array);
  // const [tabIndex, setTabIndex] = useState(1);

  const calcFixedAPY = async () => {
    const fixedAPY = await calcAPY(
      fixedStakeContract,
      getMMProAddress(),
      1,
      false,
      account
    );
    setFixedAPY(fixedAPY);
  };

  // const calcFlexibleAPY = async () => {
  //   var tempStakeList = [];
  //   for (var i = 0; i < stakeTokenDataList.length; i++) {
  //     var stakeTokenInfo = {};
  //     stakeTokenInfo["name"] = stakeTokenDataList[i]["name"];
  //     stakeTokenInfo["img"] = stakeTokenDataList[i]["img"];
  //     stakeTokenInfo["addr"] = stakeTokenDataList[i]["addr"];
  //     stakeTokenInfo["TVL"] = (
  //       await flexibleContract.methods
  //         .tokenStakeInfo(stakeTokenDataList[i]["addr"])
  //         .call()
  //     )[2];
  //     stakeTokenInfo["emission"] = (
  //       await flexibleContract.methods
  //         .tokenStakeInfo(stakeTokenDataList[i]["addr"])
  //         .call()
  //     )[1];
  //     tempStakeList.push({ ...stakeTokenInfo, id: i });
  //   }

  //   let tempAPY = [];
  //   for (i = 0; i < tempStakeList.length; i++) {
  //     const apy = await calcAPY(
  //       flexibleContract,
  //       getMMProAddress(),
  //       tempStakeList[i]["emission"],
  //       true,
  //       account
  //     );
  //     console.log(apy);
  //     tempAPY.push({ id: i, APY: apy });
  //   }
  //   setFlexibleAPY(tempAPY);
  // };

  useEffect(() => {
    const init = async () => {
      await calcFixedAPY();
      // await calcFlexibleAPY();
    };
    if (active) {
      init();
    }
  }, [active]);

  return (
    <div className="container mx-auto pb-18 px-4 force-height">
      <div className="w-full py-6 text-center">
        {/* <dov className="flex flex-row justify-around"> */}
        <div className="flex items-center justify-center md:flex-row flex-col w-full mb-24 mt-6">
          <div className="text-left">
            <p className="mb-2 font-semibold md:text-6xl text-5xl">Staking</p>
            <p className="text-2xl mb-2 font-light">
              Connect your wallet &amp; stake your MMPRO tokens to earn extra
              MMPRO tokens
            </p>
          </div>
          <div>
            <div className="transparentCard justify-between md:w-80 w-60">
              <h1> MMPRO price</h1>
              <div className="flex items-center justify-center flex-row">
                <p>{price.toFixed(4)}</p>
                <h1>&nbsp;USD</h1>
              </div>
            </div>
            <div className="transparentCard justify-between md:w-80 w-60">
              <h1> MMPRO marketcap</h1>
              <div className="flex items-center justify-center flex-row">
                <p>{numeral(mmcap).format("0.0a")}</p>
                <h1>&nbsp;USD</h1>
              </div>
            </div>
            <div className="transparentCard justify-between md:w-80 w-60">
              <h1> MMPRO supply</h1>
              <div className="flex items-center justify-center flex-row">
                <p>{numeral(totalSupply).format("0.00a")}</p>
                <h1>&nbsp;MMPro</h1>
              </div>
            </div>
            <div className="transparentCard justify-between md:w-80 w-60">
              <h1> APY</h1>
              <div className="flex items-center justify-center flex-row">
                <p>{numeral(fixedAPY).format("0.00a")}</p>
                <h1>&nbsp;%</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <TabComp
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
        fixedAPY={fixedAPY}
      /> */}
      {/* {tabIndex === 1 && <FlexibleLayout flexibleAPY={flexibleAPY} />} */}
      {/* {tabIndex === 2 && <FixedLayout />} */}
      <FixedLayout />
    </div>
  );
}
