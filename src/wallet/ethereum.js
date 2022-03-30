export const ethereumConnect = () =>
  window.ethereum.request({ method: "eth_requestAccounts" });
export const isEthereumConnected = window.ethereum
  ? window.ethereum.isConnected()
  : false;
export const isEthereumMetaMask = window.ethereum
  ? window.ethereum.isMetaMask
  : null;
export const ethereumSendTransaction = (params) =>
  window.ethereum.request({
    method: "eth_sendTransaction",
    params,
  });

export const switchNetwork = async (chainId) => {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x38",
              rpcUrls: ["https://bsc-dataseed.binance.org/"],
              chainName: "BSC Mainnet",
              nativeCurrency: { name: "BNB", decimals: 18, symbol: "BNB" },
              blockExplorerUrls: ["https://bscscan.com/"],
            },
          ],
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
};
