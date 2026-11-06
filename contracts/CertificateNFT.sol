// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CertificateNFT is ERC721 {
    address public immutable registry;

    modifier onlyRegistry() {
        require(msg.sender == registry, "Only registry");
        _;
    }

    constructor(address registryAddress) ERC721("Diploma", "DIPL") {
        registry = registryAddress;
    }

    function mint(address to, uint256 tokenId) external onlyRegistry {
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) external onlyRegistry {
        _burn(tokenId);
    }

    // Soulbound: only minting (from = 0) and burning (to = 0) are allowed
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Soulbound: non-transferable");
        return super._update(to, tokenId, auth);
    }
}