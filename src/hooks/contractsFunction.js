export const getTVLInfo = async (web3, contract, account, address) => {
  const res = await contract.methods.tokenStakeInfo(address).call();
  return res;
};

export const getBalanceOfToken = async (tokenContract, address) => {
  const res = await tokenContract.methods.balanceOf(address).call();
  return res;
};

export const getTotalSupply = async (tokenContract) => {
  const res = await tokenContract.methods.totalSupply().call();
  return res;
};
