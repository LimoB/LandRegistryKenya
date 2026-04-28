import { ethers } from "ethers";
import db from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import LandRegistry from "../artifacts/LandRegistry.json";
import { CONTRACT_ADDRESS, provider, systemWallet } from "./config";

/* ============================================================
   READ-ONLY CONTRACT
============================================================ */
export const contract = new ethers.Contract(
  CONTRACT_ADDRESS!,
  LandRegistry.abi,
  provider
);

/* ============================================================
   AUTHORIZED CONTRACT (SYSTEM SIGNER)
============================================================ */
export const getAuthorizedContract = () => {
  if (!systemWallet) {
    throw new Error("[BC-SERVICE] SYSTEM_PRIVATE_KEY is missing or invalid.");
  }

  console.log("[BC-SERVICE] Using system wallet:", systemWallet.address);

  return new ethers.Contract(
    CONTRACT_ADDRESS!,
    LandRegistry.abi,
    systemWallet
  );
};

/* ============================================================
   WALLET CACHE
============================================================ */
const walletCache = new Map<string, number>();

export const resolveUserIdByWallet = async (
  wallet: string
): Promise<number | null> => {
  if (!wallet) return null;

  const cleanWallet = wallet.toLowerCase();

  if (walletCache.has(cleanWallet)) {
    return walletCache.get(cleanWallet)!;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.walletAddress, cleanWallet),
  });

  if (user?.id) {
    walletCache.set(cleanWallet, user.id);
    return user.id;
  }

  return null;
};