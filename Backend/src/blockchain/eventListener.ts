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
  throw new Error("LAND_REGISTRY_ADDRESS missing in .env");
}

/* ============================
   BLOCKCHAIN CONNECTION
============================ */
const provider = new ethers.JsonRpcProvider(RPC_URL);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  LandRegistry.abi,
  provider
);

/* ============================
   WALLET CACHE (performance optimization)
============================ */
const walletCache = new Map<string, number>();

const getUserIdByWallet = async (wallet: string) => {
  if (walletCache.has(wallet)) {
    return walletCache.get(wallet)!;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.walletAddress, wallet),
  });

  if (user?.id) {
    walletCache.set(wallet, user.id);
  }

  return user?.id || null;
};

/* ============================
   LAND REGISTERED EVENT
============================ */
contract.on(
  "LandRegistered",
  async (landId: bigint, lrNumber: string, owner: string, ipfsHash: string) => {
    try {
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

      console.log("Land synced to database");
    } catch (err) {
      console.error("LandRegistered sync failed:", err);
    }
  }
);

/* ============================
   OWNERSHIP TRANSFERRED EVENT
============================ */
contract.on(
  "OwnershipTransferred",
  async (landId: bigint, from: string, to: string, mpesaRef: string) => {
    try {
      const onChainId = Number(landId);

      const land = await db.query.lands.findFirst({
        where: eq(lands.onChainId, onChainId),
      });

      if (!land) {
        console.error("Land not found for onChainId:", onChainId);
        return;
      }

      const fromOwnerId = await getUserIdByWallet(from);
      const toOwnerId = await getUserIdByWallet(to);

      /* ============================
         UPDATE LAND OWNER
      ============================ */
      await db
        .update(lands)
        .set({
          ownerId: toOwnerId ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(lands.id, land.id));

      /* ============================
         INSERT OWNERSHIP HISTORY (FIXED)
      ============================ */
      await db.insert(landOwnershipHistory).values({
        landId: land.id, // ✅ DB ID (NOT blockchain ID)
        fromOwnerId: fromOwnerId ?? null,
        toOwnerId: toOwnerId ?? null,
        fromWallet: from,
        toWallet: to,
        mpesaRef,
        fromDate: new Date(), // ✅ FIXED (not transferredAt)
      });

      console.log("Ownership synced to database");
    } catch (err) {
      console.error("Ownership sync failed:", err);
    }
  }
);

/* ============================
   START LISTENER
============================ */
export const startBlockchainListener = () => {
  console.log("Blockchain listener initialized");
};