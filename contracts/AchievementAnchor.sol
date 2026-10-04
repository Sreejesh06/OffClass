// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AchievementAnchor
 * @dev Immutable notary for Cryptid college platform achievements. 
 * Allows a trusted system wallet to anchor cryptographic hashes of achievements on-chain.
 */
contract AchievementAnchor {
    address public owner;
    
    // Maps a UUID (as bytes32) to its data hash (bytes32)
    mapping(bytes32 => bytes32) public achievementHashes;
    
    event AchievementAnchored(bytes32 indexed achievementId, bytes32 dataHash, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only system wallet can anchor");
        _;
    }

    /**
     * @dev Anchors a deterministic hash of an achievement payload.
     * @param achievementId The UUID of the achievement, stripped of hyphens.
     * @param dataHash The SHA-256 hash of the achievement's core immutable fields.
     */
    function anchorHash(bytes32 achievementId, bytes32 dataHash) external onlyOwner {
        require(achievementHashes[achievementId] == bytes32(0), "Achievement already anchored");
        achievementHashes[achievementId] = dataHash;
        emit AchievementAnchored(achievementId, dataHash, block.timestamp);
    }
}
