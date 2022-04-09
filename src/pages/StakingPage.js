/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import numeral from "numeral";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Card from "../components/common/Card";
import BorderCard from "../components/common/BorderCard";
import Spinner from "../components/common/Spinner";
import FlexibleStake from "../contracts/FlexibleStake.json";
import MMPRO from "../contracts/MMPRO.json";
import fromExponential from "from-exponential";
import FixedStake from "../contracts/FixedStake.json";
import {
  getFlexibleStakingAddress,
  getFixedStakingAddress,
  getMMProAddress,
} from "../utils/getAddress";
import { useWeb3React } from "@web3-react/core";
import { useWeb3 } from "../hooks/useContracts";
import { injected } from "../wallet";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";

const stakeTokenDataList = [
  {
    name: "MMPro",
    abi: MMPRO.abi,
    addr: getMMProAddress(),
    img: "/images/mmpro.png",
  },
];
const HomePage = (props) => {
  const { price, totalSupply, mmcap } = props;
  const { account, active, activate, error: networkError } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [unstakeLoading, setUnstakeLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState();
  const [flexibleStakeContract, setFlexibleStakeContract] = useState();
  const [fixedStakeContract, setFixedStakeContract] = useState();
  // const [stakeToken, setStakeToken] = useState();
  const [usersStake, setUserStake] = useState();
  // const [freeAmount, setFreeAmount] = useState();
  // const [totalSupply, setTotalSupply] = useState();

  const [wishStakeContractList, setWishStakeContractList] = useState(Array);

  const [balance, setBalance] = useState(0);
  const [totalStaked, setTotalStaked] = useState(0);
  const [stakedByUser, setStakedByUser] = useState(0);
  const [unstakeList, setUnstakeList] = useState([]);
  // const [unstakeAmount, setUnstakeAmount] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [amount, setAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [optionsState, setOptionsState] = useState(0);
  const [curStakeTokenID, setCurStakeTokenID] = useState(-1);
  const [curStakeTokenInfo, setCurStakeTokenInfo] = useState();
  const [curStakeTokenContract, setCurStakeTokenContract] = useState();
  const [stakeTokenBoxList, setStakeTokenBoxList] = useState(Array);
  const [tabIndex, setTabIndex] = useState(1);
  const [fixedStakingOption, setFixedStakingOption] = useState(Array);
  const [stakingOptionState, setStakingOptionState] = useState(0);
  const [apy, setAPY] = useState("");
  const [flexibleAPY, setFlexibleAPY] = useState(Array);
  const [initializing, setInitializing] = useState(false);
  const [unstakeIndex, setUnstakeIndex] = useState(0);
  const [firstUnstakeTime, setFirstUnstakeTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [flexibleStakeDowned, setFlexibleStakeDowned] = useState(false);

  var web3 = useWeb3();

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized && !active && !networkError) {
        activate(injected);
      }
    });
  }, [activate, networkError]);

  const init = async () => {
    if (isReady()) {
      return;
    }

    const networkId = await web3.eth.net.getId();
    if (networkId !== 56) {
      setError("Please connect BSC Network");
      setLoading(false);
      return;
    }

    var tempWishStakeList = [];
    for (var i = 0; i < stakeTokenDataList.length; i++) {
      const tempStakeToken = new web3.eth.Contract(
        stakeTokenDataList[i]["abi"],
        stakeTokenDataList[i]["addr"]
      );
      tempWishStakeList.push(tempStakeToken);
    }

    const tempflexibleStakeContract = new web3.eth.Contract(
      FlexibleStake.abi,
      getFlexibleStakingAddress()
    );
    var tempStakeList = [];
    for (i = 0; i < stakeTokenDataList.length; i++) {
      var stakeTokenInfo = {};
      stakeTokenInfo["name"] = stakeTokenDataList[i]["name"];
      stakeTokenInfo["img"] = stakeTokenDataList[i]["img"];
      stakeTokenInfo["addr"] = stakeTokenDataList[i]["addr"];
      stakeTokenInfo["TVL"] = (
        await tempflexibleStakeContract.methods
          .tokenStakeInfo(stakeTokenDataList[i]["addr"])
          .call()
      )[2];
      stakeTokenInfo["emission"] = (
        await tempflexibleStakeContract.methods
          .tokenStakeInfo(stakeTokenDataList[i]["addr"])
          .call()
      )[1];
      tempStakeList.push({ ...stakeTokenInfo, id: i });
    }

    const tempfixedStakeContract = new web3.eth.Contract(
      FixedStake.abi,
      getFixedStakingAddress()
    );

    const apy = cAPY(amount, 5000);
    setAPY(apy);
    let tempAPY = [];
    debugger;
    tempStakeList.forEach((stake, index) => {
      const apy = cAPY(amount, stake["emission"]);
      tempAPY.push({ id: index, APY: apy });
      console.log(stake, stake["emission"], apy);
    });
    setFlexibleAPY(tempAPY);

    setStakeTokenBoxList(tempStakeList);
    setAccounts(await web3.eth.getAccounts());
    setWishStakeContractList(tempWishStakeList);
    setFlexibleStakeContract(tempflexibleStakeContract);
    setFixedStakeContract(tempfixedStakeContract);
  };

  const initFlexibleBalance = async () => {
    console.log(curStakeTokenID, accounts[0]);
    const tmpBalance = await wishStakeContractList[curStakeTokenID].methods
      .balanceOf(accounts[0])
      .call();
    const stakedByUserArray = await flexibleStakeContract.methods
      .getUserStakes(accounts[0])
      .call();
    var sumOfStaked = 0;
    var unstakeLists = [];
    var sumTotalRewards = 0;
    for (var i = 0; i < stakedByUserArray.length; i++) {
      const rewards = await flexibleStakeContract.methods
        .calcRewardsByIndex(accounts[0], i)
        .call();
      sumTotalRewards += parseInt(rewards);
      if (stakedByUserArray[i].amount > 0) {
        unstakeLists.push({ id: i, amount: stakedByUserArray[i].amount });
      }
      if (
        stakedByUserArray[i].stakeToken ===
        stakeTokenBoxList[curStakeTokenID].addr
      ) {
        sumOfStaked += parseInt(stakedByUserArray[i].amount);
      }
      console.log(stakedByUserArray);
    }
    // setTotalSupply(totalSupply);
    // setFreeAmount(freeAmount);
    // setStakeToken(stakeToken);
    // setBalance(balance);
    // setTotalStaked(totalStaked);
    setUserStake(stakedByUserArray);
    setBalance(BigInt(tmpBalance));
    setStakedByUser(sumOfStaked);
    setTotalRewards(sumTotalRewards);
    setUnstakeList(unstakeLists);

    window.ethereum.on("accountsChanged", (accounts) => {
      // debugger;
      if (accounts.length > 0) {
        setAccounts(accounts);
      } else {
        setAccounts(null);
      }
    });
  };

  const initFixedBalance = async () => {
    const tmpFixedStakeOptinos = await fixedStakeContract.methods
      .getStakeOptions(getMMProAddress())
      .call();
    const tmpBalance = await wishStakeContractList[0].methods
      .balanceOf(accounts[0])
      .call();
    const stakedByUserArray = await fixedStakeContract.methods
      .getUserStakes(accounts[0])
      .call();
    var sumOfStaked = 0;
    var unstakeLists = [];
    var sumTotalRewards = 0;
    var tmpFirstUnstake = 99999999999999999999;
    for (var i = 0; i < stakedByUserArray.length; i++) {
      sumTotalRewards += stakedByUserArray[i].rewards;
      if (stakedByUserArray[i].amount > 0) {
        unstakeLists.push({ id: i, amount: stakedByUserArray[i].amount });
      }
      if (stakedByUserArray[i].stakeToken === getMMProAddress()) {
        sumOfStaked += parseInt(stakedByUserArray[i].amount);
      }
      tmpFirstUnstake =
        parseInt(tmpFirstUnstake) > parseInt(stakedByUserArray[i].end)
          ? parseInt(stakedByUserArray[i].end)
          : parseInt(tmpFirstUnstake);
    }
    setFirstUnstakeTime(tmpFirstUnstake);
    // setTotalSupply(totalSupply);
    // setFreeAmount(freeAmount);
    // setStakeToken(stakeToken);
    // setBalance(balance);
    // setTotalStaked(totalStaked);
    setUserStake(stakedByUserArray);
    setFixedStakingOption(tmpFixedStakeOptinos);
    setBalance(tmpBalance);
    setStakedByUser(sumOfStaked);
    setTotalRewards(sumTotalRewards);
    setUnstakeList(unstakeLists);

    window.ethereum.on("accountsChanged", (accounts) => {
      // debugger;
      if (accounts.length > 0) {
        setAccounts(accounts);
      } else {
        setAccounts(null);
      }
    });
  };

  const isReady = () => {
    return !!flexibleStakeContract && !!web3 && !!accounts;
  };

  async function updateAll() {
    await Promise.all([
      updateAccountBalance(),
      updateTotalStaked(),
      updateStakedByUser(),
      updateTotalRewards(),
    ]);
  }

  async function updateStakedByUser() {
    var sumOfStaked = 0;
    var stakedByUserArray;
    const tmpStakeTokenID = tabIndex === 1 ? curStakeTokenID : 0;
    if (tabIndex === 1) {
      stakedByUserArray = await flexibleStakeContract.methods
        .getUserStakes(accounts[0])
        .call();
    } else if (tabIndex === 2) {
      stakedByUserArray = await fixedStakeContract.methods
        .getUserStakes(accounts[0])
        .call();
    }
    for (var i = 0; i < stakedByUserArray.length; i++) {
      if (
        stakedByUserArray[i].stakeToken ===
        stakeTokenBoxList[tmpStakeTokenID].addr
      ) {
        sumOfStaked += parseInt(stakedByUserArray[i].amount);
      }
    }
    setUserStake(stakedByUserArray);
    setStakedByUser(sumOfStaked);
    return sumOfStaked;
  }

  async function updateTotalRewards() {
    var sumTotalRewards = 0;
    var unstakeLists = [];
    var stakedByUserArray;
    if (flexibleStakeContract && tabIndex === 1) {
      stakedByUserArray = await flexibleStakeContract.methods
        .getUserStakes(accounts[0])
        .call();
      for (var i = 0; i < stakedByUserArray.length; i++) {
        const rewards = await flexibleStakeContract.methods
          .calcRewardsByIndex(accounts[0], i)
          .call();
        sumTotalRewards = parseInt(sumTotalRewards) + parseInt(rewards);

        if (stakedByUserArray[i].amount > 0) {
          unstakeLists.push({
            id: i,
            amount: stakedByUserArray[i].amount,
          });
        }
      }
      // return sumTotalRewards;
    } else if (fixedStakeContract && tabIndex === 2) {
      stakedByUserArray = await fixedStakeContract.methods
        .getUserStakes(accounts[0])
        .call();
      for (i = 0; i < stakedByUserArray.length; i++) {
        sumTotalRewards =
          parseInt(sumTotalRewards) + parseInt(stakedByUserArray[i].rewards);

        if (stakedByUserArray[i].amount > 0) {
          unstakeLists.push({
            id: i,
            amount: stakedByUserArray[i].amount,
          });
        }
      }
    }
    setUnstakeList(unstakeLists);
    setTotalRewards(sumTotalRewards);
  }

  async function updateAccountBalance() {
    var balance;
    const tmpContract = wishStakeContractList[curStakeTokenID];
    if (tmpContract && tabIndex === 1) {
      balance = await tmpContract.methods.balanceOf(accounts[0]).call();
    } else if (tabIndex === 2) {
      balance = await wishStakeContractList[0].methods
        .balanceOf(accounts[0])
        .call();
    }
    setBalance(BigInt(balance));
    return balance;
  }

  async function updateTotalStaked() {
    if (flexibleStakeContract && tabIndex === 1) {
      const totalStaked = (
        await flexibleStakeContract.methods
          .tokenStakeInfo(stakeTokenBoxList[curStakeTokenID]["addr"])
          .call()
      )[2];
      setTotalStaked(BigInt(totalStaked));
      return totalStaked;
    }
  }

  async function stake() {
    setStakeLoading(true);
    if (amount === 0 || amount > balance / 1000000000000000000) {
      return;
    }
    const actual = amount * 10 ** 18;
    const arg = fromExponential(actual);
    try {
      const allowance = await curStakeTokenContract.methods
        .allowance(accounts[0], getFlexibleStakingAddress())
        .call();
      if (BigInt(allowance) < BigInt(arg)) {
        await curStakeTokenContract.methods
          .approve(getFlexibleStakingAddress(), arg)
          .send({ from: accounts[0] });
      }
      console.log(
        allowance,
        arg,
        BigInt(allowance) < BigInt(arg),
        flexibleStakeContract,
        curStakeTokenInfo["addr"],
        arg,
        accounts[0]
      );
      await flexibleStakeContract.methods
        .stake(curStakeTokenInfo["addr"], arg)
        .send({ from: accounts[0] });
      await updateAll();
    } catch (err) {
      if (err.code !== 4001) {
        setShowModal(true);
      }
      console.error(err);
    }
    setStakeLoading(false);
  }

  async function fixedStake() {
    debugger;
    setStakeLoading(true);
    const actual = amount * 10 ** 18;
    const arg = fromExponential(actual);
    try {
      const allowance = await wishStakeContractList[0].methods
        .allowance(accounts[0], getFixedStakingAddress())
        .call();
      if (allowance < arg) {
        await wishStakeContractList[0].methods
          .approve(getFixedStakingAddress(), arg)
          .send({ from: accounts[0] });
      }
      console.log(fixedStakeContract);
      await fixedStakeContract.methods
        .stake(stakeTokenBoxList[0].addr, arg, stakingOptionState)
        .send({ from: accounts[0] });
      await updateAll();
    } catch (err) {
      if (err.code !== 4001) {
        setShowModal(true);
      }
      console.error(err);
    }
    setStakeLoading(false);
  }

  async function unstake() {
    debugger;
    if (parseFloat(stakedByUser) === 0) {
      console.error("You don't have any staked LEADs yet!");
      return;
    }
    setUnstakeLoading(true);
    if (tabIndex === 2) {
      return;
    }
    try {
      // const _userStake = await flexibleStake.methods
      //   .getUserStakes(accounts[0])
      //   .call();
      // const count = _userStake.length;
      await flexibleStakeContract.methods
        .withdrawAllWithRewards(unstakeList[parseInt(optionsState)]["id"])
        .send({ from: accounts[0] });
      await updateAll();
    } catch (err) {
      if (err.code !== 4001) {
        setShowModal(true);
      }
      console.error(err);
    }
    setUnstakeLoading(false);
  }

  async function withdrawEarnings() {
    if (parseFloat(totalRewards) === 0) {
      console.error("No earnings yet!");
      return;
    }
    setWithdrawLoading(true);
    if (tabIndex === 1) {
      try {
        const length = unstakeList.length;
        for (var i = 0; i < length; i++) {
          await flexibleStakeContract.methods
            .claimRewards(unstakeList[i]["id"])
            .send({ from: accounts[0] });
        }
        await updateAll();
      } catch (err) {
        if (err.code !== 4001) {
          setShowModal(true);
        }
        console.error(err);
      }
    }
    setWithdrawLoading(false);
  }

  async function withdrawFixedEarning() {
    if (parseFloat(totalRewards) === 0) {
      console.error("No earnings yet!");
      return;
    }
    setWithdrawLoading(true);
    try {
      debugger;
      const s = await fixedStakeContract.methods
        .usersStake(accounts[0], unstakeList[unstakeIndex]["id"])
        .call();
      console.log(s.end, Date.now() * 1000);
      if (s.end < Date.now() / 1000) {
        await fixedStakeContract.methods
          .withdraw(getMMProAddress(), unstakeList[unstakeIndex]["id"])
          .send({ from: accounts[0] });
      } else {
        setError("Not availalbe to Claim");
      }
      await updateAll();
    } catch (err) {
      if (err.code !== 4001) {
        setShowModal(true);
      }
      console.error(err);
    }
    setWithdrawLoading(false);
  }

  // const handleSelectCurStake = (index) => {
  //   setCurStakeTokenID(index);
  // };

  const onSelectChanged = (event) => {
    setOptionsState(event.target.value);
  };

  const onStakeOptionSelectChanged = (e) => {
    setStakingOptionState(e.target.value);
  };

  const cAPY = (amount, emission) => {
    if (totalStaked && amount > 0) {
      const shareRate = BigInt(amount * 100) / (totalStaked + BigInt(amount));
      const currentRewardsPerday =
        (BigInt(shareRate) * BigInt(emission)) / BigInt(100);
      const estAnnualRewards = BigInt(currentRewardsPerday) * BigInt(365);
      const apy = (BigInt(estAnnualRewards) * BigInt(100)) / BigInt(amount);
      return apy.toString() + "%";
    }
    return "0%";
  };

  useEffect(() => {
    const initData = async () => {
      setInitializing(true);
      if (isReady()) {
        setInitLoading(true);
        if (curStakeTokenID !== -1) {
          setCurStakeTokenContract(wishStakeContractList[curStakeTokenID]);
          setCurStakeTokenInfo(stakeTokenBoxList[curStakeTokenID]);
        }
        if (tabIndex === 1 && curStakeTokenID !== -1) {
          await initFlexibleBalance();
          await updateAll();
        } else if (tabIndex === 2) {
          await initFixedBalance();
          await updateAll();
        }
        initAPY();
        setInitLoading(false);
      }
      setInitializing(false);
    };
    initData();
  }, [curStakeTokenID, tabIndex, accounts]);

  // useEffect(() => {
  //   const init = async () => {
  //     if (tabIndex === 1) {
  //       await initFlexibleBalance();
  //     } else {
  //       await initFixedBalance();
  //     }
  //   };
  //   init();
  // }, [tabIndex]);

  function initAPY() {
    debugger;
    const apy = cAPY(amount, 5000);
    setAPY(apy);
    let tempAPY = [];
    console.log(stakeTokenBoxList);
    stakeTokenBoxList.forEach((stake, index) => {
      const apy = cAPY(amount, stake["emission"]);
      tempAPY.push({ id: index, APY: apy });
      console.log(stake, stake["emission"], apy);
    });
    setFlexibleAPY(tempAPY);
  }

  useEffect(() => {
    const initialize = async (active) => {
      setLoading(true);
      if (active) {
        await init();
      }
      setLoading(false);
    };
    initialize(active);
  }, [account, active]);

  useEffect(() => {
    initAPY();
  }, [amount]);

  const calcUnstakeTime = (fistStaktime) => {
    if (firstUnstakeTime >= 99999999999999999999) {
      return "00h 00m 00s";
    }
    const date = new Date(fistStaktime * 1000);
    const diff = date.getTime() - currentTime.getTime();
    if (diff <= 0) {
      return "00h 00m 00s";
    }

    const diffSecs = diff / 1000;
    const diff_in_days = Math.floor(diffSecs / 3600 / 24).toFixed(0);
    const diff_in_hours = Math.floor((diffSecs % (3600 * 24)) / 3600).toFixed(
      0
    );
    const diff_in_mins = Math.floor(
      ((diffSecs % (3600 * 24)) % 3600) / 60
    ).toFixed(0);
    const diff_in_secs = Math.floor((diffSecs % (3600 * 24)) % 3600) % 60;
    return `${diff_in_days}d ${diff_in_hours}h ${diff_in_mins}m ${diff_in_secs}s`;
  };

  React.useEffect(() => {
    setTimeout(() => {
      setCurrentTime(new Date());
    }, 1000);
  }, [currentTime]);

  return (
    <div style={{ minHeight: "1000px" }}>
      {showModal && (
        <Modal title="" onClose={() => setShowModal(false)}>
          <div className="text-2xl mb-2 text-black">
            Error! Your transaction has been reverted!
          </div>
          <div className="text-black text-center">{error}</div>
          <div className="flex flex-row justify-center">
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </div>
        </Modal>
      )}
      <div className="relative w-full z-30">
        <div className="container mx-auto pb-18 px-4 force-height">
          {!active && (
            <div className="w-full py-6 text-center">
              {/* <dov className="flex flex-row justify-around"> */}
              <div className="flex items-center justify-center md:flex-row w-full mb-24 mt-6 flex-col">
                <div className="text-left">
                  <p
                    className="mb-2 font-semibold"
                    style={{ fontSize: "60px" }}
                  >
                    MMPRO STAKING
                  </p>
                  <p className="text-2xl mb-2 font-light">
                    Connect your wallet &amp; stake your MMPRO tokens to earn
                    extra MMPRO tokens
                  </p>
                </div>
                <div>
                  <div className="transparentCard justify-between w-60 md:w-80 ml-13">
                    <h1> MMPRO price</h1>
                    <div className="flex items-center justify-center flex-row">
                      <p>{price.toFixed(4)}</p>
                      <h1>&nbsp;USD</h1>
                    </div>
                  </div>
                  <div className="transparentCard justify-between w-60 md:w-80 ml-13">
                    <h1> MMPRO marketcap</h1>
                    <div className="flex items-center justify-center flex-row">
                      <p>{numeral(mmcap).format("0.0a")}</p>
                      <h1>&nbsp;USD</h1>
                    </div>
                  </div>
                  <div className="transparentCard justify-between w-60 md:w-80 ml-13">
                    <h1> MMPRO supply</h1>
                    <div className="flex items-center justify-center flex-row">
                      <p>{numeral(totalSupply).format("0.00a")}</p>
                      <h1>&nbsp;MMPRO</h1>
                    </div>
                  </div>
                </div>
              </div>
              {/* <Button
                className="w-full md:w-2/5 text-2xl flex flex-row justify-center mx-auto"
                uppercase={false}
                onClick={async () => await init()}
              >
                {loading && <Spinner color="white" size={40} />}
                {!loading && (error !== "" ? error : "CONNECT METAMASK WALLET")}
              </Button> */}

              <div className="text-white text-center mt-6 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold">
                <h1>Stake Your Token</h1>
              </div>
              <div className="w-full md:w-3/6 justify-center mx-auto mt-6">
                <Card title="Rules">
                  <div className="flex flex-col pt-8 pb-4 text-white text-center">
                    <ul>
                      <li>1. Connect your MetaMask wallet to participate</li>
                      <li>
                        2. Stake tokens and earn daily returns from allocated
                        pool
                      </li>
                      <li>3. Withdraw earned rewards anytime</li>
                      <li>4. Unstake tokens anytime</li>
                      <li>5. Earn extra rewards by referring new members</li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          )}
          {/* <Box>
            <TabsContext value={tabIndex}>
              <TabList
                onChange={handleTabChange}
                aria-label="lab API tabs example"
              >
                <Tab label="Flexible Staking" value="1" />
                <Tab label="Fixed Staking" value="2" />
              </TabList>
            </TabsContext>
          </Box> */}
          {active && loading && (
            <div className="flex justify-center">
              <Spinner size={100} />
            </div>
          )}
          {active && !loading && (
            <>
              <div>
                <div className="w-full mx-0 mt-4 mb-1 rounded">
                  <ul className="flex justify-start">
                    <li
                      onClick={() => setTabIndex(1)}
                      className={
                        tabIndex === 1
                          ? "text-sm border-none py-1 px-4 rounded-md text-black mr-1 cursor-default bg-white"
                          : "text-sm text-white py-1 px-4 mr-1 cursor-pointer bg-none"
                      }
                    >
                      <p className="font-normal  m-0 p-0">Flexible Stake</p>
                    </li>
                    <li
                      onClick={() => setTabIndex(2)}
                      className={
                        tabIndex === 2
                          ? "text-sm border-none py-1 px-4 rounded-md text-black mr-1 cursor-default bg-white"
                          : "text-sm text-white py-1 px-4 mr-1 cursor-pointer bg-none"
                      }
                    >
                      <p className="font-light  m-0 p-0">Fixed Stake ({apy})</p>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                {stakeTokenBoxList.length > 0 && tabIndex === 1 && (
                  <div className="grid grid-col-1 gap-2 w-full card-bg rounded-lg">
                    {/* className="transparentCard justify-between w-auto mx-12" */}
                    <div className="text-center">
                      {stakeTokenBoxList.map((stakeTokenBox, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setCurStakeTokenID(
                              flexibleStakeDowned ? -1 : index
                            );
                            setFlexibleStakeDowned(!flexibleStakeDowned);
                          }}
                          className="flex justify-between w-auto py-4 px-5 items-center"
                        >
                          <div className="flex justify-start">
                            <img
                              src={stakeTokenBox["img"]}
                              width="60"
                              alt={stakeTokenBox["name"]}
                            />
                            <div className="flex flex-col md:mx-4 mx-1">
                              <div className="flex flex-row justify-between">
                                <div className="font-extrabold">
                                  {stakeTokenBox["name"]}
                                </div>
                              </div>
                              <div className="flex flex-row justify-between">
                                <div>TVL: </div>
                                <div className="font-black">
                                  {stakeTokenBox["TVL"] / 1000000000000000000}
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
                          {flexibleStakeDowned ? (
                            <AiOutlineUp />
                          ) : (
                            <AiOutlineDown />
                          )}
                          {/* <Button onClick={() => handleSelectCurStake(index)}>
                              Stake
                            </Button> */}
                        </div>
                      ))}
                    </div>
                    {curStakeTokenID !== -1 &&
                      initLoading === false &&
                      tabIndex === 1 &&
                      !initializing && (
                        <div className="grid grid-col-1 md:grid-cols-2 gap-6 w-full p-2">
                          <BorderCard title="Your / Total Staked MMPRO">
                            <div className="flex flex-col pt-8 pb-4 text-white">
                              <div className="text-center">
                                <span className="text-white text-2xl ml-2">
                                  Yours
                                </span>
                                <span className="text-white text-5xl">
                                  {parseFloat(
                                    BigInt(stakedByUser) /
                                      BigInt(1000000000000000000)
                                  ).toFixed(2)}
                                </span>
                                <span className="text-white text-2xl ml-2">
                                  MMPRO
                                </span>
                                <br />
                                <span className="text-white text-2xl ml-2">
                                  Total
                                </span>
                                <span className="text-white text-5xl">
                                  {parseFloat(
                                    BigInt(totalStaked) /
                                      BigInt(1000000000000000000)
                                  ).toFixed(2)}
                                </span>
                                <span className="text-white text-2xl ml-2">
                                  MMPRO
                                </span>
                              </div>
                              <div className="text-center">
                                {parseFloat(
                                  (parseFloat(totalStaked) /
                                    parseFloat(balance.toString())) *
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
                                  {parseFloat(
                                    totalRewards / 1000000000000000000
                                  ).toFixed(2)}
                                </span>
                                <span className="text-white text-2xl ml-2">
                                  MMPRO
                                </span>
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
                                      <img
                                        src="/images/unlocked.svg"
                                        width="25"
                                        alt=""
                                      />
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
                                  {BigInt(
                                    BigInt(balance) /
                                      BigInt(1000000000000000000)
                                  ).toString()}
                                </span>
                                <span className="text-white text-2xl ml-2">
                                  MMPRO
                                </span>
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
                                  className="flex flex-row items-center justify-center"
                                >
                                  {stakeLoading ? (
                                    <Spinner size={30} />
                                  ) : (
                                    <>
                                      <img
                                        src="/images/locked.svg"
                                        width="25"
                                        alt=""
                                      />
                                      <span className="w-48">
                                        APPROVE & STAKE
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
                                  {(
                                    parseFloat(stakedByUser) /
                                    1000000000000000000
                                  ).toFixed(2)}
                                </span>
                                <span className="text-white text-2xl ml-2">
                                  MMPRO
                                </span>
                              </div>
                              <div className="rounded-md border-2 border-primary p-2 flex justify-between items-center">
                                <select
                                  value={optionsState}
                                  onChange={onSelectChanged}
                                  className="text-white font-extrabold flex-shrink text-2xl w-full bg-transparent focus:outline-none focus:bg-white focus:text-black px-2"
                                >
                                  {unstakeList.map((unstake) => (
                                    <option key={unstake.id} value={unstake.id}>
                                      {parseFloat(
                                        unstake.amount / 1000000000000000000
                                      )}
                                      {/* {unstake.amount} */}
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
                                >
                                  {unstakeLoading ? (
                                    <Spinner size={30} />
                                  ) : (
                                    <>
                                      <img
                                        src="/images/unlocked.svg"
                                        width="25"
                                        alt=""
                                      />
                                      <span className="w-36">UNSTAKE ALL</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </BorderCard>
                        </div>
                      )}
                    {initLoading && (
                      <div className="flex justify-center">
                        <Spinner color="white" size={100} />
                      </div>
                    )}
                  </div>
                )}
                {initLoading === false && tabIndex === 2 && (
                  <div className="grid grid-col-1 md:grid-cols-2 gap-6 mt-10 w-full">
                    <Card title="Your / Total Staked MMPRO">
                      <div className="flex flex-col pt-8 pb-4 text-white">
                        <div className="text-center">
                          <span className="text-white text-2xl ml-2">
                            Yours
                          </span>
                          <span className="text-white text-5xl">
                            {parseFloat(
                              BigInt(stakedByUser) / BigInt(1000000000000000000)
                            ).toFixed(2)}
                          </span>
                          <span className="text-white text-2xl ml-2">
                            MMPRO
                          </span>
                          <br />
                          {/* <span className="text-white text-2xl ml-2">
                            Total
                          </span>
                          <span className="text-white text-5xl">
                            {parseFloat(totalStaked).toFixed(2)}
                          </span>
                          <span className="text-white text-2xl ml-2">
                            MMPRO
                          </span> */}
                        </div>
                        {/* <div className="text-center">
                          {(
                            parseFloat(
                              parseFloat(totalStaked) / parseFloat(balance)
                            ) * 100
                          ).toFixed(5)}
                          %
                        </div>
                        <div className="text-center">of total supply</div> */}
                      </div>
                    </Card>

                    <Card title="Your Earnings">
                      <div className="flex flex-col pt-8 px-2">
                        {usersStake && usersStake.length <= 0 ? (
                          <p className="text-center text-2xl">No eanring yet</p>
                        ) : (
                          <>
                            <div className="rounded-md border-2 border-primary p-2 flex justify-between items-center">
                              <select
                                value={unstakeIndex}
                                onChange={(e) =>
                                  setUnstakeIndex(e.target.value)
                                }
                                className="text-white font-extrabold flex-shrink text-2xl w-full bg-transparent focus:outline-none focus:bg-white focus:text-black px-2"
                              >
                                {usersStake &&
                                  usersStake.map((unstake, index) => (
                                    <option key={index} value={index}>
                                      {parseFloat(
                                        unstake.amount / 1000000000000000000
                                      ).toFixed(2)}
                                      (
                                      {parseFloat(
                                        unstake.rewards / 1000000000000000000
                                      ).toFixed(2)}
                                      )
                                    </option>
                                  ))}
                                ;
                              </select>
                            </div>
                            <div className="flex flex-row justify-center mt-2">
                              <Button
                                type="submit"
                                className="flex flex-row items-center justify-center w-48"
                                onClick={() => withdrawFixedEarning()}
                              >
                                {withdrawLoading ? (
                                  <Spinner size={30} />
                                ) : (
                                  <>
                                    <img
                                      src="/images/unlocked.svg"
                                      width="25"
                                      alt=""
                                    />
                                    <span className="w-64">
                                      Unstake & Claim
                                    </span>{" "}
                                  </>
                                )}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>

                    <Card title="Staking">
                      <div className="flex flex-col pt-8 px-2">
                        <div className="text-center pb-4">
                          <span className="text-lg text-gray-400">
                            Available amount:{" "}
                          </span>
                          <span className="text-white text-3xl">
                            {parseInt(
                              BigInt(balance) / BigInt(1000000000000000000)
                            )}
                          </span>
                          <span className="text-white text-2xl ml-2">
                            MMPRO
                          </span>
                        </div>
                        <div className="rounded-md border-2 border-primary p-2 my-2 flex justify-between items-center">
                          <select
                            value={stakingOptionState}
                            onChange={onStakeOptionSelectChanged}
                            className="text-white font-extrabold flex-shrink text-2xl w-full bg-transparent focus:outline-none focus:bg-white focus:text-black px-2"
                          >
                            {fixedStakingOption.map((option, index) => (
                              <option key={index} value={index}>
                                Option {index + 1} :
                                {parseFloat(option.periodInDays)}
                              </option>
                            ))}
                            ;
                          </select>
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
                            onClick={() => fixedStake()}
                            className="flex flex-row items-center justify-center"
                          >
                            {stakeLoading ? (
                              <Spinner size={30} />
                            ) : (
                              <>
                                <img
                                  src="/images/locked.svg"
                                  width="25"
                                  alt=""
                                />
                                <span className="w-48">APPROVE & STAKE</span>{" "}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>

                    <Card title="Time to stake">
                      <div className="flex flex-col pt-8 px-2 text-center">
                        {calcUnstakeTime(firstUnstakeTime)}
                      </div>
                    </Card>
                  </div>
                )}
                {initLoading && tabIndex === 2 && (
                  <div className="flex justify-center">
                    <Spinner color="white" size={100} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
