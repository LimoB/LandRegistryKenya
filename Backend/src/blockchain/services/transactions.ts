import { ethers } from "ethers";
import { getAuthorizedContract } from "./utils";

export const registerLandOnChainService = async (
  ownerWallet: string,
  lrNumber: string,
  ipfsHash: string
) => {
  console.log(`[BC-SERVICE] Preparing Mint for LR: ${lrNumber}`);

  try {
    if (!ownerWallet || !ethers.isAddress(ownerWallet)) {
      throw new Error(`INVALID_ADDRESS: The wallet address "${ownerWallet}" is invalid.`);
    }

    if (!lrNumber || !ipfsHash) {
      throw new Error("INVALID_DATA: LR Number or IPFS Hash is missing.");
    }

    const authContract = getAuthorizedContract();
    const tx = await authContract.registerLand(ownerWallet, lrNumber, ipfsHash);
    
    console.log(`[BC-SERVICE] Transaction Sent! Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    
    return { hash: receipt.hash, blockNumber: receipt.blockNumber };
  } catch (error: any) {
    console.error("[BC-SERVICE ERROR] Failed to register land on-chain:");
    
    if (error.message.includes("Access denied")) {
        throw new Error("Blockchain Error: The Officer Private Key used is not authorized.");
    }
    if (error.message.includes("Land already exists")) {
        throw new Error(`Blockchain Error: LR Number ${lrNumber} is already registered.`);
    }
    throw error;
  }
};

export const transferLandOnChainService = async (
  landOnChainId: number,
  toWallet: string,
  reference: string
) => {
  try {
    if (!ethers.isAddress(toWallet)) {
        throw new Error(`Invalid recipient address: ${toWallet}`);
    }

    const authContract = getAuthorizedContract();
    const tx = await authContract.transferOwnership(landOnChainId, toWallet, reference);
    const receipt = await tx.wait();
    return { hash: receipt.hash, blockNumber: receipt.blockNumber };
  } catch (error: any) {
    console.error("[BC-SERVICE ERROR] Transfer Failed:", error.message);
    throw error;
  }
};