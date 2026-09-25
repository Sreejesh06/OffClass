import { ethers } from "ethers";
import crypto from "crypto";

const ABI = [
    "function anchorHash(bytes32 achievementId, bytes32 dataHash) external",
    "event AchievementAnchored(bytes32 indexed achievementId, bytes32 dataHash, uint256 timestamp)"
];

let contract: ethers.Contract | null = null;

if (process.env.POLYGON_RPC_URL && process.env.ANCHOR_WALLET_PRIVATE_KEY && process.env.ANCHOR_CONTRACT_ADDRESS) {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ANCHOR_WALLET_PRIVATE_KEY, provider);
    contract = new ethers.Contract(process.env.ANCHOR_CONTRACT_ADDRESS, ABI, wallet);
}

/**
 * Deterministically hash the core, immutable fields of an achievement.
 */
export function computeAchievementHash(achievement: any): string {
    // IMPORTANT: Only include fields that will never change. 
    // Status, dates, and txHashes must be excluded.
    const payload = `${achievement.id}:${achievement.userId}:${achievement.title}:${achievement.category}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Anchors the computed hash on the Polygon testnet.
 */
export async function anchorAchievementOnChain(id: string, hashHex: string): Promise<string | null> {
    if (!contract) {
        console.warn("Blockchain anchoring skipped: Missing environment variables.");
        return null;
    }
    
    // Convert UUID to bytes32 (strip hyphens and right-pad to 64 hex chars = 32 bytes)
    const idBytes = '0x' + id.replace(/-/g, '').padEnd(64, '0');
    const hashBytes = '0x' + hashHex;
    
    try {
        const tx = await contract.anchorHash(idBytes, hashBytes);
        return tx.hash;
    } catch (e) {
        console.error("Blockchain anchor failed", e);
        return null;
    }
}
