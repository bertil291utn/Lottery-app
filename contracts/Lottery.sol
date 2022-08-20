// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

//TODO: test with hardhat js
contract Lottery is VRFConsumerBase, Ownable { 
    address payable[] public players;
    uint256 public usdEntryFee;
    uint256 public fee;
    bytes32 public keyHash;
    address payable public recentWinner;
    uint256 public randomResult;

    AggregatorV3Interface internal ethUsdPriceFeed;
    enum LOTTERY_STATE {
        OPEN,
        CLOSED,
        CALCULATING_WINNER 
    }

    LOTTERY_STATE public lottery_state;
    // contract address ETH/USD price feed on rinkeby testnet
    //0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
    //curent lottery contract address 0x499e9b451044542a16446469aB6Ed5FCd7D86433
    //https://docs.chain.link/docs/ethereum-addresses/
    // get random number https://docs.chain.link/docs/get-a-random-number/v1/
    //vrf coordinator addresses https://docs.chain.link/docs/vrf-contracts/#config

    //events
    event RequestRandomNess(bytes32 requestId); 

    constructor(
        address _priceFeedContractAddress,
        address _vrfCoordinator,
        address _link,
        uint256 _fee,
        bytes32 _keyHash
    ) VRFConsumerBase(_vrfCoordinator, _link) {
        usdEntryFee = 50 * 1e18; //minimum USD fee
        ethUsdPriceFeed = AggregatorV3Interface(_priceFeedContractAddress);
        lottery_state = LOTTERY_STATE.CLOSED;
        fee = _fee;
        keyHash = _keyHash;
    }

    function enter() public payable {
        //(USD 50 default) usdEntryFee minimum
        require(lottery_state == LOTTERY_STATE.OPEN, "Lottery is not open");
        require(msg.value >= getEntranceFee(), "Not enough ETH");
        players.push(payable(msg.sender));
    }

    function getEntranceFee() public view returns (uint256) { 
        //convert usd to eth
        uint256 costToEnter = (usdEntryFee * 1e18) / (getPrice() * 1e10); 
        return costToEnter;
    }

    function startLottery() public onlyOwner {
        require(
            lottery_state == LOTTERY_STATE.CLOSED,
            "Can't start a new lottery yet!"
        );
        lottery_state = LOTTERY_STATE.OPEN;
    }

    function endLottery() public onlyOwner {
        lottery_state = LOTTERY_STATE.CALCULATING_WINNER;
        require(LINK.balanceOf(address(this)) >= fee, "Current contract has no enough LINK token");
        bytes32 requestId = requestRandomness(keyHash, fee);
        emit RequestRandomNess(requestId);
    }

    function setMinUSD(uint256 _minUSDValue) public onlyOwner {
        usdEntryFee = _minUSDValue * 1e18;
    }

    //private
    function getPrice() public view returns (uint256) {
        (, int256 answer, , , ) = ethUsdPriceFeed.latestRoundData();
        return uint256(answer);
    }

    function fulfillRandomness(bytes32 _requestId, uint256 _randomness)
        internal
        override
    {
        require(
            lottery_state == LOTTERY_STATE.CALCULATING_WINNER,
            "Still picking a winner"
        );
        require(_randomness > 0, "random-not-found");
        uint256 indexOfWinner = _randomness % players.length;
        recentWinner = players[indexOfWinner];
        recentWinner.transfer(address(this).balance);

        //reset
        players = new address payable[](0);
        lottery_state = LOTTERY_STATE.CLOSED;
        randomResult = _randomness;
    }
}
//ref: https://dapp-world.com/smartbook/chainlink-smart-contract-convertion-usd-to-eth-Om94
