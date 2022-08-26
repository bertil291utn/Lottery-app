/** @type import('hardhat/config').HardhatUserConfig */
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-waffle');
require('@appliedblockchain/chainlink-plugins-fund-link');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('hardhat-deploy');

require("./tasks/getLotteryData");
require("./tasks/createLottery");
require("./tasks/declareWinner");

require('dotenv').config();
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.4.24',
      },
      {
        version: '0.8.3',
      },
      {
        version: '0.6.6',
      },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_MAINNET_RPC_URL,
      },
    },
    rinkeby: {
      url: process.env.ALCHEMY_RINKEBY_RPC_URL,
      // accounts: [`${process.env.WALLET_PK}`],
      accounts: { mnemonic: process.env.MNEMONIC },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
};
