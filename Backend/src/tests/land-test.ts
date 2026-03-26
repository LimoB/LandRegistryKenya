import { createLandService } from "../lands/land.service";
import { uploadToIPFS } from "../utils/ipfs";
import { registerLandOnChain } from "../blockchain/landRegistry";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function runFullLandTest() {
  console.log("🚀 Starting Full Land Registration Integration Test...");

  try {
    // 1. Setup: Get a user from your Seed data (John Kamau)
    const user = await db.query.users.findFirst({
      where: eq(users.email, "john.kamau@gmail.com"),
    });

    if (!user) {
      throw new Error("Seed user not found. Please run 'npx tsx src/drizzle/seed.ts' first.");
    }

    const testLR = `TEST/NYAHU/${Math.floor(Math.random() * 10000)}`;
    console.log(`📝 Testing with LR Number: ${testLR}`);

    // 2. Test IPFS Upload
    console.log("📡 Step 1: Uploading Mock Title Deed to IPFS...");
    const dummyBuffer = Buffer.from("Official Government Title Deed for " + testLR);
    const ipfsHash = await uploadToIPFS(dummyBuffer, `${testLR.replace(/\//g, '_')}.pdf`);
    console.log(`✅ IPFS Hash: ${ipfsHash}`);

    // 3. Test Blockchain Anchor
    console.log("🔗 Step 2: Anchoring to Blockchain (Truffle)...");
    const tx = await registerLandOnChain(user.walletAddress, testLR, ipfsHash);
    console.log(`✅ Blockchain Tx Success: ${tx.hash}`);

    // 4. Test Database Storage (Drizzle)
    console.log("🗄️ Step 3: Saving Metadata to PostgreSQL...");
    const newLand = await createLandService({
      ownerId: user.id,
      lrNumber: testLR,
      county: "Laikipia",
      constituency: "Laikipia West",
      sizeInAcres: "2.5",
      landType: "agricultural",
      ipfsDocHash: ipfsHash,
      verificationStatus: "pending",
    });

    console.log("\n✨ TEST SUCCESSFUL! ✨");
    console.log("-----------------------------------------");
    console.log(`ID In DB: ${newLand.id}`);
    console.log(`IPFS Link: https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    console.log(`On Chain: Verified for Wallet ${user.walletAddress}`);
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ TEST FAILED!");
    console.error(error.message);
    process.exit(1);
  }
}

runFullLandTest();