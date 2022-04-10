/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import BorderCard from "../../components/common/BorderCard";
import Spinner from "../../components/common/Spinner";
import { useFlexibleStaking, useMMProContract } from "../../hooks/useContracts";
import { useWeb3React } from "@web3-react/core";
import {
  getFlexibleStakingAddress,
  getMMProAddress,
} from "../../utils/getAddress";
import { wei2eth } from "../../utils/common";
import fromExponential from "from-exponential";

const NOLOADING = -1;
const STAKELOADING = 1;
const UNSTAKELOADING = 2;
const CLAIMLOADING = 3;
const APPROVELOADING = 4;

export default function FlexibleBox(props) {
  const { selectedTokenContract, selectedTokenAddr } = props;
  const { active, account } = useWeb3React();
  const flexibleContract = useFlexibleStaking();
  const MMProContract = useMMProContract();

  const [balance, setBalance] = useState(0);
  const [stakedByUser, setStakedByUser] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [unstakeList, setUnstakeList] = useState([]);
  const [totalStaked, setTotalStaked] = useState(0);
  const [initLoading, setInitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(NOLOADING);
  const [optionsState, setOptionsState] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const init = async () => {
      setInitLoading(true);
      await initFlexibleBalance();
      setInitLoading(false);
    };
    if (active) {
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const handleUnstakeOption = (event) => {
    setOptionsState(event.target.value);
  };

  const initFlexibleBalance = async () => {
    const tmpBalance = await selectedTokenContract.methods
      .balanceOf(account)
      .call();
    const stakedByUserArray = await flexibleContract.methods
      .getUserStakes(account)
      .call();
    const totalStaked = (
      await flexibleContract.methods.tokenStakeInfo(selectedTokenAddr).call()
    ).totalStaked;
    const allowance = await MMProContract.methods
      .allowance(account, getFlexibleStakingAddress())
      .call();

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
    setAmount(0);
    setAllowance(BigInt(allowance));
    setTotalStaked(totalStaked);
    setBalance(BigInt(tmpBalance));
    setStakedByUser(sumOfStaked);
    setTotalRewards(sumTotalRewards);
    setUnstakeList(unstakeLists);
  };

  const approve = async () => {
    const amount2eth = fromExponential(10 ** 10 * 10 ** 18);
    setActionLoading(APPROVELOADING);
    await MMProContract.methods
      .approve(getFlexibleStakingAddress(), amount2eth)
      .send({ from: account });
    await initFlexibleBalance();
    setActionLoading(NOLOADING);
  };

  const stake = async () => {
    setActionLoading(STAKELOADING);
    if (amount === 0 || BigInt(amount) > wei2eth(balance)) {
      return;
    }
    const amount2eth = fromExponential(amount * 10 ** 18);
    try {
      const allowance = await MMProContract.methods
        .allowance(account, getFlexibleStakingAddress())
        .call();
      if (BigInt(allowance) < BigInt(amount2eth)) {
        await approve();
      }
      await flexibleContract.methods
        .stake(getMMProAddress(), amount2eth)
        .send({ from: account });
      await initFlexibleBalance();
    } catch (e) {
      if (e.code !== 4001) {
        console.log(e);
      }
      console.log(e);
    }
    setActionLoading(NOLOADING);
  };

  const unstake = async () => {
    if (stakedByUser === 0) {
      return;
    }
    setActionLoading(UNSTAKELOADING);
    try {
      await flexibleContract.methods
        .withdrawAllWithRewards(optionsState)
        .send({ from: account });
      await initFlexibleBalance();
    } catch (e) {
      console.log(e);
    }
    setActionLoading(NOLOADING);
  };

  const withdrawEarnings = async () => {
    if (totalRewards === 0) {
      return;
    }
    setActionLoading(CLAIMLOADING);
    try {
      const length = unstakeList.length;
      for (var i = 0; i < length; i++) {
        await flexibleContract.methods
          .claimRewards(unstakeList[i].id)
          .send({ from: account });
      }
      await initFlexibleBalance();
    } catch (e) {
      console.log(e);
    }
    setActionLoading(NOLOADING);
  };

  return (
    <>
      {initLoading && <>Loading...</>}
      {!active && <>Connet Wallet </>}
      {!initLoading && active && (
        <div className="grid grid-col-1 md:grid-cols-2 gap-6 w-full p-2">
          <BorderCard title="Your / Total Staked MMPRO">
            <div className="flex flex-col pt-8 pb-4 text-white">
              <div className="text-center">
                <span className="text-white text-2xl ml-2">Yours</span>
                <span className="text-white text-5xl">
                  {parseFloat(wei2eth(stakedByUser)).toFixed(2)}
                </span>
                <span className="text-white text-2xl ml-2">MMPRO</span>
                <br />
                <span className="text-white text-2xl ml-2">Total</span>
                <span className="text-white text-5xl">
                  {parseFloat(wei2eth(totalStaked)).toFixed(2)}
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
          </BorderCard>

          <BorderCard title="Your Earnings">
            <div className="flex flex-col pt-8 px-2">
              <div className="text-center pb-8">
                <span className="text-white text-5xl">
                  {parseFloat(wei2eth(totalRewards)).toFixed(2)}
                </span>
                <span className="text-white text-2xl ml-2">MMPRO</span>
              </div>
              <div className="flex flex-row justify-center">
                <Button
                  type="submit"
                  className="flex flex-row items-center justify-center w-48"
                  onClick={() => withdrawEarnings()}
                  disabled={actionLoading === CLAIMLOADING}
                >
                  {actionLoading === CLAIMLOADING ? (
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
          </BorderCard>

          <BorderCard title="Staking">
            <div className="flex flex-col pt-8 px-2">
              <div className="text-center pb-4">
                <span className="text-lg text-gray-400">
                  Available amount:{" "}
                </span>
                <span className="text-white text-3xl">
                  {wei2eth(balance).toString()}
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
                  onClick={() => {
                    wei2eth(allowance) < BigInt(amount) ? approve() : stake();
                  }}
                  className="flex flex-row items-center justify-center"
                  disabled={
                    actionLoading === STAKELOADING ||
                    actionLoading === APPROVELOADING
                  }
                >
                  {actionLoading === STAKELOADING ||
                  actionLoading === APPROVELOADING ? (
                    <Spinner size={30} />
                  ) : (
                    <>
                      <img src="/images/locked.svg" width="25" alt="" />
                      <span className="w-36">
                        {wei2eth(allowance) < BigInt(amount)
                          ? "Approve"
                          : "Stake"}
                      </span>{" "}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </BorderCard>

          <BorderCard title="Unstaking">
            <div className="flex flex-col pt-8 px-2">
              <div className="text-center pb-4">
                <span className="text-lg text-gray-400">
                  Available to unstake:{" "}
                </span>
                <span className="text-white text-3xl">
                  {parseFloat(wei2eth(stakedByUser)).toFixed(2)}
                </span>
                <span className="text-white text-2xl ml-2">MMPRO</span>
              </div>
              <div className="rounded-md border-2 border-primary p-2 flex justify-between items-center">
                <select
                  value={optionsState}
                  onChange={handleUnstakeOption}
                  className="text-white font-extrabold flex-shrink text-2xl w-full bg-transparent focus:outline-none focus:bg-white focus:text-black px-2"
                >
                  {unstakeList &&
                    unstakeList.map((unstake) => (
                      <option key={unstake.id} value={unstake.id}>
                        {parseFloat(wei2eth(unstake.amount))}
                      </option>
                    ))}
                  ;
                </select>
                {/* <input
                      type="number"
                      placeholder="MMPRO To Unstake"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      className="text-white font-extrabold flex-shrink text-2xl w-full bg-transparent focus:outline-none focus:bg-white focus:text-black px-2"
                    /> */}
                <Button
                  onClick={() => unstake()}
                  className="flex flex-row items-center w-48 justify-center"
                  disabled={actionLoading === UNSTAKELOADING}
                >
                  {actionLoading === UNSTAKELOADING ? (
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
          </BorderCard>
        </div>
      )}
    </>
  );
}
