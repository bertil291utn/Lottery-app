// const { expect } = require('chai');
// const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
// const { BigNumber } = require('ethers');
// const { getEthPriceAPI, getUsdEthPrice } = require('./utils');
// const IERC20_SOURCE = require('./ERC20.abi.json');
// const { run } = require('hardhat');
// const LINK_TOKEN_ADDRESS_MAINNET = '0x514910771af9ca656af840dff83e8264ecf986ca';

// async function enterLotteryAction({ usdAmount, lotteryContract }) {
//   const {
//     result: { ethusd },
//   } = await getEthPriceAPI();
//   const entryAmount = getUsdEthPrice({ usd: usdAmount, ETH: ethusd });
//   await lotteryContract.startLottery();
//   await lotteryContract.enter({
//     value: ethers.utils.parseEther(entryAmount),
//   });
// }

// async function deployLotteryFixture() {
//   const Lottery = await ethers.getContractFactory('Lottery');
//   const [owner, addr1, addr2] = await ethers.getSigners();
//   const linkWeiBigNumbered = BigNumber.from((0.1 * 1e18).toString());
//   //TODO: deploy with mocked contracts
//   // await deployments.fixture(["mocks", "feed"])
//   // const priceConsumerV3 = await ethershrs.getContract("MockV3Aggregator")
//   const lotteryContract = await Lottery.deploy(
//     '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419' /*mainnet*/,
//     '0xf0d54349aDdcf704F77AE15b96510dEA15cb7952',
//     LINK_TOKEN_ADDRESS_MAINNET,
//     ethers.utils.parseEther('0.1'),
//     // linkWeiBigNumbered,
//     '0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445'
//   );
//   //TODO: add args to 02_Deploy_APIConsumer.js

//   await lotteryContract.deployed();

//   return { lotteryContract, owner, addr1, addr2 };
// }

// const lotteryStatus = {
//   OPEN: 'OPEN',
//   CLOSED: 'CLOSED',
//   CALCULATING_WINNER: 'CALCULATING_WINNER',
// };

// describe('Lottery init', () => {
//   it('should start lottery status as closed', async function () {
//     const { lotteryContract } = await loadFixture(deployLotteryFixture);
//     const lotteryStateEnum = await lotteryContract.lottery_state();
//     const closedLotteryStatus = Object.values(lotteryStatus).indexOf(
//       lotteryStatus.CLOSED
//     );
//     await expect(lotteryStateEnum).to.equal(closedLotteryStatus);
//   });

//   it('should have a default a usd entry fee', async () => {
//     const { lotteryContract } = await loadFixture(deployLotteryFixture);
//     const usdEntryInUSD = 50;
//     const lotteryStateEnum = await lotteryContract.usdEntryFee();
//     await expect(Number(lotteryStateEnum)).to.equal(usdEntryInUSD * 1e18);
//   });
// });

// describe('Start lottery', () => {
//   it('should start lottery', async () => {
//     const { lotteryContract } = await loadFixture(deployLotteryFixture);
//     await lotteryContract.startLottery();
//     const lotteryStateEnum = await lotteryContract.lottery_state();
//     const openLotteryStatus = Object.values(lotteryStatus).indexOf(
//       lotteryStatus.OPEN
//     );
//     await expect(lotteryStateEnum).to.equal(openLotteryStatus);
//   });

//   it('should set a usd entry fee', async () => {
//     const { lotteryContract } = await loadFixture(deployLotteryFixture);
//     const usdEntryInUSD = 51;
//     await lotteryContract.setMinUSD(usdEntryInUSD);
//     const lotteryStateEnum = await lotteryContract.usdEntryFee();
//     await expect(Number(lotteryStateEnum)).to.equal(usdEntryInUSD * 1e18);
//   });
// });

// describe('Enter lottery', () => {
//   it('should not be able to enter with/o starting lottery', async () => {
//     const { lotteryContract } = await loadFixture(deployLotteryFixture);

//     await expect(lotteryContract.enter()).to.be.revertedWith(
//       'Lottery is not open'
//     );
//   });

