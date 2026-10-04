// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CryptidRegistry is ERC1155, Ownable {
    mapping(string => bool) public anchoredHashes;
    mapping(string => address) public hashToStudent;
    
    event HashAnchored(string indexed certificateHash, address indexed student);

    constructor(string memory uri_) ERC1155(uri_) Ownable(msg.sender) {}

    function mintAchievement(address to, uint256 achievementId, uint256 amount, bytes memory data) external onlyOwner {
        _mint(to, achievementId, amount, data);
    }
    
    function anchorHash(string memory certificateHash, address student) external onlyOwner {
        require(!anchoredHashes[certificateHash], "Hash already anchored");
        anchoredHashes[certificateHash] = true;
        hashToStudent[certificateHash] = student;
        emit HashAnchored(certificateHash, student);
    }
    
    function verifyHash(string memory certificateHash) external view returns (bool, address) {
        return (anchoredHashes[certificateHash], hashToStudent[certificateHash]);
    }

    /* SBT Overrides for ERC1155 to prevent transfers */
    
    // In OpenZeppelin 5.0+, the update function handles all transfers
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        // Allow minting (from == 0) and burning (to == 0) but not transferring between users
        require(from == address(0) || to == address(0), "CryptidRegistry: Tokens are Soulbound and cannot be transferred");
        super._update(from, to, ids, values);
    }
}
