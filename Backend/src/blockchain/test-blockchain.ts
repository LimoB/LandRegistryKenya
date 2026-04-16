import { registerLandOnChain, transferLandOnChain } from "./blockchain.adapter";
import { officerWallet, provider } from "./provider";
import { ethers } from "ethers";

async function testRegistry() {
  try {
    console.log("Starting Blockchain Test...");
    
    const network = await provider.getNetwork();
    console.log(`Connected to Network: ${network.name} (ID: ${network.chainId})`);
    
    const balance = await provider.getBalance(officerWallet.address);
    console.log(`Officer: ${officerWallet.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

    const citizenWallet = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; 
    const lrNumber = `LAI/NYAHU/2026/${Math.floor(Math.random() * 1000)}`; 
    const ipfsHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";

    // 1. Test Registration
    console.log("\n1. Testing Land Registration...");
    const regReceipt = await registerLandOnChain(citizenWallet, lrNumber, ipfsHash);
    
    // Receipt already contains the hash because we awaited .wait() inside landRegistry.ts
    console.log(`Land Registered Successfully!`);
    console.log(`Transaction Hash: ${regReceipt.hash}`);
    
    // 2. Test Transfer
    console.log("\n2. Testing Ownership Transfer...");
    const newBuyerWallet = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; 
    const mpesaRef = "RGC" + Math.random().toString(36).substring(7).toUpperCase();

    // Assuming landId 1 exists from your previous successful (but crashed) runs
    const landId = 1; 
    const transReceipt = await transferLandOnChain(landId, newBuyerWallet, mpesaRef);
    
    console.log(`Ownership Transferred Successfully!`);
    console.log(`Transaction Hash: ${transReceipt.hash}`);

    console.log("\nAll blockchain tests passed!");

  } catch (error: any) {
    console.error("\nTest Failed!");
    if (error.message && error.message.includes("revert Only Land Officer")) {
      console.error("AUTH ERROR: Private key mismatch.");
    } else {
      console.error("Error Details:", error.message || error);
    }
  }
}

testRegistry();