//   it('should be able to enter in lottery', async () => {
//     const { lotteryContract, owner } = await loadFixture(deployLotteryFixture);

//     const usdAmount = '50.9';
//     // add at least 10-20 cents more for gas fees

//     await enterLotteryAction({ usdAmount, lotteryContract });

//     const firstPlayer = await lotteryContract.players(0);
//     await expect(firstPlayer).to.equal(owner.address);
//   });

//   it('should not be able to enter in lottery with less amount value', async () => {
//     const { lotteryContract } = await loadFixture(deployLotteryFixture);

//     const usdAmount = '49';

//     const {
//       result: { ethusd },
//     } = await getEthPriceAPI();
//     const entryAmount = getUsdEthPrice({ usd: usdAmount, ETH: ethusd });
//     await lotteryContract.startLottery();

//     await expect(
//       lotteryContract.enter({
//         value: ethers.utils.parseEther(entryAmount),
//       })
//     ).to.be.revertedWith('Not enough ETH');
//   });

//   describe('End lottery', () => {
//     it("should revert with 'Current contract has no enough LINK token' error message", async () => {
//       const { lotteryContract } = await loadFixture(deployLotteryFixture);
//       await enterLotteryAction({ usdAmount: '50.9', lotteryContract });
//       await expect(lotteryContract.endLottery()).to.revertedWith(
//         'Current contract has no enough LINK token'
//       );
//     });

//     it('should pick a winner', async () => {
//       const { lotteryContract, owner } = await loadFixture(
//         deployLotteryFixture
//       );
//       //START LOTTERY
//       await enterLotteryAction({ usdAmount: '50.9', lotteryContract });
//       await run('fund-link', {
//         contract: lotteryContract.address,
//         linkaddress: LINK_TOKEN_ADDRESS_MAINNET,
//         // fundamount:(2*10e18).toString()
//       });

//   // const LinkToken = await ethers.getContractFactory("LinkToken")
//   // const linkTokenContract = new ethers.Contract(LINK_TOKEN_ADDRESS_MAINNET, LinkToken.interface, owner)
//   // const contractBalanceBN = await linkTokenContract.balanceOf(lotteryContract.address)
//   // console.log("🚀 ~ file: Lottery.test.js ~ line 148 ~ it ~ contractBalanceBN", contractBalanceBN.toString())

//       // console.log('await lotteryContract.fee()',(await lotteryContract.fee()).toString())
//       // console.log('await lotteryContract.balance 2',(await ethers.provider.getBalance(lotteryContract.address)).toString())
//       //SEND LINK TO CURRENT CONTRACT
//       // await owner.sendTransaction({
//       //   to: await lotteryContract.address,
//       //   value: ethers.utils.parseEther('1'),
//       //   gasLimit: ethers.utils.hexlify(30000),
//       //   gasPrice: ethers.utils.hexlify(parseInt(await owner.getGasPrice())),
//       // });

//       // const linkContract = await ethers.getContractAt(
//       //   IERC20_SOURCE,
//       //   LINK_TOKEN_ADDRESS_MAINNET
//       // );
//       // await linkContract
//       //   .connect(owner.address)
//       //   .transferFrom(owner.address,lotteryContract.address, ethers.utils.parseEther('1')
//       //   , {
//       //     value: ethers.utils.parseEther('1'),
//       //   }
//       //   );
//       // // const resp = await linkContract.balanceOf(lotteryContract.address);
//       // console.log('🚀 ~ file: Lottery.test.js ~ line 146 ~ it ~ resp', resp);
//       // await lotteryContract.endLottery();
//       //CHECK THIS EVENT RequestRandomNess
//       await expect(lotteryContract.endLottery()).to.emit(
//         lotteryContract,
//         'RequestRandomNess'
//       );
//       //ALSO CHECK recentWinner balance greater than zero
//     });
//     //TODO: check mock hardhat-starter-kit contracts
//     //https://github.com/smartcontractkit/hardhat-starter-kit
//   });
// });
