/* eslint-disable no-undef */
import React, { useState } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import { useWeb3React } from "@web3-react/core";
import { useFlexibleStaking } from "../hooks/useContracts";

export default function FlexibleStaking(props) {
  const { amount, setAmount, selectedTokenContract, selectedTokenAddr } = props;
  const { account } = useWeb3React();
  const flexibleContract = useFlexibleStaking();

  const [balance, setBalance] = useState(0);
  const [stakedByUser, setStakedByUser] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [unstakeList, setUnstakeList] = useState();
  const [totalStaked, setTotalStaked] = useState(0);

  const initFlexibleBalance = async () => {
    const tmpBalance = await selectedTokenContract.methods
      .balanceOf(account)
      .call();
    const stakedByUserArray = await flexibleContract.methods
      .getUserStakes(account)
      .call();
    const totalStaked = await flexibleContract.methods
      .tokenStakeInfo(selectedTokenAddr)
      .call()[2];

    var sumOfStaked = 0;
    var unstakeLists = [];
    var sumTotalRewards = 0;
    for (var i = 0; i < stakedByUserArray.length; i++) {
      const rewards = await flexibleContract.methods
        .calcRewardsByIndex(account, i)
        .call();
      sumTotalRewards += parseInt(rewards);
      if (stakedByUserArray[i].amount > 0) {
        unstakeLists.push({ id: i, amount: stakedByUserArray[i].amount });
      }
      if (stakedByUserArray[i].stakeToken === selectedTokenAddr) {
        sumOfStaked += parseInt(stakedByUserArray[i].amount);
      }
    }
    setTotalStaked(totalStaked);
    setBalance(BigInt(tmpBalance));
    setStakedByUser(sumOfStaked);
    setTotalRewards(sumTotalRewards);
    setUnstakeList(unstakeLists);
  };
  return (
    <>
      Upgrading
      {/* {initLoading === false && !initializing && (
        <div className="grid grid-col-1 md:grid-cols-2 gap-6 mt-10 w-full">
          <Card title="Your / Total Staked MMPRO">
            <div className="flex flex-col pt-8 pb-4 text-white">
              <div className="text-center">
                <span className="text-white text-2xl ml-2">Yours</span>
                <span className="text-white text-5xl">
                  {parseFloat(
                    BigInt(stakedByUser) / BigInt(1000000000000000000)
                  ).toFixed(2)}
                </span>
                <span className="text-white text-2xl ml-2">MMPRO</span>
                <br />
                <span className="text-white text-2xl ml-2">Total</span>
                <span className="text-white text-5xl">
                  {parseFloat(
                    BigInt(totalStaked) / BigInt(1000000000000000000)
                  ).toFixed(2)}
                </span>
                <span className="text-white text-2xl ml-2">MMPRO</span>
              </div>
              <div className="text-center">
                {parseFloat(
                  (parseFloat(totalStaked) / parseFloat(balance.toString())) *
                    parseInt(100)
                ).toFixed(5)}
                %
              </div>
              <div className="text-center">of total supply</div>
            </div>
          </Card>

          <Card title="Your Earnings">
            <div className="flex flex-col pt-8 px-2">
              <div className="text-center pb-8">
                <span className="text-white text-5xl">
                  {parseFloat(totalRewards / 1000000000000000000).toFixed(2)}
                </span>
                <span className="text-white text-2xl ml-2">MMPRO</span>
              </div>
              <div className="flex flex-row justify-center">
                <Button
                  type="submit"
                  className="flex flex-row items-center justify-center w-48"
                  onClick={() => withdrawEarnings()}
                >
                  {withdrawLoading ? (
                    <Spinner size={30} />
                  ) : (
                    <>
                      <img src="/images/unlocked.svg" width="25" alt="" />
                      <span className="w-32">CLAIM ALL</span>{" "}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Staking">
            <div className="flex flex-col pt-8 px-2">
              <div className="text-center pb-4">
                <span className="text-lg text-gray-400">
                  Available amount:{" "}
                </span>
                <span className="text-white text-3xl">
                  {BigInt(
                    BigInt(balance) / BigInt(1000000000000000000)
                  ).toString()}
                </span>
                <span className="text-white text-2xl ml-2">MMPRO</span>
              </div>
              <div className="rounded-md border-2 border-primary p-2 flex justify-between items-center">
                <input
                  type="number"
                  placeholder="MMPRO To Stake"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-white font-extrabold flex-shrink text-2xl w-full bg-transparent focus:outline-none focus:bg-white focus:text-black px-2"
                />
                <Button
                  onClick={() => stake()}
                  className="flex flex-row items-center w-96 justify-center"
                >
                  {stakeLoading ? (
                    <Spinner size={30} />
                  ) : (
                    <>
                      <img src="/images/locked.svg" width="25" alt="" />
                      <span className="w-48">APPROVE & STAKE</span>{" "}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Unstaking">
            <div className="flex flex-col pt-8 px-2">
              <div className="text-center pb-4">
                <span className="text-lg text-gray-400">
                  Available to unstake:{" "}
                </span>
                <span className="text-white text-3xl">
                  {(parseFloat(stakedByUser) / 1000000000000000000).toFixed(2)}
                </span>
                <span className="text-white text-2xl ml-2">MMPRO</span>
              </div>
              <div className="rounded-md border-2 border-primary p-2 flex justify-between items-center">
                <select
                  value={optionsState}
                  onChange={onSelectChanged}
                  className="text-white font-extrabold flex-shrink text-2xl w-full bg-transparent focus:outline-none focus:bg-white focus:text-black px-2"
                >
                  {unstakeList.map((unstake) => (
                    <option key={unstake.id} value={unstake.id}>
                      {parseFloat(unstake.amount / 1000000000000000000)}
                    </option>
                  ))}
                  ;
                </select>
                <Button
                  onClick={() => unstake()}
                  className="flex flex-row items-center w-48 justify-center"
                >
                  {unstakeLoading ? (
                    <Spinner size={30} />
                  ) : (
                    <>
                      <img src="/images/unlocked.svg" width="25" alt="" />
                      <span className="w-36">UNSTAKE ALL</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )} */}
    </>
  );
}
