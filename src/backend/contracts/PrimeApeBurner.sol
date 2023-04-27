// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./PrimeBabyDragon.sol";

contract PrimeApeBurner is Ownable, ReentrancyGuard {
    address public primeApeAddress;
    address public primeDragonAddress;
    address public primeKongAddress;
    address public infectedApeAddress;
    address public babyDragonAddress;
    uint256 public pointsToRedeem = 60;
    uint256 public primeApeOffset = 7979;
    uint256 public alphaBabyBonusWindowStartTimestamp;
    uint256 public alphaBabyBonusWindowDuration = 72 * 60 * 60; // 72 Hours
    
    bytes32 public primeDragonEpicMerkleRoot = 0x900493612a071ad64784e9adbe4a945fc145614b5ab937e0805113bcab054483;
    bytes32 public primeDragonNormalMerkleRoot = 0x125d8be70edd7fdde86cd5c566e42f612f3da056b37163721828d171d035ba28;
    bytes32 public primeDragonAlphaMerkleRoot = 0xbf78512182e763d945c70c90a7eda13ada2b9c42020954a5b2c57fbc963b7279;

    mapping (address => uint256) public pointsPerAddress;
    mapping (address => uint256) public additionalChanceForAlphaBabyPerAddress10;
    mapping (address => uint256) public additionalChanceForAlphaBabyPerAddress25;

    event BurnSuccessful(
        address user,
        address collectionAddress,
        uint256 tokenId,
        uint256 points
    );

    event RedeemSuccessful(
        address user,
        uint256 tokenId
    );

    constructor() { }
    
    function burnBatch(address[] memory _collectionAddress, uint256[] memory _tokenId, bytes32[][] memory _proof) public {
        uint256 _batchSize = _collectionAddress.length;
        require(_batchSize == _tokenId.length && _batchSize == _proof.length, "Arrays length must match");

        for(uint256 i = 0; i < _batchSize;) {
            burn(_collectionAddress[i], _tokenId[i], _proof[i]);
            unchecked { ++i; }
        }
    }

    function burn(address _collectionAddress, uint256 _tokenId, bytes32[] memory _proof) public nonReentrant {
        require(msg.sender == owner() || alphaBabyBonusWindowStartTimestamp > 0, "Burn not allowed yet");
        uint256 _points = getPointsForTokenCollection(_collectionAddress, _tokenId);
        require(_points > 0, "Invalid given NFT");
        require(IERC721Enumerable(_collectionAddress).ownerOf(_tokenId) == msg.sender, "You do not own this NFT");

        if (isDuringAlphaBabyBonusWindow()) {
            
            bool _isPrimeDragonEpic = isValid(_proof, primeDragonEpicMerkleRoot, keccak256(abi.encodePacked(Strings.toString(_tokenId))));
            bool _isPrimeDragonNormal = isValid(_proof, primeDragonNormalMerkleRoot, keccak256(abi.encodePacked(Strings.toString(_tokenId))));
            bool _isPrimeDragonAlpha = isValid(_proof, primeDragonAlphaMerkleRoot, keccak256(abi.encodePacked(Strings.toString(_tokenId))));

            require(_collectionAddress == primeDragonAddress && 
                (_isPrimeDragonEpic || _isPrimeDragonNormal || _isPrimeDragonAlpha), 
                "Can only burn alpha, baby or alpha prime dragons during alpha baby bonus window");

            if (_isPrimeDragonEpic) {
                additionalChanceForAlphaBabyPerAddress25[msg.sender] += 1;
                _points = 60;
            }
            else if (_isPrimeDragonNormal) {
                additionalChanceForAlphaBabyPerAddress10[msg.sender] += 1;
                _points = 60;
            }
            else if (_isPrimeDragonAlpha) {
                _points = 60;
            }
        }

        IERC721Enumerable(_collectionAddress).safeTransferFrom(msg.sender, 0x000000000000000000000000000000000000dEaD, _tokenId);
        pointsPerAddress[msg.sender] += _points;
        
        emit BurnSuccessful(msg.sender, _collectionAddress, _tokenId, _points);
    }

    function isValid(bytes32[] memory _proof, bytes32 _root, bytes32 _leaf) public pure returns (bool) {
        return MerkleProof.verify(_proof, _root, _leaf);
    }

    function redeemBatch(uint256 _amount) public {
        require(msg.sender == tx.origin, "Caller cannot be smart contract");
        
        uint256 _batchSize = pointsPerAddress[msg.sender] / 60;
        require(_amount <= _batchSize && _batchSize > 0, "Not enough points to redeem");

        for(uint256 i = 0; i < _batchSize && i < _amount;) {
            redeem();
            unchecked { ++i; }
        }
    }

    function redeem() public nonReentrant {
        require(pointsPerAddress[msg.sender] >= pointsToRedeem, "Not enough points accumulated");
        pointsPerAddress[msg.sender] -= pointsToRedeem;

        uint256 _additionalChanceForAlpha = popHighestAdditionalChanceForAlphaBaby(msg.sender);
        uint256 _tokenId = PrimeBabyDragon(babyDragonAddress).mintTo(msg.sender, _additionalChanceForAlpha);

        emit RedeemSuccessful(msg.sender, _tokenId);
    }

    function popHighestAdditionalChanceForAlphaBaby(address _user) private returns (uint256) {
        if (additionalChanceForAlphaBabyPerAddress25[_user] > 0) {
            additionalChanceForAlphaBabyPerAddress25[_user] -= 1;
            return 25;
        }
        if (additionalChanceForAlphaBabyPerAddress10[_user] > 0) {
            additionalChanceForAlphaBabyPerAddress10[_user] -= 1;
            return 10;
        }
        return 0;
    }

    function getPointsForTokenCollection(address _collectionAddress, uint256 _tokenId) public view returns (uint256) {
        if (_collectionAddress == primeApeAddress)
            return 12;
        if (_collectionAddress == primeDragonAddress)
            return 8;
        if (_collectionAddress == primeKongAddress)
            return 6;
        if (_collectionAddress == infectedApeAddress) {
            if (_tokenId >= primeApeOffset)
                return 10;
            return 5;
        }
        return 0;
    }

    function isDuringAlphaBabyBonusWindow() public view returns (bool) {
        return alphaBabyBonusWindowStartTimestamp != 0
            && block.timestamp < alphaBabyBonusWindowStartTimestamp + alphaBabyBonusWindowDuration;
    }

    function setContracts(
        address _primeApeAddress,
        address _primeDragonAddress,
        address _primeKongAddress,
        address _infectedApeAddress,
        address _babyDragonAddress
    ) public onlyOwner {
        primeApeAddress = _primeApeAddress;
        primeDragonAddress = _primeDragonAddress;
        primeKongAddress = _primeKongAddress;
        infectedApeAddress = _infectedApeAddress;
        babyDragonAddress = _babyDragonAddress;
    }

    function startAlphaBabyBonusWindow() public onlyOwner {
        alphaBabyBonusWindowStartTimestamp = block.timestamp;
    }

    function setAlphaBabyBonusWindowDuration(uint256 _alphaBabyBonusWindowDuration) public onlyOwner {
        alphaBabyBonusWindowDuration = _alphaBabyBonusWindowDuration;
    }

    function setMerkleRoots(bytes32 _primeDragonEpicMerkleRoot, bytes32 _primeDragonNormalMerkleRoot, bytes32 _primeDragonAlphaMerkleRoot) public onlyOwner {
        primeDragonEpicMerkleRoot = _primeDragonEpicMerkleRoot;
        primeDragonNormalMerkleRoot = _primeDragonNormalMerkleRoot;
        primeDragonAlphaMerkleRoot = _primeDragonAlphaMerkleRoot;
    }
}