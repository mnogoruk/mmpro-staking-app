/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import MMPRO from "../../contracts/MMPRO.json";
import { getMMProAddress } from "../../utils/getAddress";
import { useFlexibleStaking } from "../../hooks/useContracts";
import SelectFlexibleToken from "./SelectFlexibleToken";

const stakeTokenDataList = [
  {
    name: "MMPro",
    abi: MMPRO.abi,
    addr: getMMProAddress(),
    img: "/images/mmpro.png",
  },
  // {
  //   name: "Busd",
  //   abi: BUSD.abi,
  //   addr: getBUSDAddress(),
  //   img: "/images/busd.png",
  // },
];

export default function FlexibleLayout(props) {
  const { flexibleAPY } = props;
  const flexibleContract = useFlexibleStaking();
  const [initLoading, setInitLoading] = useState(false);
  const [stakeTokenBoxList, setStakeTokenBoxList] = useState(Array);
  // const [rewardAmount, setRewardAmount] = useState(0);

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
    setStakeTokenBoxList(tempStakeList);
  };

  useEffect(() => {
    const initialize = async () => {
      setInitLoading(true);
      await init();
      setInitLoading(false);
    };
    initialize();
  }, []);

  return (
    <div className="grid grid-col-1 gap-6 w-full">
      {/* className="transparentCard justify-between w-auto mx-12" */}
      <div className="text-center">
        {initLoading === true ? (
          <div className="mt-10">Loading...</div>
        ) : (
          <>
            <SelectFlexibleToken
              stakeTokenBoxList={stakeTokenBoxList}
              flexibleAPY={flexibleAPY}
            />
          </>
        )}
      </div>
    </div>
  );
}
