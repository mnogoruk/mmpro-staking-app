import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Card from "../components/common/Card";
import Spinner from "../components/common/Spinner";
import { initWeb3 } from "../utils.js";
// import LeadStake from "../contracts/flexibleStake.json";
import FlexibleStake from "../contracts/FlexibleStake.json";
import MMPRO from "../contracts/MMPRO.json";
// import ERC20 from "../contracts/ERC20.json";
import fromExponential from "from-exponential";
import { Link } from "react-router-dom";
const HomePage = (props) => {

  const [loading, setLoading] = useState(false);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [unstakeLoading, setUnstakeLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [error, setError] = useState("");
  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  // const [flexibleStake, setLeadStake] = useState();
  const [flexibleStake, setFlexibleStake] = useState();
  const [emissionPerSecond, setEmissionPerSecond] = useState();
  const [cumulativeIndex, setCumulativeIndex] = useState();
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState();
  const [stakeToken, setStakeToken] = useState();
  const [usersStake, setUserStake] = useState();
  const [mmPROToken, setMmPROToken] = useState();
  const [totalSupply, setTotalSupply] = useState();
  const [balance, setBalance] = useState();
  const [totalStaked, setTotalStaked] = useState();
  const [freeAmount, setFreeAmount] = useState();
  const [totalRewards, setTotalRewards] = useState();
  const [amount, setAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
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

    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    if (networkId !== 97) {
      setError("Please connect BSC Testnet account");
      setLoading(false);
      return;
    }

    const mmPROToken = new web3.eth.Contract(
      MMPRO.abi,
      "0xa8892B044eCE158cb4869B59F1972Fa01Aae6D2E"
    ); //mainnet address for lead token
    const totalSupply = await mmPROToken.methods.totalSupply().call();
    const balance = await mmPROToken.methods.balanceOf(accounts[0]).call();

    const flexibleStake = new web3.eth.Contract(
      FlexibleStake.abi,
      "0x782A2651BC14b8529Cca036b9AFc2e1487e8ecEe"
    ); //mainnet adddress for staking dapp
    const totalStaked = await flexibleStake.methods.totalStaked().call();
    const emissionPerSecond = await flexibleStake.methods.emissionPerSecond().call();
    const cumulativeIndex = await flexibleStake.methods.cumulativeIndex().call();
    const lastUpdatedTimestamp = await flexibleStake.methods.lastUpdatedTimestamp().call();
    const stakeToken = await flexibleStake.methods.stakeToken().call();
    const freeAmount = await flexibleStake.methods.freeAmount().call();
    // const usersStake = await flexibleStake.methods.usersStake(accounts[0]).call();

    setWeb3(web3);
    setAccounts(accounts);
    setMmPROToken(mmPROToken);
    setTotalSupply(totalSupply);
    setBalance(balance);
    setFreeAmount(freeAmount);
    setTotalStaked(totalStaked);
    setEmissionPerSecond(emissionPerSecond);
    setCumulativeIndex(cumulativeIndex);
    setLastUpdatedTimestamp(lastUpdatedTimestamp);
    setStakeToken(stakeToken);
    setFlexibleStake(flexibleStake);

    window.ethereum.on("accountsChanged", (accounts) => {
      setAccounts(accounts);
    });

    setLoading(false);
  };

  const isReady = () => {
    return !!flexibleStake && !!web3 && !!accounts;
  };

  useEffect(() => {
    const triggerAlreadyInjectedWeb3 = async () => {
      if (window.ethereum) {
        if (
          window.ethereum.selectedAddress &&
          window.ethereum.networkVersion === "1"
        ) {
          await init();
        }
      }
    };
    triggerAlreadyInjectedWeb3();
  }, []);

  async function updateAll() {
    await Promise.all([
      updateTotalSupply(),
      updateAccountBalance(),
      updateTotalStaked(),
      updateEmissionPerSecond(),
      updateCumulativeIndex(),
      updateLastUpdatedTimestamp(),
      updateStakeToken(),
      updateFreeAmount()
    ]);
  }

  useEffect(() => {
    if (isReady()) {
      updateAll();
    }
  }, [flexibleStake, mmPROToken, web3, accounts]);

  async function updateEmissionPerSecond() {
    const emissionPerSecond = await flexibleStake.methods.emissionPerSecond().call();
    setEmissionPerSecond(emissionPerSecond);
    return emissionPerSecond;
  }

  async function updateFreeAmount() {
    const freeAmount = await flexibleStake.methods.freeAmount().call();
    setFreeAmount(freeAmount);
    return freeAmount;
  }

  async function updateCumulativeIndex() {
    const cumulativeIndex = await flexibleStake.methods.cumulativeIndex().call();
    setCumulativeIndex(cumulativeIndex);
    return cumulativeIndex;
  }

  async function updateLastUpdatedTimestamp() {
    const lastUpdatedTimestamp = await flexibleStake.methods.lastUpdatedTimestamp().call();
    setLastUpdatedTimestamp(lastUpdatedTimestamp);
    return lastUpdatedTimestamp;
  }

  async function updateStakeToken() {
    const stakeToken = await flexibleStake.methods.stakeToken().call();
    setStakeToken(stakeToken);
    return stakeToken;
  }

  async function updateStakes() {
    const stake = await flexibleStake.methods.usersStake(accounts[0], 10).call();
    setUserStake(stake);
    return stake;
  }

  async function updateAccountBalance() {
    if (mmPROToken) {
      // debugger;
      const balance = await mmPROToken.methods.balanceOf(accounts[0]).call();
      setBalance(balance);
      return balance;
    }
  }

  async function updateTotalSupply() {
    if (mmPROToken) {
      const totalSupply = await mmPROToken.methods.totalSupply().call();
      setTotalSupply(totalSupply);
      return totalSupply;
    }
  }

  async function updateTotalStaked() {
    if (flexibleStake) {
      const totalStaked = await flexibleStake.methods.totalStaked().call();
      return totalStaked;
    }
  }

  async function stake() {
    setStakeLoading(true);
    console.log(amount);
    const actual = amount * (10 ** 18);
    const arg = fromExponential(actual);
    try {
      await mmPROToken.methods
        .approve("0x782A2651BC14b8529Cca036b9AFc2e1487e8ecEe", arg)
        .send({ from: accounts[0] });

      await flexibleStake.methods.stake(arg).send({ from: accounts[0] });
      await updateAll();
    } catch (err) {
      if (err.code !== 4001) {
        setShowModal(true);
      }
      console.error(err);
    }
    setStakeLoading(false);
  }

  async function withdrawEarnings() {
    if (parseFloat(totalRewards) === 0) {
      console.error("No earnings yet!");
      return;
    }
    setWithdrawLoading(true);
    try {
      await flexibleStake.methods.withdrawEarnings().send({ from: accounts[0] });
      await updateAll();
    } catch (err) {
      if (err.code !== 4001) {
        setShowModal(true);
      }
      console.error(err);
    }
    setWithdrawLoading(false);
  }

  return (
    <div className="w-full overflow-hidden">
      {showModal && (
        <Modal title="" onClose={() => setShowModal(false)}>
          <div className="text-2xl mb-2">
            Error! Your transaction has been reverted!
          </div>
          <div>1. Please check your account and retry again...</div>
          <div>2. Your referrer's address is a registered member if any</div>

          <div className="my-2">
            Thanks for your support and feel free to{" "}
            <a href="https://www.leadwallet.io/contact" className="text-blue-500">
              contact us
            </a>
          </div>

          <div className="flex flex-row justify-center">
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </div>
        </Modal>
      )}
      <div className="relative z-20 w-full top-0">
        <img
          src="/images/nosiy.png"
          alt=""
          className="absolute z-10 top-noisy"
        />
        <img
          src="/images/nosiy.png"
          alt=""
          className="absolute z-10 second-noisy"
        />
      </div>

      <div className="relative z-10 w-full top-0">
        <div className="absolute w-full home-gradient"></div>
      </div>

      <div className="relative w-full z-30">
        {/* <Header /> */}

        <div className="container mx-auto pb-18 px-4 force-height">
          {!accounts && (
            <div className="w-full py-6 text-center">
              <div style={{ textAlign: "center", marginTop: "1em" }}>
                <div id='controls' >
                  <Link id='toggler' to='#' >Switch To Ethereum Chain</  Link>
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
                      <li>
                        1. Connect your MetaMask wallet to participate
                      </li>
                      <li>
                        2. Stake tokens and earn daily returns from allocated pool
                      </li>
                      <li>
                        3. Withdraw earned rewards anytime
                      </li>
                      <li>
                        4. Unstake tokens anytime
                      </li>
                      <li>
                        5. Earn extra rewards by referring new members
                      </li>
                    </ul>
                  </div>
                </Card>
                <div className="flex flex-col pt-8 px-2">
                  <br /><br /><br /><br />
                </div>
                {/* <Card noLine>
                  <div className="flex flex-col px-2">
                    <div className="text-center pb-4">
                      <div className="text-white text-xs">
                        <span className="text-blue-500">Disclaimer</span> Staking Smart Contract was audited by{" "}
                        <a href="https://immunebytes.com/" target="_blank" className="text-blue-500">
                          Immune Bytes
                        </a>. Keep in mind that security audits don't fully eliminate all
                        possible security risks. Use our staking page at your MMPRO risk. <br />
                        <span className="text-blue-500">Note</span> The Stake Rewards can be reduced without prior warning, stakers are advised to claim their rewards daily.
                      </div>
                    </div>
                  </div>
                </Card> */}
              </div>
            </div>
          )}
          {accounts && (
            <div className="grid grid-col-1 md:grid-cols-2 gap-6 mt-10">
              <Card title="Total Staked MMPRO">
                <div className="flex flex-col pt-8 pb-4 text-white">
                  <div className="text-center">
                    <span className="text-white text-5xl">
                      {(
                        (parseFloat(totalStaked).toFixed(2)) /
                        1000000000000000000
                      ).toFixed(2)}
                    </span>
                    <span className="text-white text-2xl ml-2">MMPRO</span>
                  </div>
                  <div className="text-center">
                    {(
                      (parseFloat(totalStaked) * 100.0) /
                      parseFloat(totalSupply)
                    ).toFixed(5)}
                    %
                  </div>
                  <div className="text-center">of total supply</div>
                </div>
              </Card>

              <Card title="Fees">
                <div className="flex flex-col pt-8 px-2">
                  <div className="text-center pb-8">
                    <div className="text-gray-400 text-lg font-thin">
                      <ul>
                        {/* <li>
                          Registration Fee:{"  "}
                          <span className="text-white text-2xl">
                            {parseInt(registrationTax) / 1000000000000000000} MMPRO
                          </span>
                        </li>
                        <li>
                          Staking Fee:{"  "}
                          <span className="text-white text-2xl">
                            {parseFloat(stakingTax) / 10} %
                          </span>
                        </li>
                        <li>
                          Unstaking Fee:{"  "}
                          <span className="text-white text-2xl">
                            {parseFloat(unstakingTax) / 10} %
                          </span>
                        </li>
                        <li>
                          Minimum Stake:{"  "}
                          <span className="text-white text-2xl">
                            {parseInt(minStake) / 1000000000000000000} MMPRO
                          </span>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              {flexibleStake && <Card title="Staking">
                <div className="flex flex-col pt-8 px-2">
                  <div className="text-center pb-4">
                    <span className="text-lg text-gray-400">
                      Minimum amount needed:{" "}
                    </span>
                    {/* <span className="text-white text-3xl">{parseInt(minStake) / 1000000000000000000}</span> */}
                    <span className="text-white text-2xl ml-2">MMPRO</span>
                  </div>
                  <div className="text-center pb-4">
                    <span className="text-lg text-gray-400">
                      Available amount:{" "}
                    </span>
                    <span className="text-white text-3xl">{parseInt(parseInt(freeAmount) / 1000000000000000000)}</span>
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
                      className="flex flex-row items-center w-48 justify-center"
                    >
                      {stakeLoading ? (
                        <Spinner size={30} />
                      ) : (
                        <>
                          <img src="/images/locked.svg" width="25" alt="" />
                          <span className="w-16">STAKE</span>{" "}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>}

              <Card title="Your Earnings">
                <div className="flex flex-col pt-8 px-2">
                  <div className="text-center pb-8">
                    <span className="text-white text-5xl">
                      {(parseFloat(totalRewards) / 1000000000000000000).toFixed(2)}
                    </span>
                    <span className="text-white text-2xl ml-2">MMPRO</span>
                  </div>
                  <div className="flex flex-row justify-center">
                    <Button
                      type="submit"
                      className="flex flex-row items-center justify-center w-32"
                      onClick={() => withdrawEarnings()}
                    >
                      {withdrawLoading ? (
                        <Spinner size={30} />
                      ) : (
                        <>
                          <img src="/images/unlocked.svg" width="25" alt="" />
                          <span className="w-24">CLAIM</span>{" "}
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-center text-white text-2xl mt-8 mx-2">
                    <div>
                      {/* <div>
                        <span className="text-gray-400 text-lg">
                          Staking Reward:{" "}
                        </span>
                        {parseFloat(stakingRewards) / 1000000000000000000} MMPRO
                      </div>
                      <div>
                        <span className="text-gray-400 text-lg">
                          Daily Return:{" "}
                        </span>
                        {parseFloat(dailyROI) / 100} %
                      </div> */}
                    </div>
                    <div>
                      {/* <div>
                        <span className="text-gray-400 text-lg">
                          Referral Reward:
                        </span>{" "}
                        {parseFloat(referralRewards) / 1000000000000000000} MMPRO
                      </div>
                      <div>
                        <span className="text-gray-400 text-lg">
                          Referral Count:
                        </span>{" "}
                        {referralCount}
                      </div> */}
                    </div>
                  </div>
                </div>
              </Card>

              {/* <Card title="Unstaking">
                <div className="flex flex-col pt-8 px-2">
                  <div className="text-center pb-4">
                    <span className="text-lg text-gray-400">
                      Available to unstake:{" "}
                    </span>
                    <span className="text-white text-3xl">{(parseFloat(stakes) / 1000000000000000000).toFixed()}</span>
                    <span className="text-white text-2xl ml-2">MMPRO</span>
                  </div>
                  <div className="rounded-md border-2 border-primary p-2 flex justify-between items-center">
                    <input
                      type="number"
                      placeholder="MMPRO To Unstake"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      className="text-white font-extrabold flex-shrink text-2xl w-full bg-transparent focus:outline-none focus:bg-white focus:text-black px-2"
                    />
                    <Button
                      onClick={() => unstake()}
                      className="flex flex-row items-center w-48 justify-center"
                    >
                      {unstakeLoading ? (
                        <Spinner size={30} />
                      ) : (
                        <>
                          <img src="/images/unlocked.svg" width="25" alt="" />
                          <span className="w-24">UNSTAKE</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card> */}
            </div>
          )}
        </div>

        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default HomePage;
