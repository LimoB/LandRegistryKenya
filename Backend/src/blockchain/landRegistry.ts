import { ethers } from "ethers";
import { officerWallet } from "./provider";
import dotenv from "dotenv";
import LandRegistryArtifact from "./artifacts/LandRegistry.json";

dotenv.config();

const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS || "";

export const landRegistryContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  LandRegistryArtifact.abi, 
  officerWallet
);

/* ================================
   BLOCKCHAIN ACTIONS
================================ */

export const registerLandOnChain = async (
  ownerWallet: string,
  lrNumber: string,
  ipfsHash: string
) => {
  try {
    // This sends the transaction
    const tx = await landRegistryContract.registerInitialLand(ownerWallet, lrNumber, ipfsHash);
    // This waits for the block to be mined and returns the Receipt
    return await tx.wait(); 
  } catch (error) {
    console.error("Blockchain Registration Failed:", error);
    throw error;
  }
};

export const transferLandOnChain = async (
  landId: number,
  newOwnerWallet: string,
  mpesaRef: string
) => {
  try {
    const tx = await landRegistryContract.transferOwnership(landId, newOwnerWallet, mpesaRef);
    return await tx.wait();
  } catch (error) {
    console.error("Blockchain Transfer Failed:", error);
    throw error;
  }
};