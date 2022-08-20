/** @type import('hardhat/config').HardhatUserConfig */
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
require("@nomiclabs/hardhat-waffle")
require('dotenv').config();
module.exports = {
  solidity: "0.8.3",
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_MAINNET_RPC_URL
      }
    },
    rinkeby: {
      url: process.env.ALCHEMY_MAINNET_RPC_URL,
      // accounts: [`${process.env.WALLET_PK}`],
      accounts:{ mnemonic: process.env.MNEMONIC}

    },
  },
  etherscan: {
    apiKey: 'KGCR9NM6MYX9Z8KYBB8CJIUHYVTMEVAYBZ',
  },
};
