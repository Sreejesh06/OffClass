import { ethers } from 'ethers';
import CryptidRegistryABI from './CryptidRegistry.json' with { type: 'json' };

// Initialize provider and wallet
const rpcUrl = process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';
const contractAddress = process.env.CRYPTID_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000';

const provider = new ethers.JsonRpcProvider(rpcUrl);
// Default to a random wallet if no private key is provided (for dev without keys)
const wallet = privateKey !== '0x0000000000000000000000000000000000000000000000000000000000000000' 
  ? new ethers.Wallet(privateKey, provider) 
  : ethers.Wallet.createRandom().connect(provider);

export const cryptidRegistry = new ethers.Contract(contractAddress, CryptidRegistryABI.abi, wallet);

export const blockchainEnabled = () => {
    return privateKey !== '0x0000000000000000000000000000000000000000000000000000000000000000' && 
           contractAddress !== '0x0000000000000000000000000000000000000000';
};

/**
 * Anchors a certificate hash to the blockchain
 * @param hash SHA-256 hash of the certificate
 * @param studentWallet Wallet address of the student
 * @returns Transaction hash or null if disabled
 */
export async function anchorCertificateHash(hash: string, studentWallet: string): Promise<string | null> {
    if (!blockchainEnabled()) return null;
    
    try {
        const tx = await (cryptidRegistry as any).anchorHash(hash, studentWallet);
        const receipt = await tx.wait();
        return receipt.hash;
    } catch (error) {
        console.error("Error anchoring hash to blockchain:", error);
        throw error;
    }
}

/**
 * Mints an achievement SBT to the student
 * @param to Student wallet address
 * @param achievementId ID of the achievement
 * @returns Transaction hash or null if disabled
 */
export async function mintAchievementSBT(to: string, achievementId: number): Promise<string | null> {
    if (!blockchainEnabled()) return null;
    
    try {
        const tx = await (cryptidRegistry as any).mintAchievement(to, achievementId, 1, "0x");
        const receipt = await tx.wait();
        return receipt.hash;
    } catch (error) {
        console.error("Error minting SBT:", error);
        throw error;
    }
}
