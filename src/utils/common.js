/* eslint-disable no-undef */
export const wei2eth = (val) => {
  if (val) {
    return BigInt(val) / BigInt(1000000000000000000);
  }
  return BigInt(0);
};

export const calcAPY = async (contract, tokenAddr, emission, flag, account) => {
  var totalStaked;
  var rewardAmount;
  var i;
  if (flag) {
    totalStaked = (await contract.methods.tokenStakeInfo(tokenAddr).call())
      .totalStaked;
    const stakedByUserArray = await contract.methods
      .getUserStakes(account)
      .call();
    var sumTotalRewards = 0;
    for (i = 0; i < stakedByUserArray.length; i++) {
      const rewards = await contract.methods
        .calcRewardsByIndex(account, i)
        .call();
      sumTotalRewards += parseInt(rewards);
    }
    rewardAmount = sumTotalRewards;
  } else {
    const stakedByUserArray = await contract.methods
      .getUserStakes(account)
      .call();
    var sumOfStaked = 0;
    var rewards = 0;
    for (i = 0; i < stakedByUserArray.length; i++) {
      if (stakedByUserArray[i].stakeToken === tokenAddr) {
        sumOfStaked += parseInt(stakedByUserArray[i].amount);
        rewards += parseInt(stakedByUserArray[i].rewards);
      }
    }
    totalStaked = sumOfStaked;
    rewardAmount = rewards;
  }
  totalStaked = totalStaked / 10 ** 18;
  var amount2eth = rewardAmount / 10 ** 18;
  if (totalStaked && amount2eth) {
    const shareRate = (amount2eth * 100) / (totalStaked + amount2eth);
    const currentRewardsPerday = (shareRate * emission) / 100;
    const estAnnualRewards = currentRewardsPerday * 365;
    const apy = parseFloat((estAnnualRewards * 100) / amount2eth).toFixed(2);
    return apy.toString() + "%";
  }
  return "0%";
};
