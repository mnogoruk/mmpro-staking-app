import React, { useState } from "react";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { useMMProContract } from "../../hooks/useContracts";
import { getMMProAddress } from "../../utils/getAddress";
import FlexibleBox from "./FlexibleBox";

export default function SelectFlexibleToken(props) {
  const { stakeTokenBoxList, flexibleAPY } = props;
  const [flexibleStakeDowned, setFlexibleStakeDowned] = useState(false);
  const MMProContract = useMMProContract();
  return (
    <>
      {stakeTokenBoxList.map((stakeTokenBox, index) => (
        <div key={index} className="w-auto my-2 rounded-lg card-bg p-4">
          <div
            className="flex justify-between items-center"
            onClick={() => {
              setFlexibleStakeDowned(!flexibleStakeDowned);
            }}
          >
            <div className="flex justify-start">
              <img
                src={stakeTokenBox["img"]}
                width="60"
                alt={stakeTokenBox["name"]}
              />
              <div className="flex flex-col mx-4">
                <div className="flex flex-row justify-between">
                  <div className="font-extrabold">{stakeTokenBox["name"]}</div>
                </div>
                <div className="flex flex-row justify-between">
                  <div>TVL: </div>
                  <div className="font-black">
                    {stakeTokenBox["TVL"] / 1000000000000000000}{" "}
                    {stakeTokenBox["name"]}
                  </div>
                </div>
                <div className="flex flex-row justify-between">
                  <div>APY: </div>
                  <div className="font-extrabold">
                    {flexibleAPY.length > 0 ? flexibleAPY[index]["APY"] : 0} %
                  </div>
                </div>
              </div>
            </div>
            {flexibleStakeDowned ? <AiOutlineUp /> : <AiOutlineDown />}
          </div>
          {flexibleStakeDowned && (
            <FlexibleBox
              selectedTokenContract={MMProContract}
              selectedTokenAddr={getMMProAddress()}
            />
          )}
          {/* <Button onClick={() => setCurStakeTokenID(index)}>Stake</Button> */}
        </div>
      ))}
    </>
  );
}
