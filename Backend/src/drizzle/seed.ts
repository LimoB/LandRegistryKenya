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
  console.log("Starting Enhanced Kenyan Land Registry Seed...");

  // 1. CLEAN UP (Maintain order for Foreign Key constraints)
  try {
    console.log("Wiping existing data...");
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

  const hash = async (password: string) => await bcrypt.hash(password, 10);

  try {
    /* ================= 2. USERS ================= */
    console.log("Seeding Users (All Pre-Verified for Development)...");
    const insertedUsers = await db.insert(users).values([
      {
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
    console.log("Seeding Expanded Land Parcels...");
    const insertedLands = await db.insert(lands).values([
      {
        ownerId: citizen1.id,
        lrNumber: "KJI/CENT/2026/901", // Incremented to avoid conflicts
        county: "Kiambu",
        constituency: "Thika",
        sizeInAcres: "2.5000",
        landType: "residential",
        verificationStatus: "pending",
        isForSale: false
      },
      {
        ownerId: citizen2.id,
        lrNumber: "NKR/MAI/2026/442",
        county: "Nakuru",
        constituency: "Naivasha",
        sizeInAcres: "10.0000",
        landType: "agricultural",
        verificationStatus: "pending",
        isForSale: false
      },
      {
        ownerId: citizen3.id,
        lrNumber: "KSM/CITY/2026/013",
        county: "Kisumu",
        constituency: "Kisumu Central",
        sizeInAcres: "0.5000",
        landType: "commercial",
        verificationStatus: "verified",
        verifiedBy: officer1.id,
        verifiedAt: new Date(),
        onChainId: 101,
        isForSale: true,
        priceInKsh: "8500000.00"
      },
      {
        ownerId: citizen1.id,
        lrNumber: "NRB/WEST/2026/779",
        county: "Nairobi",
        constituency: "Westlands",
        sizeInAcres: "0.1250",
        landType: "residential",
        verificationStatus: "verified",
        verifiedBy: officer2.id,
        verifiedAt: new Date(),
        onChainId: 102,
        isForSale: true,
        priceInKsh: "45000000.00"
      }
    ]).returning();

    const [land1, land2, land3, land4] = insertedLands;

    /* ================= 4. TRANSFER REQUESTS ================= */
    console.log("Seeding Transfer Requests...");
    const insertedTransfers = await db.insert(transferRequests).values([
      {
        landId: land3.id,
        sellerId: citizen3.id,
        buyerId: citizen1.id,
        status: "pending",
        blockchainStatus: "pending",
        createdAt: new Date()
      },
      {
        landId: land4.id,
        sellerId: citizen1.id,
        buyerId: citizen2.id,
        status: "approved",
        blockchainStatus: "pending",
        createdAt: new Date(Date.now() - 86400000)
      }
    ]).returning();

    /* ================= 5. PAYMENTS ================= */
    console.log("Seeding Payments...");
    await db.insert(payments).values([
      {
        transferRequestId: insertedTransfers[1].id,
        landId: land4.id,
        amount: "45000000.00",
        paymentMethod: "mpesa",
        paymentStatus: "completed",
        operationType: "land_purchase",
        confirmedAt: new Date()
      }
    ]);

    /* ================= 6. AUDIT LOGS ================= */
    console.log("Finalizing Audit...");
    await db.insert(auditLogs).values([
      {
        performedBy: admin.id,
        actionType: "SYSTEM_REBOOT",
        metadata: {
          details: "Full database reset and expanded seed performed",
          scope: "global"
        }
      }
    ]);

    /* ================= 7. VERIFICATION TOKENS ================= */
    // Adding dummy tokens to satisfy schema but they are already verified
    await db.insert(verificationTokens).values([
      {
        userId: citizen1.id,
        token: "1234567890", // Matches the 10 character limit in schema
        type: "email_verification",
        expiresAt: new Date(Date.now() + 3600000),
        used: true
      }
    ]);

    console.log("SEEDING COMPLETE");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();