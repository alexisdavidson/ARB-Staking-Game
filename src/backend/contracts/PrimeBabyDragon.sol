// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {DefaultOperatorFilterer} from "./ofr/DefaultOperatorFilterer.sol";

contract PrimeBabyDragon is Ownable, ERC721Enumerable, DefaultOperatorFilterer {
    address public primeApeBurnerAddress;
    uint256 public maxSupply = 1111;
    uint256 public phase1Supply = 555;
    uint256 public currentPhase = 1;
    uint256 public alphaSupply = 11;
    bool public revealed;
    bool public mintingEnabled;
    string public baseURIString = "ipfs://bafybeiaqx4sycsu3fqhcosys4bbwgzlammcoaeogb3z3w2ie4fgjqopx7a/Egg.json";
    string public alphaUri = "ipfs://bafybeifpy3qdtsqsq4ij22nbyhnlbze43a7wvf3flrskaubuxxv7nyo6pa/EggAlpha.json";

    uint256[] public alphaIds;

    event MintSuccessful(address user, uint256 tokenId, bool isAlpha);

    modifier onlyBurner {
        require(msg.sender != address(0), "Zero address");
        require(msg.sender == primeApeBurnerAddress || msg.sender == owner(), "Sender not burner");
        _;
    }

    constructor() ERC721("Prime Baby Dragon", "PBD") { }

    function airdrop(address _user) external onlyOwner {
        uint256 _tokenId = totalSupply();
        _mint(_user, _tokenId);
    }

    function mintTo(address _user, uint256 _additionalChanceForAlpha) external onlyBurner returns (uint256) {
        require(mintingEnabled, 'Minting is not enabled');
        require(totalSupply() < phase1Supply || currentPhase > 1, 'Cannot mint more than phase 1 supply');
        require(totalSupply() < maxSupply, 'Cannot mint more than max supply');

        uint256 _tokenId = totalSupply();
        _mint(_user, _tokenId);

        bool _isAlpha = false;
        if (_additionalChanceForAlpha > 0) {
            if (alphaIds.length < alphaSupply) {
                _isAlpha = randomNumber() % 100 < _additionalChanceForAlpha;
                if (_isAlpha) {
                    alphaIds.push(_tokenId);
                }
            }
        }

        emit MintSuccessful(msg.sender, _tokenId, _isAlpha);

        return _tokenId;
    }

    function randomNumber() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(msg.sender, blockhash(block.number - 1), block.difficulty)));
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), 'ERC721Metadata: URI query for nonexistent token');

        string memory currentBaseURI = _baseURI();
        if (!revealed) {
            if (isAlpha(_tokenId))
                return alphaUri;
            return currentBaseURI;
        }

        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, Strings.toString(_tokenId), '.json'))
            : '';
    }

    function isAlpha(uint256 _tokenId) public view returns (bool) {
        uint256 _alphaIdsLength = alphaIds.length;
        for(uint256 i = 0; i < _alphaIdsLength;) {
            if (_tokenId == alphaIds[i])
                return true;
            unchecked { ++i; }
        }
        return false;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURIString;
    }

    function contractURI() public pure returns (string memory) {
        return "ipfs://bafybeibnymqvzcs62pvkky4rfdfxfr645rxyx67t4tqztofagf7ueddg24/contractMetadata.json";
    }

    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721, IERC721) onlyAllowedOperator(from) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override(ERC721, IERC721) onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data)
        public
        override(ERC721, IERC721)
        onlyAllowedOperator(from)
    {
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURIString = _newBaseURI;
    }

    function setAlphaURI(string memory _alphaUri) external onlyOwner {
        alphaUri = _alphaUri;
    }

    function setBurnerContract(address _primeApeBurnerAddress) external onlyOwner {
        primeApeBurnerAddress = _primeApeBurnerAddress;
    }

    function setPhase(uint256 _phase) external onlyOwner {
        currentPhase = _phase;
    }

    function setMintingEnabled(bool _mintingEnabled) external onlyOwner {
        mintingEnabled = _mintingEnabled;
    }

    function setRevealed(bool _revealed) public onlyOwner {
        revealed = _revealed;
    }
    
    function getAlphaIds() public view returns (uint256[] memory) {
        return alphaIds;
    }
}
