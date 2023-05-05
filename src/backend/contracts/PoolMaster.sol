// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PoolMaster is Ownable {
    ERC20 public usdc;
    
    uint256 public bettingPhaseDuration = 8 * 60 * 60; // 8 Hours
    uint256 public battlingPhaseDuration = 24 * 60 * 60; // 24 Hours

    uint256 public loserTokensPercent = 1250; // 12.50 %
    uint256 public winnerTokensPercent = 1000; // 10.00 %
    uint256 public burnedTokensPercent = 50; // 0.50%
    uint256 public pool3TokensPercent = 200; // 2.00%
    
    uint256 public unstakeFee = 200; // 2.00%
    uint256 public usdcStakeFee = 100; // 1.00%

    Pool[] private pools;
    mapping(address => Staker) private stakers;

    struct Pool {
        address token;
        uint256 timestampStartEpoch;
        Staker[] stakers;
        address lastWinner;
        uint256 nativeCount;
        uint256 usdcCount;
    }

    struct Staker {
        uint256 poolId;
        uint256 amount;
        bool isUsdc;
        address stakerAddress;
    }


    event MintSuccessful(address user, uint256 tokenId, bool isAlpha);

    constructor() {
        pools.push(Pool(address(0), 0, new Staker[](0), address(0), 0, 0));
        pools.push(Pool(address(0), 0, new Staker[](0), address(0), 0, 0));
        pools.push(Pool(address(0), 0, new Staker[](0), address(0), 0, 0));
    }

    function stake(uint256 _poolId, uint256 _usdcAmount) public payable {
        require(stakers[msg.sender].stakerAddress == address(0), "User already staked for this epoch");

        uint256 _stakeAmount = msg.value;
        if (_usdcAmount > 0) {
            _stakeAmount = (_usdcAmount * (10_000 - usdcStakeFee)) / 10_000;
        }
        require(_stakeAmount > 0, "Must stake more than 0 tokens");

        Staker memory _staker = Staker(_poolId, _stakeAmount, _usdcAmount > 0, msg.sender);
        
        stakers[msg.sender] = _staker;
        pools[_poolId].stakers.push(_staker);
        pools[_poolId].nativeCount += _usdcAmount > 0 ? 0 : 1;
        pools[_poolId].usdcCount += _usdcAmount > 0 ? 1 : 0;
    }

    function startEpoch(address _token1, address _token2) public onlyOwner {
        uint256 _pool0Length = pools[0].stakers.length;
        uint256 _pool1Length = pools[1].stakers.length;
        uint256 _pool2Length = pools[2].stakers.length;
        require(_pool0Length == 0 || _pool1Length == 0 || _pool2Length == 0, "Epoch has not ended");

        pools[0].token = _token1;
        pools[1].token = _token2;

        pools[0].timestampStartEpoch = block.timestamp;
        pools[1].timestampStartEpoch = block.timestamp;
        pools[2].timestampStartEpoch = block.timestamp;

        pools[0].nativeCount = 0;
        pools[1].nativeCount = 0;
        pools[2].nativeCount = 0;

        pools[0].usdcCount = 0;
        pools[1].usdcCount = 0;
        pools[2].usdcCount = 0;
    }

    // Der Pool, dessen token den anderen in absoluten % outperformt hat, gewinnt
    function endEpoch(uint256 _poolWinnerId) public onlyOwner {
        uint256 _poolLoserId = 1 - _poolWinnerId;
        uint256 _poolLoserLength = pools[_poolLoserId].stakers.length;
        uint256 _poolWinnerLength = pools[_poolWinnerId].stakers.length;

        require(_poolLoserLength > 0 || _poolWinnerLength > 0, "No staker in any of the first 2 pools");

        pools[_poolLoserId].lastWinner = address(0);
        pools[_poolWinnerId].lastWinner = pools[_poolWinnerId].token;

        uint256 _nativeLostAmount = 0;
        uint256 _usdcLostAmount = 0;
        // Verlierer kriegen 12.5% ihrer gestakten Tokens abgezogen
        for(uint256 i = 0; i < _poolLoserLength;) {
            uint256 _userLoseAmount = (pools[_poolLoserId].stakers[i].amount * loserTokensPercent) / 10_000;
            uint256 _userKeepAmount = pools[_poolLoserId].stakers[i].amount - _userLoseAmount;

            if (pools[_poolLoserId].stakers[i].isUsdc) {
                usdc.transfer(pools[_poolLoserId].stakers[i].stakerAddress, _userKeepAmount);
                _usdcLostAmount += _userLoseAmount;
            } else {
                payable(pools[_poolLoserId].stakers[i].stakerAddress).transfer(_userKeepAmount);
                _nativeLostAmount += _userLoseAmount;
            }

            stakers[pools[_poolLoserId].stakers[i].stakerAddress] = Staker(0, 0, false, address(0));
            unchecked { ++ i; }
        }

        // 10% davon wird an die Gewinner aufgeteilt
        uint256 _nativeWinningTokenPool = (_nativeLostAmount * winnerTokensPercent) / 10_000;
        uint256 _usdcWinningTokenPool = (_usdcLostAmount * winnerTokensPercent) / 10_000;
        uint256 _nativeUserWinAmount = 0;
        uint256 _usdcUserWinAmount = 0;
        if (pools[_poolWinnerId].nativeCount > 0) {
            _nativeUserWinAmount = _nativeWinningTokenPool / pools[_poolWinnerId].nativeCount;
        }
        if (pools[_poolWinnerId].usdcCount > 0) {
            _usdcUserWinAmount = _usdcWinningTokenPool / pools[_poolWinnerId].usdcCount;
        }

        for(uint256 i = 0; i < _poolWinnerLength;) {
            if (pools[_poolWinnerId].stakers[i].isUsdc) {
                usdc.transfer(pools[_poolWinnerId].stakers[i].stakerAddress, pools[_poolWinnerId].stakers[i].amount + _usdcUserWinAmount);
            } else {
                payable(pools[_poolWinnerId].stakers[i].stakerAddress).transfer(pools[_poolWinnerId].stakers[i].amount + _nativeUserWinAmount);
            }

            stakers[pools[_poolWinnerId].stakers[i].stakerAddress] = Staker(0, 0, false, address(0));
            unchecked { ++ i; }
        }

        // 0.5% geburned
        uint256 _nativeBurnAmount = (_nativeLostAmount * burnedTokensPercent) / 10_000;
        uint256 _usdcBurnAmount = (_usdcLostAmount * burnedTokensPercent) / 10_000;
        usdc.transfer(address(0), _usdcBurnAmount);
        payable(address(0)).transfer(_nativeBurnAmount);

        // die restlichen 2% geht an Pool3 staker
        uint256 _pool3Length = pools[2].stakers.length;
        uint256 _nativePool3Amount = (_nativeLostAmount * pool3TokensPercent) / 10_000;
        uint256 _usdcPool3Amount = (_usdcLostAmount * pool3TokensPercent) / 10_000;
        uint256 _nativeUserPool3Amount = 0;
        uint256 _usdcUserPool3Amount = 0;
        if (pools[2].nativeCount > 0) {
            _nativeUserPool3Amount = _nativePool3Amount / pools[2].nativeCount;
        }
        if (pools[2].usdcCount > 0) {
            _usdcUserPool3Amount = _usdcPool3Amount / pools[2].usdcCount;
        }

        for(uint256 i = 0; i < _pool3Length;) {
            if (pools[2].stakers[i].isUsdc) {
                usdc.transfer(pools[2].stakers[i].stakerAddress, pools[2].stakers[i].amount + _usdcUserPool3Amount);
            } else {
                payable(pools[2].stakers[i].stakerAddress).transfer(pools[2].stakers[i].amount + _nativeUserPool3Amount);
            }

            stakers[pools[2].stakers[i].stakerAddress] = Staker(0, 0, false, address(0));
            unchecked { ++ i; }
        }

        delete pools[0].stakers;
        delete pools[1].stakers;
        delete pools[2].stakers;
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

    function setUsdcAddress(address _usdcAddress) public onlyOwner {
        usdc = ERC20(_usdcAddress);
    }

    function setUnstakeFee(uint256 _unstakeFee) public onlyOwner {
        unstakeFee = _unstakeFee;
    }

    function setUsdcStakeFee(uint256 _usdcStakeFee) public onlyOwner {
        usdcStakeFee = _usdcStakeFee;
    }
    
    function withdrawEth() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
    
    function withdrawUsdc() external onlyOwner {
        usdc.transfer(msg.sender, usdc.balanceOf(address(this)));
    }
}
