import db from "./db";
import {
  users,
  lands,
  transferRequests,
  auditLogs,
  payments,
  landOwnershipHistory,
  verificationTokens
} from "./schema";

import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  console.log("Starting Kenyan Land Registry Clean & Seed...");

  // 1. CLEAN UP (Delete existing data in order of constraints)
  try {
    console.log("Wiping database tables...");
    await db.delete(auditLogs);
    await db.delete(payments);
    await db.delete(transferRequests);
    await db.delete(landOwnershipHistory);
    await db.delete(lands);
    await db.delete(verificationTokens);
    await db.delete(users);
    console.log("Database cleared.");
  } catch (e) {
    console.error("Error clearing database:", e);
  }

  /* ================= PASSWORD HASH FUNCTION ================= */
  const hash = async (password: string) => {
    return await bcrypt.hash(password, 10);
  };

  try {
    /* ================= 2. USERS ================= */
    console.log("Seeding 6 Users (1 Admin, 2 Officers, 3 Citizens)...");

    const insertedUsers = await db.insert(users).values([
      {
        // INDEX 0
        fullName: "System Admin",
        email: "admin@registry.go.ke",
        idNumber: "11110000",
        walletAddress: "0xC912c42a6282F446c6F979CA44D9612eC9B82102".toLowerCase(),
        password: await hash("password123"),
        role: "admin",
        isVerified: true,
        emailVerifiedAt: new Date()
      },
      {
        // INDEX 1
        fullName: "Officer Sarah Wanjiku",
        email: "sarah.officer@registry.go.ke",
        idNumber: "22220001",
        walletAddress: "0xD161A24947AE0b2695d1d89B6e16A3ab5E52b331".toLowerCase(),
        password: await hash("password123"),
        role: "land_officer",
        isVerified: true,
        emailVerifiedAt: new Date()
      },
      {
        // INDEX 2
        fullName: "Officer David Omolo",
        email: "david.officer@registry.go.ke",
        idNumber: "22220002",
        walletAddress: "0x5609019b4948b03106E46c716F0A979182Bf45F4".toLowerCase(),
        password: await hash("password123"),
        role: "land_officer",
        isVerified: true,
        emailVerifiedAt: new Date()
      },
      {
        // INDEX 3
        fullName: "Citizen Limo",
        email: "citizenlim07@gmail.com",
        idNumber: "33330001",
        walletAddress: "0xB8B41E5Fb401d73C6C5a859C72BE72521beE09d9".toLowerCase(),
        password: await hash("password123"),
        role: "citizen",
        isVerified: true,
        emailVerifiedAt: new Date()
      },
      {
        // INDEX 4
        fullName: "John Kamau",
        email: "john.citizen@gmail.com",
        idNumber: "33330002",
        walletAddress: "0xD0963882f03b63fb93FAdd95Df6e24B15e8fae66".toLowerCase(),
        password: await hash("password123"),
        role: "citizen",
        isVerified: true,
        emailVerifiedAt: new Date()
      },
      {
        // INDEX 5
        fullName: "Mary Atieno",
        email: "mary.citizen@gmail.com",
        idNumber: "33330003",
        walletAddress: "0x2a5f97717ce9cFEd3aC7e626f5B12D10d6F3e131".toLowerCase(),
        password: await hash("password123"),
        role: "citizen",
        isVerified: true,
        emailVerifiedAt: new Date()
      }
    ]).returning();

    const [admin, officer1, officer2, citizen1, citizen2, citizen3] = insertedUsers;

    /* ================= 3. LANDS ================= */
    console.log("Seeding Lands...");

    const insertedLands = await db.insert(lands).values([
      {
        ownerId: citizen1.id,
        lrNumber: "LAI/NYAHU/2026/001",
        county: "Laikipia",
        constituency: "Laikipia West",
        sizeInAcres: "5.0000",
        landType: "agricultural",
        verificationStatus: "pending", // Set to pending to test your VerifyLands page
        isForSale: true,
        priceInKsh: "2500000.00"
      },
      {
        ownerId: citizen2.id,
        lrNumber: "NAI/KASA/2026/492",
        county: "Nairobi",
        constituency: "Kasarani",
        sizeInAcres: "0.2500",
        landType: "residential",
        verificationStatus: "pending",
        isForSale: false
      },
      {
        ownerId: citizen3.id,
        lrNumber: "MSA/NYA/2026/112",
        county: "Mombasa",
        constituency: "Nyali",
        sizeInAcres: "1.2000",
        landType: "commercial",
        verificationStatus: "verified",
        verifiedBy: officer1.id,
        verifiedAt: new Date(),
        onChainId: 3,
        blockchainTxHash: "0xinitial_mint_hash",
        isForSale: true,
        priceInKsh: "15000000.00"
      }
    ]).returning();

    const [land1, land2, land3] = insertedLands;

    /* ================= 4. OWNERSHIP HISTORY ================= */
    console.log("Seeding Ownership History...");

    await db.insert(landOwnershipHistory).values([
      { 
        landId: land1.id, 
        fromOwnerId: citizen1.id, 
        toOwnerId: citizen1.id, 
        fromWallet: citizen1.walletAddress, 
        toWallet: citizen1.walletAddress, 
        blockchainTxHash: "0xhist1" 
      },
      { 
        landId: land3.id, 
        fromOwnerId: citizen3.id, 
        toOwnerId: citizen3.id, 
        fromWallet: citizen3.walletAddress, 
        toWallet: citizen3.walletAddress, 
        blockchainTxHash: "0xhist3" 
      }
    ]);

    /* ================= 5. TRANSFER REQUESTS ================= */
    console.log("Seeding Transfer Requests...");

    await db.insert(transferRequests).values([
      {
        landId: land3.id,
        sellerId: citizen3.id,
        buyerId: citizen1.id,
        status: "pending",
        blockchainStatus: "pending"
      }
    ]);

    /* ================= 6. AUDIT LOGS ================= */
    console.log("Seeding Audit Logs...");
    await db.insert(auditLogs).values([
      {
        performedBy: admin.id,
        actionType: "DATABASE_SEED",
        metadata: {
          resource: "SYSTEM",
          details: "Initial system seed completed successfully"
        }
      }
    ]);

    console.log("Seed Complete:");
    console.log("- 6 Users created");
    console.log("- 3 Land parcels created (2 Pending, 1 Verified)");
    console.log("- Ownership History and Transfer Requests initialized");
    
    process.exit(0);

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();