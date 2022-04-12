/* eslint-disable no-undef */
import React, {useState, useEffect} from "react";
import Button from "../../components/common/Button";
import BorderCard from "../../components/common/BorderCard";
import Spinner from "../../components/common/Spinner";
import {useWeb3React} from "@web3-react/core";
import {useFixedStaking, useMMProContract} from "../../hooks/useContracts";
import {
    getFixedStakingAddress,
    getMMProAddress,
} from "../../utils/getAddress";
import {wei2eth} from "../../utils/common";
import fromExponential from "from-exponential";

const NOLOADING = 0;
const APPROVELOADING = 1;
const STAKELOADING = 2;
const UNSTAKELOADING = 3;

const shouldUpdateTimer = (currentTime, firstActiveUnstakeTime) => {
    if (!!firstActiveUnstakeTime && firstActiveUnstakeTime !== 99999999999999999999) {
        const currentTimeInSeconds = Math.floor(currentTime.getTime() / 1000)
        return firstActiveUnstakeTime < currentTimeInSeconds
    }
    return false
}

export default function FixedLayout(props) {
    // const { setFixedAPY } = props;
    const {active, account} = useWeb3React();
    const fixedStakeContract = useFixedStaking();
    const MMProContract = useMMProContract();
    const [initLoading, setInitLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [userStake, setUserStake] = useState();
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState(0);
    const [stakedByUser, setStakedByUser] = useState(0);
    const [unstakeIndex, setUnstakeIndex] = useState(0);
    const [stakingOptionState, setStakingOptionState] = useState(0);
    const [fixedStakingOption, setFixedStakingOption] = useState(Array);
    const [firstActiveUnstakeTime, setFirstActiveUnstakeTime] = useState();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [unstakeList, setUnstakeList] = useState([]);
    const [allowance, setAllowance] = useState(0);
    const [updateLoading, setUpdateLoading] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setCurrentTime(new Date());
        }, 1000);
    }, [currentTime]);

    useEffect(() => {
        const initValues = async () => {
            setInitLoading(true);
            await initFixedStake();
            setInitLoading(false);
        };
        if (active) {
            initValues();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);


    let flag = shouldUpdateTimer(currentTime, firstActiveUnstakeTime)

    useEffect(() => {
        if (!updateLoading) {
            const updateValues = async () => {
                await initFixedStake();
            }
            setUpdateLoading(true)
            if (active) {
                updateValues();
            }
            setUpdateLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flag])

    const initFixedStake = async () => {
        const tmpFixedStakeOptinos = await fixedStakeContract.methods
            .getStakeOptions(getMMProAddress())
            .call();
        const tmpBalance = await MMProContract.methods.balanceOf(account).call();
        const stakedByUserArray = await fixedStakeContract.methods
            .getUserStakes(account)
            .call();
        const allowance = await MMProContract.methods
            .allowance(account, getFixedStakingAddress())
            .call();

        var sumOfStaked = 0;
        var unstakeLists = [];
        var tmpFirstUnstake = 99999999999999999999;
        for (var i = 0; i < stakedByUserArray.length; i++) {
            if (stakedByUserArray[i].stakeToken === getMMProAddress()) {
                sumOfStaked += parseInt(stakedByUserArray[i].amount);
            }
            if (stakedByUserArray[i].amount > 0) {
                unstakeLists.push({id: i, amount: stakedByUserArray[i].amount});
            }

            if (Math.floor(currentTime.getTime() / 1000) < parseInt(stakedByUserArray[i].end)) {
                if (tmpFirstUnstake > parseInt(stakedByUserArray[i].end)) {
                    tmpFirstUnstake = parseInt(stakedByUserArray[i].end)
                }
            }
        }

        setAmount(0);
        setAllowance(allowance);
        setBalance(tmpBalance);
        setStakedByUser(sumOfStaked);
        setUserStake(stakedByUserArray);
        setUnstakeList(unstakeLists);
        setFixedStakingOption(tmpFixedStakeOptinos);
        setFirstActiveUnstakeTime(tmpFirstUnstake);
    };

    const approve = async () => {
        setActionLoading(APPROVELOADING);
        const amount2eth = fromExponential(10 ** 10 * 10 ** 18);
        await MMProContract.methods
            .approve(getFixedStakingAddress(), amount2eth)
            .send({from: account});
        await initFixedStake();
        setActionLoading(NOLOADING);
    };

    const withdrawEarnings = async () => {
        if (userStake.length === 0) {
            console.log("No earning yet!");
            return;
        }
        setActionLoading(UNSTAKELOADING);
        try {
            const s = await fixedStakeContract.methods
                .usersStake(account, unstakeList[unstakeIndex]["id"])
                .call();
            if (s.end < Date.now() / 1000) {
                await fixedStakeContract.methods
                    .withdraw(getMMProAddress(), unstakeList[unstakeIndex]["id"])
                    .send({from: account});
            } else {
                setError("Not availalbe to Claim");
            }
        } catch (err) {
            if (err.code !== 4001) {
                console.error(err);
            }
            console.error(err);
        }
        await initFixedStake();
        setActionLoading(NOLOADING);
    };

    const stake = async () => {
        const arg = fromExponential(amount * 10 ** 18);
        try {
            const allowance = await MMProContract.methods
                .allowance(account, getFixedStakingAddress())
                .call();
            if (allowance < arg) {
                await approve();
            }
        } catch (e) {
            console.log(e);
        }
        setActionLoading(STAKELOADING);
        try {
            await fixedStakeContract.methods
                .stake(getMMProAddress(), arg, stakingOptionState)
                .send({from: account});
        } catch (err) {
            if (err.code !== 4001) {
                console.error(err);
            }
            console.error(err);
        }
        await initFixedStake();
        setActionLoading(NOLOADING);
    };

    const onStakeOptionSelectChanged = (e) => {
        setStakingOptionState(e.target.value);
    };

    const calcUnstakeTime = (fistStaktime) => {
        if (fistStaktime >= 99999999999999999999) {
            return "0d 0h 0m 0s";
        }

        const date = new Date(fistStaktime * 1000);
        const diff = date.getTime() - currentTime.getTime();

        if (diff <= 0) {
            return "0d 0h 0m 0s";
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
        // console.log({diff_in_mins})
        return `${diff_in_days}d ${diff_in_hours}h ${diff_in_mins}m ${diff_in_secs}s`;

    };

    return (
        <div className="grid grid-col-1 gap-6 w-full">
            {!active && <div className="text-center">Connect Wallet</div>}
            {initLoading && <div className="text-center">Loading...</div>}
            {!initLoading && active && (
                <div className="grid grid-col-1 md:grid-cols-2 card-bg rounded-lg p-4 gap-6 my-2 w-full">
                    <BorderCard title="Your / Total Staked MMPRO">
                        <div className="flex flex-col pt-8 pb-4 text-white">
                            <div className="text-center">
                                <span className="text-white text-2xl ml-2">Yours</span>
                                <span className="text-white text-5xl">
                  {parseFloat(wei2eth(stakedByUser)).toFixed(2)}
                </span>
                                <span className="text-white text-2xl ml-2">MMPRO</span>
                                <br/>
                            </div>
                        </div>
                    </BorderCard>

                    <BorderCard title="Your Earnings">
                        <div className="flex flex-col pt-8 px-2">
                            {userStake && userStake.length <= 0 ? (
                                <p className="text-center text-2xl">No eanring yet</p>
                            ) : (
                                <>
                                    <div
                                        className="rounded-md border-2 border-primary p-2 flex justify-between items-center">
                                        <select
                                            value={unstakeIndex}
                                            onChange={(e) => setUnstakeIndex(e.target.value)}
                                            className="text-white font-extrabold flex-shrink text-2xl w-full bg-transparent focus:outline-none focus:bg-white focus:text-black px-2"
                                        >
                                            {userStake &&
                                            userStake.map((unstake, index) => (
                                                <option key={index} value={index}>
                                                    {parseFloat(wei2eth(unstake.amount)).toFixed(2)}(
                                                    {parseFloat(wei2eth(unstake.rewards)).toFixed(2)})
                                                </option>
                                            ))}
                                            ;
                                        </select>
                                    </div>
                                    <div className="flex flex-row justify-center mt-2">
                                        <Button
                                            type="submit"
                                            className="flex flex-row items-center justify-center w-48"
                                            onClick={() => withdrawEarnings()}
                                        >
                                            {actionLoading === UNSTAKELOADING ? (
                                                <Spinner size={30}/>
                                            ) : (
                                                <>
                                                    <img src="/images/unlocked.svg" width="25" alt=""/>
                                                    <span className="w-64">Unstake & Claim</span>{" "}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </BorderCard>

                    <BorderCard title="Staking">
                        <div className="flex flex-col pt-8 px-2">
                            <div className="text-center pb-4">
                <span className="text-lg text-gray-400">
                  Available amount:{" "}
                </span>
                                <span className="text-white text-3xl">
                  {parseInt(wei2eth(balance))}
                </span>
                                <span className="text-white text-2xl ml-2">MMPRO</span>
                            </div>
                            <span className="text-lg text-gray-400">Staking Duration</span>
                            <div
                                className="rounded-md border-2 border-primary p-2 my-2 flex justify-between items-center">
                                <select
                                    value={stakingOptionState}
                                    onChange={onStakeOptionSelectChanged}
                                    className="text-white font-extrabold flex-shrink text-2xl w-full bg-transparent focus:outline-none focus:bg-white focus:text-black px-2"
                                >
                                    {/* {fixedStakingOption.map((option, index) => ( */}
                                    {fixedStakingOption.length > 0 && (
                                        <option key={0} value={0}>
                                            {parseFloat(fixedStakingOption[0].periodInDays)} Mins
                                        </option>
                                    )}
                                    {/* ))} */}
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
                                    onClick={() => stake()}
                                    className="flex flex-row items-center justify-center"
                                >
                                    {actionLoading === APPROVELOADING ||
                                    actionLoading === STAKELOADING ? (
                                        <Spinner size={30}/>
                                    ) : (
                                        <>
                                            <img src="/images/locked.svg" width="25" alt=""/>
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

                    <BorderCard title="Time to stake">
                        <div className="flex flex-col pt-8 px-2 text-center">
                            {calcUnstakeTime(firstActiveUnstakeTime)}
                        </div>
                    </BorderCard>
                </div>
            )}
        </div>
    );
}
