import { ethers } from "ethers";
import db from "../drizzle/db";
import { lands, landOwnershipHistory, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import LandRegistry from "./artifacts/LandRegistry.json";

/* ============================
   ENV SAFETY
============================ */
const CONTRACT_ADDRESS = process.env.LAND_REGISTRY_ADDRESS;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";

if (!CONTRACT_ADDRESS) {
  throw new Error("❌ LAND_REGISTRY_ADDRESS missing in .env");
}

/* ============================
   CONNECT TO BLOCKCHAIN
============================ */
const provider = new ethers.JsonRpcProvider(RPC_URL);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  LandRegistry.abi,
  provider
);

/* ============================
   HELPER: WALLET → USER ID
============================ */
const getUserIdByWallet = async (wallet: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.walletAddress, wallet),
  });

  return user?.id || null;
};

/* ============================
   EVENT: LandRegistered
============================ */
contract.on(
  "LandRegistered",
  async (
    landId: bigint,
    lrNumber: string,
    owner: string,
    ipfsHash: string
  ) => {
    try {
      console.log("📦 LandRegistered EVENT:", {
        landId: landId.toString(),
        lrNumber,
        owner,
        ipfsHash,
      });

      const ownerId = await getUserIdByWallet(owner);

      await db
        .update(lands)
        .set({
          onChainId: Number(landId),
          verificationStatus: "verified",
          ipfsDocHash: ipfsHash,
          ownerId: ownerId ?? undefined,
        })
        .where(eq(lands.lrNumber, lrNumber));

      console.log("✅ Land synced to DB");
    } catch (err) {
      console.error("❌ LandRegistered sync failed:", err);
    }
  }
);

/* ============================
   EVENT: OwnershipTransferred
============================ */
contract.on(
  "OwnershipTransferred",
  async (
    landId: bigint,
    from: string,
    to: string,
    mpesaRef: string
  ) => {
    try {
      console.log("🔄 OwnershipTransferred EVENT:", {
        landId: landId.toString(),
        from,
        to,
        mpesaRef,
      });

      const id = Number(landId);

      const newOwnerId = await getUserIdByWallet(to);

      /* ============================
         1. UPDATE LAND OWNER
      ============================ */
      await db
        .update(lands)
        .set({
          ownerId: newOwnerId ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(lands.onChainId, id));

      /* ============================
         2. ADD OWNERSHIP HISTORY
      ============================ */
      const oldOwnerId = await getUserIdByWallet(from);

      await db.insert(landOwnershipHistory).values({
        landId: id,
        ownerId: oldOwnerId ?? 0,
        fromDate: new Date(),
      });

      console.log("✅ Ownership synced to DB");
    } catch (err) {
      console.error("❌ Ownership sync failed:", err);
    }
  }
);

/* ============================
   START LISTENER
============================ */
export const startBlockchainListener = () => {
  console.log("🚀 Blockchain Event Listener Running...");
};