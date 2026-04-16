import { ethers } from "ethers";
import { officerWallet } from "./provider";
import dotenv from "dotenv";
import LandRegistryArtifact from "./artifacts/LandRegistry.json";

dotenv.config();

/* ================================
   ENV SAFETY CHECK
================================ */
const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS;

if (!CONTRACT_ADDRESS) {
  throw new Error("❌ LAND_REGISTRY_ADDRESS is missing in .env");
}

/* ================================
   CONTRACT INSTANCE
================================ */
export const landRegistryContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  LandRegistryArtifact.abi,
  officerWallet
);

/* ================================
   BLOCKCHAIN ACTIONS
================================ */

/**
 * REGISTER LAND ON CHAIN
 * Called AFTER backend verification + IPFS upload
 */
export const registerLandOnChain = async (
  ownerWallet: string,
  lrNumber: string,
  ipfsHash: string
) => {
  try {
    console.log("📦 Registering land on blockchain...");
    console.log({ ownerWallet, lrNumber, ipfsHash });

    const tx = await landRegistryContract.registerInitialLand(
      ownerWallet,
      lrNumber,
      ipfsHash
    );

    const receipt = await tx.wait();

    console.log("✅ Land registered on-chain:", receipt.hash);

    return receipt;
  } catch (error: any) {
    console.error("❌ Blockchain Registration Failed:", error?.message || error);
    throw new Error("Blockchain registration failed");
  }
};

/**
 * TRANSFER LAND OWNERSHIP ON CHAIN
 * Called AFTER M-Pesa + DB approval
 */
export const transferLandOnChain = async (
  landId: number,
  newOwnerWallet: string,
  mpesaRef: string
) => {
  try {
    console.log("🔄 Transferring land on blockchain...");
    console.log({ landId, newOwnerWallet, mpesaRef });

    const tx = await landRegistryContract.transferOwnership(
      landId,
      newOwnerWallet,
      mpesaRef
    );

    const receipt = await tx.wait();

    console.log(" Ownership transferred on-chain:", receipt.hash);

    return receipt;
  } catch (error: any) {
    console.error("❌ Blockchain Transfer Failed:", error?.message || error);
    throw new Error("Blockchain transfer failed");
  }
};