require('dotenv').config();
const fetch = require('node-fetch');

const getEthPriceAPI = async () => {
  const response = await fetch(
    `https://api-rinkeby.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_API_KEY}`
  );
  return response.json();
};
const getUsdEthPrice = ({ usd, ETH }) => {
  if (!usd && !ETH) return 0;
  return (parseFloat(usd) / parseFloat(ETH)).toString();
};

module.exports = {
  getEthPriceAPI,
  getUsdEthPrice,
};
