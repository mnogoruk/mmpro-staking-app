import React from "react";
import Button from "../../components/common/Button";

export default function SelectFlexibleToken(props) {
  const { stakeTokenBoxList, flexibleAPY, setCurStakeTokenID } = props;
  return (
    <>
      <span className="text-white text-2xl">Please select one!</span>
      {stakeTokenBoxList.map((stakeTokenBox, index) => (
        <div
          key={index}
          className="flex justify-between w-auto mx-12 my-2 rounded-lg card-bg py-4 px-8"
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
                  {flexibleAPY[index]["APY"]}
                </div>
              </div>
            </div>
          </div>
          <Button onClick={() => setCurStakeTokenID(index)}>Stake</Button>
        </div>
      ))}
    </>
  );
}
