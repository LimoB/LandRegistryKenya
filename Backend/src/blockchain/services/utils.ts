import { ethers } from "ethers";
import db from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import LandRegistry from "../artifacts/LandRegistry.json";
import { CONTRACT_ADDRESS, PRIVATE_KEY, provider } from "./config";

/**
 * READ-ONLY CONTRACT
 */
export const contract = new ethers.Contract(CONTRACT_ADDRESS!, LandRegistry.abi, provider);

/**
 * HELPER: Returns a contract instance with a Signer (Officer Wallet)
 */
export const getAuthorizedContract = () => {
  if (!PRIVATE_KEY) {
    throw new Error("[BC-SERVICE] OFFICER_PRIVATE_KEY is missing in .env.");
  }
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS!, LandRegistry.abi, wallet);
};

/**
 * WALLET CACHE
 */
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