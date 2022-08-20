const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { BigNumber } = require('ethers');
const { getEthPriceAPI, getUsdEthPrice } = require('./utils');

async function enterLotteryAction({ usdAmount, lotteryContract }) {
  const {
    result: { ethusd },
  } = await getEthPriceAPI();
  const entryAmount = getUsdEthPrice({ usd: usdAmount, ETH: ethusd });
  await lotteryContract.startLottery();
  await lotteryContract.enter({
    value: ethers.utils.parseEther(entryAmount),
  });
}

async function deployLotteryFixture() {
  const Lottery = await ethers.getContractFactory('Lottery');
  const [owner, addr1, addr2] = await ethers.getSigners();
  const linkWeiBigNumbered = BigNumber.from((0.1 * 1e18).toString());
  //TODO: deploy with mocked contracts
  const lotteryContract = await Lottery.deploy(
    '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419' /*mainnet*/,
    '0xf0d54349aDdcf704F77AE15b96510dEA15cb7952',
    '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    linkWeiBigNumbered,
    '0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445'
  );

  await lotteryContract.deployed();

  return { lotteryContract, owner, addr1, addr2 };
}

const lotteryStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  CALCULATING_WINNER: 'CALCULATING_WINNER',
};

describe('Lottery init', () => {
  it('should start lottery status as closed', async function () {
    const { lotteryContract } = await loadFixture(deployLotteryFixture);
    const lotteryStateEnum = await lotteryContract.lottery_state();
    const closedLotteryStatus = Object.values(lotteryStatus).indexOf(
      lotteryStatus.CLOSED
    );
    await expect(lotteryStateEnum).to.equal(closedLotteryStatus);
  });

  it('should have a default a usd entry fee', async () => {
    const { lotteryContract } = await loadFixture(deployLotteryFixture);
    const usdEntryInUSD = 50;
    const lotteryStateEnum = await lotteryContract.usdEntryFee();
    await expect(Number(lotteryStateEnum)).to.equal(usdEntryInUSD * 1e18);
  });
});

describe('Start lottery', () => {
  it('should start lottery', async () => {
    const { lotteryContract } = await loadFixture(deployLotteryFixture);
    await lotteryContract.startLottery();
    const lotteryStateEnum = await lotteryContract.lottery_state();
    const openLotteryStatus = Object.values(lotteryStatus).indexOf(
      lotteryStatus.OPEN
    );
    await expect(lotteryStateEnum).to.equal(openLotteryStatus);
  });

  it('should set a usd entry fee', async () => {
    const { lotteryContract } = await loadFixture(deployLotteryFixture);
    const usdEntryInUSD = 51;
    await lotteryContract.setMinUSD(usdEntryInUSD);
    const lotteryStateEnum = await lotteryContract.usdEntryFee();
    await expect(Number(lotteryStateEnum)).to.equal(usdEntryInUSD * 1e18);
  });
});

describe('Enter lottery', () => {
  it('should not be able to enter with/o starting lottery', async () => {
    const { lotteryContract } = await loadFixture(deployLotteryFixture);

    await expect(lotteryContract.enter()).to.be.revertedWith(
      'Lottery is not open'
    );
  });

  it('should be able to enter in lottery', async () => {
    const { lotteryContract, owner } = await loadFixture(deployLotteryFixture);

    const usdAmount = '50.9';
    // add at least 10-20 cents more for gas fees

    await enterLotteryAction({ usdAmount, lotteryContract });

    const firstPlayer = await lotteryContract.players(0);
    await expect(firstPlayer).to.equal(owner.address);
  });

  it('should not be able to enter in lottery with less amount value', async () => {
    const { lotteryContract } = await loadFixture(deployLotteryFixture);

    const usdAmount = '49';

    const {
      result: { ethusd },
    } = await getEthPriceAPI();
    const entryAmount = getUsdEthPrice({ usd: usdAmount, ETH: ethusd });
    await lotteryContract.startLottery();

    await expect(
      lotteryContract.enter({
        value: ethers.utils.parseEther(entryAmount),
      })
    ).to.be.revertedWith('Not enough ETH');
  });

  describe('End lottery', () => {
    it('Picking a winner', async () => {
      const { lotteryContract } = await loadFixture(deployLotteryFixture);
      //START LOTTERY
      await enterLotteryAction({ usdAmount: '50.9', lotteryContract });
      //END LOTTERY
      //CHECK THIS EVENT RequestRandomNess
      // await lotteryContract.endLottery();
      await expect(lotteryContract.endLottery()).to.emit(
        lotteryContract,
        'RequestRandomNess'
      );
      //ALSO CHECK recentWinner balance greater than zero
    });
  });
});
