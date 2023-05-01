// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PoolMaster is Ownable {
    uint256 public bettingPhaseDuration = 8 * 60 * 60; // 8 Hours
    uint256 public battlingPhaseDuration = 24 * 60 * 60; // 24 Hours

    uint256 public loserTokensPercent = 1250; // 12.50 %
    uint256 public winnerTokensPercent = 1000; // 10.00 %
    uint256 public burnedTokensPercent = 50; // 0.50%
    uint256 public pool3TokensPercent = 200; // 2.00%

    Pool[] private pools;
    mapping(address => Staker) private stakers;

    struct Pool {
        address token;
        uint256 timestampStartEpoch;
    }

    struct Staker {
        uint256 poolId;
        uint256 amount;
    }


    event MintSuccessful(address user, uint256 tokenId, bool isAlpha);

    constructor() {
        pools.push(Pool(address(0), 0));
        pools.push(Pool(address(0), 0));
    }

    function stake() public payable {
        require(msg.value > 0, "Must stake more than 0 tokens");
        stakers[msg.sender]
    }

    function startEpoch(address _token1, address _token2) public onlyOwner {
        pools[0].token = _token1;
        pools[0].timestampStartEpoch = block.timestamp;
        
        pools[1].token = _token2;
        pools[1].timestampStartEpoch = block.timestamp;
    }

    function endEpoch(uint256 _poolWinnerId) public onlyOwner {
        // Der Pool, dessen token den anderen in absoluten % outperformt hat, gewinnt
        // Verlierer kriegen 12.5% ihrer gestakten Tokens abgezogen
        // 10% davon wird an die Gewinner aufgeteilt
        // 0.5% geburned
        // die restlichen 2% geht an Pool3 staker
    }

    // GETTERS

    function getTimestampStartEpoch(uint256 _poolId) public view returns (uint256) {
        return pools[_poolId].timestampStartEpoch;
    }

    function getToken(uint256 _poolId) public view returns (address) {
        return pools[_poolId].token;
    }

    // SETTERS

    function setBettingPhaseDuration(uint256 _bettingPhaseDuration) public onlyOwner {
        bettingPhaseDuration = _bettingPhaseDuration;
    }

    function setBattlingPhaseDuration(uint256 _battlingPhaseDuration) public onlyOwner {
        battlingPhaseDuration = _battlingPhaseDuration;
    }

    function setLoserTokensPercent(uint256 _loserTokensPercent) public onlyOwner {
        loserTokensPercent = _loserTokensPercent;
    }

    function setWinnerTokensPercent(uint256 _winnerTokensPercent) public onlyOwner {
        winnerTokensPercent = _winnerTokensPercent;
    }

    function setBurnedTokensPercent(uint256 _burnedTokensPercent) public onlyOwner {
        burnedTokensPercent = _burnedTokensPercent;
    }

    function setPool3TokensPercent(uint256 _pool3TokensPercent) public onlyOwner {
        pool3TokensPercent = _pool3TokensPercent;
    }
}
