import db from "../drizzle/db";
import {
  lands,
  landOwnershipHistory,
  blockchainEvents,
  users,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";
import LandRegistry from "./artifacts/LandRegistry.json";
import { ethers } from "ethers";

/* ============================================================
   ENV SETUP - MATCHING YOUR .ENV
============================================================ */
const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS;
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545"; 
const PRIVATE_KEY = process.env.OFFICER_PRIVATE_KEY; 

if (!CONTRACT_ADDRESS) {
  console.error("[CRITICAL] LAND_REGISTRY_ADDRESS missing in .env");
  throw new Error("LAND_REGISTRY_ADDRESS missing in .env");
}

/* ============================================================
   PROVIDER, SIGNER + CONTRACT
============================================================ */
export const provider = new ethers.JsonRpcProvider(RPC_URL);

/**
 * HELPER: Returns a contract instance with a Signer (Wallet)
 */
export const getAuthorizedContract = () => {
  if (!PRIVATE_KEY) {
    throw new Error("[BC-SERVICE] OFFICER_PRIVATE_KEY is missing in .env.");
  }
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS!, LandRegistry.abi, wallet);
};

/**
 * STANDARD CONTRACT (READ-ONLY)
 */
export const contract = new ethers.Contract(CONTRACT_ADDRESS!, LandRegistry.abi, provider);

/* ============================================================
   DEBUG: INTERFACE INSPECTION
============================================================ */
const debugInterface = () => {
  console.log("--- Blockchain Interface Debug ---");
  console.log("Contract Address:", CONTRACT_ADDRESS);
  const abiFunctions = LandRegistry.abi
    .filter((item: any) => item.type === "function")
    .map((item: any) => item.name);
  console.log("Functions in JSON ABI:", abiFunctions);
  console.log("----------------------------------");
};
debugInterface();

/* ============================================================
   WALLET CACHE
============================================================ */
const walletCache = new Map<string, number>();

export const resolveUserIdByWallet = async (wallet: string): Promise<number | null> => {
  if (!wallet) return null;
  const cleanWallet = wallet.toLowerCase();
  if (walletCache.has(cleanWallet)) return walletCache.get(cleanWallet)!;

  const user = await db.query.users.findFirst({
    where: eq(users.walletAddress, cleanWallet),
  });

  if (user?.id) {
    walletCache.set(cleanWallet, user.id);
    return user.id;
  }
  return null;
};

/* ============================================================
   1. REGISTER LAND ON CHAIN (FIXED FOR ENS ERROR)
============================================================ */
export const registerLandOnChainService = async (
  ownerWallet: string,
  lrNumber: string,
  ipfsHash: string
) => {
  console.log(`[BC-SERVICE] Preparing Mint for LR: ${lrNumber}`);

  try {
    // ENS FIX: Validate the Ethereum Address before calling the contract
    if (!ownerWallet || !ethers.isAddress(ownerWallet)) {
      throw new Error(`INVALID_ADDRESS: The wallet address "${ownerWallet}" is invalid or undefined. This causes the ENS error.`);
    }

    if (!lrNumber || !ipfsHash) {
      throw new Error("INVALID_DATA: LR Number or IPFS Hash is missing.");
    }

    const authContract = getAuthorizedContract();
    
    // Explicitly call the function with validated data
    const tx = await authContract.registerInitialLand(ownerWallet, lrNumber, ipfsHash);
    console.log(`[BC-SERVICE] Transaction Sent! Hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`[BC-SERVICE] Mined in block: ${receipt.blockNumber}`);

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error: any) {
    console.error("[BC-SERVICE ERROR] Failed to register land on-chain:");
    
    // Catch the specific ENS lookup failure and provide a better message
    if (error.message.includes("getEnsAddress") || error.message.includes("ENS")) {
        throw new Error("Blockchain Error: Invalid Wallet Address provided (Network tried to resolve ENS on local chain). Check land owner's wallet.");
    }
    
    throw error;
  }
};

/* ============================================================
   2. TRANSFER LAND ON CHAIN
============================================================ */
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

/* ============================================================
   EVENT SYNC HANDLERS
============================================================ */

export const handleLandRegisteredEvent = async (
  landId: bigint,
  lrNumber: string,
  ownerWallet: string,
  ipfsHash: string,
  txHash: string
) => {
  console.log(`[EVENT] Syncing LandRegistered: ${lrNumber}`);
  
  const existing = await db.query.blockchainEvents.findFirst({
    where: eq(blockchainEvents.txHash, txHash),
  });
  if (existing?.processed) return;

  const ownerId = await resolveUserIdByWallet(ownerWallet);

  await db.transaction(async (trx) => {
    await trx.insert(blockchainEvents).values({
      eventName: "LandRegistered",
      txHash,
      payload: { landId: Number(landId), lrNumber, ownerWallet, ipfsHash },
      processed: true
    });

    await trx
      .update(lands)
      .set({
        onChainId: Number(landId),
        verificationStatus: "verified",
        blockchainTxHash: txHash,
        ownerId: ownerId ?? undefined,
      })
      .where(eq(lands.lrNumber, lrNumber));
  });
};

export const handleOwnershipTransferredEvent = async (
  landId: bigint,
  from: string,
  to: string,
  mpesaRef: string,
  txHash: string
) => {
  console.log(`[EVENT] Syncing Transfer for Land ID: ${landId}`);

  const fromOwnerId = await resolveUserIdByWallet(from);
  const toOwnerId = await resolveUserIdByWallet(to);

  await db.transaction(async (trx) => {
    await trx.insert(blockchainEvents).values({
      eventName: "OwnershipTransferred",
      txHash,
      payload: { landId: Number(landId), from, to, mpesaRef },
      processed: true
    });

    await trx.update(lands)
      .set({ ownerId: toOwnerId ?? undefined })
      .where(eq(lands.onChainId, Number(landId)));

    await trx.insert(landOwnershipHistory).values({
      landId: Number(landId),
      fromWallet: from,
      toWallet: to,
      fromOwnerId: fromOwnerId ?? undefined,
      toOwnerId: toOwnerId ?? undefined,
      mpesaRef: mpesaRef,          
      blockchainTxHash: txHash,     
    });
  });
};

/* ============================================================
   START LISTENERS
============================================================ */
export const startBlockchainService = () => {
  console.log("[BC-SYSTEM] Blockchain event listeners active...");

  contract.on("LandRegistered", async (landId, lrNumber, owner, ipfsHash, event) => {
    try {
      await handleLandRegisteredEvent(landId, lrNumber, owner, ipfsHash, event.log.transactionHash);
    } catch (err) {
      console.error("[LISTENER ERROR] LandRegistered Sync failed:", err);
    }
  });

  contract.on("OwnershipTransferred", async (landId, from, to, mpesaRef, event) => {
    try {
      await handleOwnershipTransferredEvent(landId, from, to, mpesaRef, event.log.transactionHash);
    } catch (err) {
      console.error("[LISTENER ERROR] OwnershipTransferred Sync failed:", err);
    }
  });
};