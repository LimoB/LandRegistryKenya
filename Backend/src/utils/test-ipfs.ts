import { uploadToIPFS } from "./ipfs";

async function runTest() {
  console.log("📡 Testing Pinata IPFS Connection...");

  // Create a dummy "Title Deed" buffer
  const dummyDeedContent = "This is a test Title Deed for LR No: LAI/NYAHU/2026/001";
  const buffer = Buffer.from(dummyDeedContent);

  try {
    const cid = await uploadToIPFS(buffer, "TEST_DEED_LAI_001.txt");
    
    console.log("✅ IPFS Upload Successful!");
    console.log(`📂 CID: ${cid}`);
    console.log(`🔗 View File: https://gateway.pinata.cloud/ipfs/${cid}`);
  } catch (error) {
    console.error("❌ IPFS Test Failed. Check your Pinata keys in .env");
  }
}

runTest();