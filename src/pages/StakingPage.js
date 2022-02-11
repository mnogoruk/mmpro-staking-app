import React, { useEffect, useState } from "react";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Card from "../components/common/Card";
import Spinner from "../components/common/Spinner";
import { initWeb3 } from "../utils.js";
import FlexibleStake from "../contracts/FlexibleStake.json";
import MMPRO from "../contracts/MMPRO.json";
import BUSD from "../contracts/Busd.json";
import fromExponential from "from-exponential";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StakingList from "../components/StakingList";
import { getFlexibleStakingAddress } from "../utils/getAddress";

const stakeTokenDataList = [
  {
    name: "MMPro",
    abi: MMPRO.abi,
    addr: "0xa8892B044eCE158cb4869B59F1972Fa01Aae6D2E",
    img: "/images/mmpro.png",
  },
  {
    name: "Busd",
    abi: BUSD.abi,
    addr: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
    img: "/images/busd.png",
  },
];
const HomePage = (props) => {
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [unstakeLoading, setUnstakeLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [error, setError] = useState("");
  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  const [flexibleStakeContract, setFlexibleStakeContract] = useState();
  // const [stakeToken, setStakeToken] = useState();
  // const [usersStake, setUserStake] = useState();
  // const [freeAmount, setFreeAmount] = useState();
  // const [totalSupply, setTotalSupply] = useState();

  const [wishStakeList, setWishStakeList] = useState(Array);

  const [balance, setBalance] = useState(0);
  const [totalStaked, setTotalStaked] = useState();
  const [stakedByUser, setStakedByUser] = useState(0);
  const [unstakeList, setUnstakeList] = useState([]);
  // const [unstakeAmount, setUnstakeAmount] = useState(0);
  const [totalRewards, setTotalRewards] = useState();
  const [amount, setAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [optionsState, setOptionsState] = useState(0);
  const [curStakeTokenID, setCurStakeTokenID] = useState(-1);
  const [curStakeTokenInfo, setCurStakeTokenInfo] = useState();
  const [curStakeTokenContract, setCurStakeTokenContract] = useState();
  const [stakeTokenBoxList, setStakeTokenBoxList] = useState(Array);

  const init = async () => {
    if (isReady()) {
      return;
    }

    setLoading(true);
    let web3;
    try {
      web3 = await initWeb3();
    } catch (err) {
      console.error(err);
      setLoading(false);
      return;
    }

    const networkId = await web3.eth.net.getId();
    if (networkId !== 97) {
      setError("Please connect BSC Testnet account");
      setLoading(false);
      return;
    }

    let tempWishStakeList = [];
    stakeTokenDataList.forEach((stakeToken) => {
      const tempStakeToken = new web3.eth.Contract(
        stakeToken["abi"],
        stakeToken["addr"]
      );
      tempWishStakeList.push(tempStakeToken);
    });

    const tempflexibleStake = new web3.eth.Contract(
      FlexibleStake.abi,
      "0xb30578c103Aa44450dE021C87083Dbd8e96102A2"
    );
    let tempStakeList = [];
    for (var i = 0; i < stakeTokenDataList.length; i++) {
      let stakeTokenInfo = {};
      stakeTokenInfo["name"] = stakeTokenDataList[i]["name"];
      stakeTokenInfo["img"] = stakeTokenDataList[i]["img"];
      stakeTokenInfo["addr"] = stakeTokenDataList[i]["addr"];
      stakeTokenInfo["TVL"] = (
        await tempflexibleStake.methods
          .tokenStakeInfo(stakeTokenDataList[i]["addr"])
          .call()
      )[2];
      tempStakeList.push({ ...stakeTokenInfo, id: i });
    }
    setStakeTokenBoxList(tempStakeList);
    setWeb3(web3);
    setAccounts(await web3.eth.getAccounts());
    setWishStakeList(tempWishStakeList);
    setFlexibleStakeContract(tempflexibleStake);
    setLoading(false);
  };
  console.log(wishStakeList);

  const initBalance = async () => {
    const tmpBalance = await wishStakeList[curStakeTokenID].methods
      .balanceOf(accounts[0])
      .call();
    const stakedByUserArray = await flexibleStakeContract.methods
      .getUserStakes(accounts[0])
      .call();
    let sumOfStaked = 0;
    stakedByUserArray.forEach((stakedByUserIndex) => {
      if (
        stakedByUserIndex.stakeToken === stakeTokenBoxList[curStakeTokenID].addr
      ) {
        sumOfStaked += parseInt(stakedByUserIndex.amount);
      }
    });

    let unstakeLists = [];
    let sumTotalRewards = 0;
    for (let i = 0; i < stakedByUserArray.length; i++) {
      const rewards = await flexibleStakeContract.methods
        .calcRewardsByIndex(accounts[0], i)
        .call();
      sumTotalRewards += parseInt(rewards);
      unstakeLists.push({ id: i, amount: stakedByUserArray[i].amount });
    }
    // setTotalSupply(totalSupply);
    // setFreeAmount(freeAmount);
    // setStakeToken(stakeToken);
    // setBalance(balance);
    // setTotalStaked(totalStaked);
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

    setLoading(false);
  };
  console.log(balance);
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
    if (flexibleStakeContract) {
      let sumOfStaked = 0;
      const stakedByUserArray = await flexibleStakeContract.methods
        .getUserStakes(accounts[0])
        .call();
      stakedByUserArray.forEach((stakedByUserIndex) => {
        if (
          stakedByUserIndex.stakeToken ===
          stakeTokenBoxList[curStakeTokenID]["addr"]
        ) {
          sumOfStaked =
            parseInt(sumOfStaked) + parseInt(stakedByUserIndex.amount);
        }
      });
      setStakedByUser(sumOfStaked);
      return sumOfStaked;
    }
  }

  async function updateTotalRewards() {
    if (flexibleStakeContract) {
      const stakedByUserArray = await flexibleStakeContract.methods
        .getUserStakes(accounts[0])
        .call();
      let sumTotalRewards = 0;
      let unstakeLists = [];
      for (let i = 0; i < stakedByUserArray.length; i++) {
        const rewards = await flexibleStakeContract.methods
          .calcRewardsByIndex(accounts[0], i)
          .call();
        if (rewards.claimable) {
          sumTotalRewards =
            parseInt(sumTotalRewards) + parseInt(rewards.rewards);
        }

        if (rewards.withdrawable) {
          unstakeLists.push({ id: i, amount: stakedByUserArray[i].amount });
        }
      }
      setTotalRewards(sumTotalRewards);
      setUnstakeList(unstakeLists);
      // return sumTotalRewards;
    }
  }

  async function updateAccountBalance() {
    if (curStakeTokenContract) {
      const balance = await curStakeTokenContract.methods
        .balanceOf(accounts[0])
        .call();
      setBalance(balance);
      return balance;
    }
  }

  async function updateTotalStaked() {
    if (flexibleStakeContract) {
      const totalStaked = (
        await flexibleStakeContract.methods
          .tokenStakeInfo(stakeTokenBoxList[curStakeTokenID]["addr"])
          .call()
      )[2];

      setTotalStaked(totalStaked);
      return totalStaked;
    }
  }

  console.log(totalStaked);

  async function stake() {
    setStakeLoading(true);
    const actual = amount * 10 ** 18;
    const arg = fromExponential(actual);
    try {
      const allowance = await curStakeTokenContract.methods
        .allowance(accounts[0], getFlexibleStakingAddress())
        .call();
      if (allowance === "0") {
        await curStakeTokenContract.methods
          .approve(getFlexibleStakingAddress(), arg)
          .send({ from: accounts[0] });
      }
      console.log(
        curStakeTokenInfo["addr"],
        amount,
        allowance,
        allowance === "0"
      );
      await flexibleStakeContract.methods
        .stake(curStakeTokenInfo["addr"], amount)
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
    console.log(optionsState);
    if (parseFloat(stakedByUser) === 0) {
      console.error("You don't have any staked LEADs yet!");
      return;
    }
    setUnstakeLoading(true);
    try {
      // const _userStake = await flexibleStake.methods
      //   .getUserStakes(accounts[0])
      //   .call();
      // const count = _userStake.length;
      await flexibleStakeContract.methods
        .withdraw(optionsState)
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
    try {
      const _userStake = await flexibleStakeContract.methods
        .getUserStakes(accounts[0])
        .call();
      const count = _userStake.length;
      for (let i = 0; i < count; i++) {
        await flexibleStakeContract.methods
          .claimRewards(i)
          .send({ from: accounts[0] });
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

  const handleSelectCurStake = (index) => {
    setCurStakeTokenID(index);
  };

  function onSelectChanged(event) {
    setOptionsState(event.target.value);
  }

  useEffect(() => {
    const initData = async () => {
      if (isReady()) {
        setInitLoading(true);
        setCurStakeTokenContract(wishStakeList[curStakeTokenID]);
        setCurStakeTokenInfo(stakeTokenBoxList[curStakeTokenID]);
        await initBalance();
        await updateAll();
        setInitLoading(false);
      }
    };
    initData();
  }, [curStakeTokenID, web3, accounts]);

  useEffect(() => {
    const triggerAlreadyInjectedWeb3 = async () => {
      if (window.ethereum) {
        await init();
      }
    };
    triggerAlreadyInjectedWeb3();
  }, []);

  return (
    <div className="w-full overflow-hidden main-gradient">
      {showModal && (
        <Modal title="" onClose={() => setShowModal(false)}>
          <div className="text-2xl mb-2">
            Error! Your transaction has been reverted!
          </div>
          <div>1. Please check your account and retry again...</div>
          <div>2. Your referrer's address is a registered member if any</div>

          <div className="my-2">
            Thanks for your support and feel free to{" "}
            <a
              href="https://www.leadwallet.io/contact"
              className="text-blue-500"
            >
              contact us
            </a>
          </div>

          <div className="flex flex-row justify-center">
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </div>
        </Modal>
      )}
      <div className="relative w-full z-30">
        <Header />

        <div className="container mx-auto pb-18 px-4 force-height">
          {!accounts && (
            <div className="w-full py-6 text-center">
              {/* <dov className="flex flex-row justify-around"> */}
              <div className="flex items-center justify-center flex-row w-full mb-24 mt-6">
                <div className="text-left">
                  <p className="text-6xl mb-2 font-semibold">Launchpad</p>
                  <p className="text-2xl mb-2 font-light">
                    {" "}
                    Connect your wallet &amp; Participate in IDO on MMPRO
                    Launchpad. For allocation you need to have MMPRO token.{" "}
                  </p>
                </div>
                <div>
                  <div className="transparentCard justify-space-between w-80 ml-13">
                    <h1> MMPRO price</h1>
                    <div className="flex items-center justify-center flex-row">
                      <p> 0.1321</p>
                      <h1> USD </h1>
                    </div>
                  </div>
                  <div className="transparentCard justify-space-between w-80 ml-13">
                    <h1> MMPRO marketcap</h1>
                    <div className="flex items-center justify-center flex-row">
                      <p> 13.1m</p>
                      <h1> USD </h1>
                    </div>
                  </div>
                  <div className="transparentCard justify-space-between w-80 ml-13">
                    <h1> MMPRO supply</h1>
                    <div className="flex items-center justify-center flex-row">
                      <p> 99.50m</p>
                      <h1> MMPRO </h1>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                className="w-full md:w-2/5 text-2xl flex flex-row justify-center mx-auto"
                uppercase={false}
                onClick={async () => await init()}
              >
                {loading && <Spinner color="white" size={40} />}
                {!loading && (error !== "" ? error : "CONNECT METAMASK WALLET")}
              </Button>

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
          {accounts && stakeTokenBoxList.length > 0 && curStakeTokenID === -1 && (
            <div className="grid grid-col-1 gap-6 mt-10">
              <Card title="Please select one">
                {stakeTokenBoxList.map((stakeTokenBox, index) => (
                  <div className="transparentCard w-auto mx-12" key={index}>
                    <div className="flex justify-start">
                      <img
                        src={stakeTokenBox["img"]}
                        width="40"
                        alt={stakeTokenBox["name"]}
                      />
                      <div className="flex flex-col mx-4">
                        <div className="flex flex-row justify-between">
                          <div>Name: </div>
                          <div className="font-extrabold">
                            {stakeTokenBox["name"]}
                          </div>
                        </div>
                        <div className="flex flex-row justify-between">
                          <div>TVL: </div>
                          <div className="font-extrabold">
                            {stakeTokenBox["TVL"]} USD
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => handleSelectCurStake(index)}>
                      Stake
                    </Button>
                  </div>
                ))}
              </Card>
            </div>
          )}
          {accounts && curStakeTokenID !== -1 && initLoading === false && (
            <div className="grid grid-col-1 md:grid-cols-2 gap-6 mt-10">
              <Card title="Your / Total Staked MMPRO">
                <div className="flex flex-col pt-8 pb-4 text-white">
                  <div className="text-center">
                    <span className="text-white text-2xl ml-2">Yours</span>
                    <span className="text-white text-5xl">
                      {parseFloat(stakedByUser).toFixed(2)}
                    </span>
                    <span className="text-white text-2xl ml-2">MMPRO</span>
                    <br />
                    <span className="text-white text-2xl ml-2">Total</span>
                    <span className="text-white text-5xl">
                      {parseFloat(totalStaked).toFixed(2)}
                    </span>
                    <span className="text-white text-2xl ml-2">MMPRO</span>
                  </div>
                  <div className="text-center">
                    {(
                      parseFloat(
                        parseFloat(totalStaked) / parseFloat(balance)
                      ) * 100
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
                      {(parseFloat(totalRewards) / 1000000000000000000).toFixed(
                        2
                      )}
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
                      {parseInt(parseInt(balance) / 1000000000000000000)}
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
                      {(parseFloat(stakedByUser) / 1000000000000000000).toFixed(
                        2
                      )}
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
                          {(
                            parseFloat(unstake.amount) / 1000000000000000000
                          ).toFixed(2)}
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
                          <img src="/images/unlocked.svg" width="25" alt="" />
                          <span className="w-36">UNSTAKE ALL</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
          {initLoading === true && (
            <div className="flex justify-center mt-12">
              <Spinner color="white" size={100} />
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
