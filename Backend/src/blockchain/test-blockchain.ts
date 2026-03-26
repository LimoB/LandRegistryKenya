import { registerLandOnChain, transferLandOnChain } from "./landRegistry";
import { officerWallet } from "./provider";

async function testRegistry() {
  try {
    console.log("🚀 Starting Blockchain Test...");
    console.log(`Using Officer Address: ${officerWallet.address}`);

    // Mock Data for a plot in Laikipia
    const citizenWallet = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Replace with a second test address
    const lrNumber = "LAI/NYAHU/2026/001";
    const ipfsHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";

    // 1. Test Registration
    console.log("\n1. Testing Land Registration...");
    const regReceipt = await registerLandOnChain(citizenWallet, lrNumber, ipfsHash);
    console.log(`✅ Land Registered! Tx Hash: ${regReceipt.hash}`);

    // 2. Test Transfer (Assuming the onChainId for the first land is 0 or 1)
    console.log("\n2. Testing Ownership Transfer...");
    const newBuyerWallet = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Replace with a third test address
    const mpesaRef = "RGC1234567";

    const transReceipt = await transferLandOnChain(0, newBuyerWallet, mpesaRef);
    console.log(`✅ Ownership Transferred! Tx Hash: ${transReceipt.hash}`);

    console.log("\n✨ All blockchain tests passed!");
  } catch (error) {
    console.error("❌ Test Failed:", error);
  }
}

testRegistry();