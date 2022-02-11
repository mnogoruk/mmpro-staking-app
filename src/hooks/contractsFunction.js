export const getTVLInfo = async (web3, contract, account, address) => {
    const res = await contract.methods.tokenStakeInfo(address).call()
    return res
}

export const getAPYInfo = async (web3, contract, account, address) => {
    return 0
}