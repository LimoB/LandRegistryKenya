import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

/* ============================
   ENV LOAD
============================ */
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  override: true,
});

/* ============================
   CONFIG
============================ */
const RPC_URL =
  process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545";

const PRIVATE_KEY = process.env.SYSTEM_PRIVATE_KEY;

/* ============================
   SAFETY CHECKS
============================ */
if (!RPC_URL) {
  throw new Error("BLOCKCHAIN_RPC_URL is missing");
}

if (!PRIVATE_KEY) {
  throw new Error("SYSTEM_PRIVATE_KEY is missing from .env");
}

/* ============================
   PROVIDER
============================ */
export const provider = new ethers.JsonRpcProvider(RPC_URL);

/* ============================
   SYSTEM WALLET (SIGNER)
============================ */
export const systemWallet = new ethers.Wallet(
  PRIVATE_KEY.trim(),
  provider
);

/* ============================
   INIT LOGS (SAFE)
============================ */
console.log("🚀 Blockchain initialized");
console.log(`🌐 RPC: ${RPC_URL}`);
console.log(`🤖 System Wallet: ${systemWallet.address}`);






// import { ethers } from "ethers";
// import * as dotenv from "dotenv";
// import path from "path";

// /* ============================
//    ENV LOAD
// ============================ */
// dotenv.config({
//   path: path.resolve(__dirname, "../../.env"),
//   override: true,
// });

// /* ============================
//    IMPORT CONTRACT (🔥 FIX)
// ============================ */
// import contractJson from "./artifacts/LandRegistry.json";

// /* ============================
//    CONFIG
// ============================ */
// const RPC_URL =
//   process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545";

// const PRIVATE_KEY = process.env.SYSTEM_PRIVATE_KEY;

// /* ============================
//    SAFETY CHECKS
// ============================ */
// if (!RPC_URL) {
//   throw new Error("BLOCKCHAIN_RPC_URL is missing");
// }

// if (!PRIVATE_KEY) {
//   throw new Error("SYSTEM_PRIVATE_KEY is missing from .env");
// }

// /* ============================
//    PROVIDER
// ============================ */
// export const provider = new ethers.JsonRpcProvider(RPC_URL);

// /* ============================
//    SYSTEM WALLET (SIGNER)
// ============================ */
// export const systemWallet = new ethers.Wallet(
//   PRIVATE_KEY.trim(),
//   provider
// );

// /* ============================
//    TYPES (STRICT + CLEAN)
// ============================ */
// type TruffleNetwork = {
//   address: string;
// };

// type TruffleArtifact = {
//   abi: any;
//   networks: Record<string, TruffleNetwork>;
// };

// const artifact = contractJson as TruffleArtifact;

// /* ============================
//    CONTRACT LOADER
// ============================ */
// export const getContract = async () => {
//   const network = await provider.getNetwork();
//   const chainId = Number(network.chainId);

//   const networkData =
//     artifact.networks?.[chainId.toString()] ||
//     artifact.networks?.["5777"]; //  fallback for Ganache quirks

//   if (!networkData) {
//     throw new Error(
//       ` Contract not deployed on chain ${chainId}. Run migrations.`
//     );
//   }

//   return new ethers.Contract(
//     networkData.address,
//     artifact.abi,
//     systemWallet
//   );
// };

// /* ============================
//    INIT LOGS (SAFE)
// ============================ */
// (async () => {
//   const network = await provider.getNetwork();
//   const chainId = Number(network.chainId);

//   console.log(" Blockchain initialized");
//   console.log(`RPC: ${RPC_URL}`);
//   console.log(`Chain ID: ${chainId}`);
//   console.log(`System Wallet: ${systemWallet.address}`);

//   const contract =
//     artifact.networks?.[chainId.toString()] ||
//     artifact.networks?.["5777"];

//   if (contract) {
//     console.log(`Contract: ${contract.address}`);
//   } else {
//     console.warn(`No contract found for chain ${chainId}`);
//   }
// })();