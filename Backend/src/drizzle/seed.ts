import db from "./db";
import {
  users,
  lands,
  transferRequests,
  auditLogs,
  payments,
  landOwnershipHistory
} from "./schema";

import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  console.log("Starting Kenyan Land Registry Seed...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  try {
    /* ============================
       1. USERS
    ============================ */
    console.log("Seeding Users...");

    const insertedUsers = await db.insert(users).values([
      {
        fullName: "Ministry Admin",
        email: "admin@registry.go.ke",
        idNumber: "11112222",
        walletAddress: "0xdb941125fd848c03cfa27dc1e32d5a2e0e25f6e1",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        emailVerifiedAt: new Date()
      },
      {
        fullName: "John Kamau",
        email: "john.kamau@gmail.com",
        idNumber: "33334444",
        walletAddress: "0xa8e50f60e5d34e7532e0a197221e3082489833f1",
        password: hashedPassword,
        role: "citizen",
        isVerified: true,
        emailVerifiedAt: new Date()
      },
      {
        fullName: "Sarah Wanjiku",
        email: "sarah.wanjiku@outlook.com",
        idNumber: "55556666",
        walletAddress: "0x8cbef89a6716215433baddf34eae5e004275a1d0",
        password: hashedPassword,
        role: "land_officer",
        isVerified: true,
        emailVerifiedAt: new Date()
      }
    ]).returning();

    const [admin, citizen, officer] = insertedUsers;

    /* ============================
       2. LANDS
    ============================ */
    console.log("Seeding Lands...");

    const insertedLands = await db.insert(lands).values([
      {
        ownerId: citizen.id,
        lrNumber: "LAI/NYAHU/2026/001",
        county: "Laikipia",
        constituency: "Laikipia West",
        sizeInAcres: "5.5000",
        landType: "agricultural",
        verificationStatus: "verified",
        verifiedBy: officer.id,
        verifiedAt: new Date(),
        onChainId: 1,
        blockchainTxHash: "0xseedtx1",
        network: "ganache",
        isForSale: true,
        priceInKsh: "2500000.00"
      },
      {
        ownerId: officer.id,
        lrNumber: "NAI/KASA/2026/492",
        county: "Nairobi",
        constituency: "Kasarani",
        sizeInAcres: "0.2500",
        landType: "residential",
        verificationStatus: "verified",
        verifiedBy: officer.id,
        verifiedAt: new Date(),
        onChainId: 2,
        blockchainTxHash: "0xseedtx2",
        network: "ganache",
        isForSale: false
      },
      {
        ownerId: citizen.id,
        lrNumber: "MSA/NYA/2026/112",
        county: "Mombasa",
        constituency: "Nyali",
        sizeInAcres: "1.2000",
        landType: "commercial",
        verificationStatus: "pending",
        isForSale: true,
        priceInKsh: "15000000.00"
      }
    ]).returning();

    const [land1, land2, land3] = insertedLands;

    /* ============================
       3. OWNERSHIP HISTORY
    ============================ */
    console.log("Seeding Ownership History...");

    await db.insert(landOwnershipHistory).values([
      {
        landId: land1.id,
        fromOwnerId: citizen.id,
        toOwnerId: citizen.id,
        fromWallet: citizen.walletAddress,
        toWallet: citizen.walletAddress,
        mpesaRef: null,
        blockchainTxHash: "0xhist1"
      },
      {
        landId: land2.id,
        fromOwnerId: officer.id,
        toOwnerId: officer.id,
        fromWallet: officer.walletAddress,
        toWallet: officer.walletAddress,
        mpesaRef: null,
        blockchainTxHash: "0xhist2"
      },
      {
        landId: land3.id,
        fromOwnerId: citizen.id,
        toOwnerId: citizen.id,
        fromWallet: citizen.walletAddress,
        toWallet: citizen.walletAddress,
        mpesaRef: null,
        blockchainTxHash: "0xhist3"
      }
    ]);

    /* ============================
       4. TRANSFER REQUESTS
    ============================ */
    console.log("Seeding Transfer Requests...");

    const insertedTransfers = await db.insert(transferRequests).values([
      {
        landId: land1.id,
        sellerId: citizen.id,
        buyerId: officer.id,
        status: "pending",
        blockchainStatus: "pending"
      },
      {
        landId: land2.id,
        sellerId: officer.id,
        buyerId: admin.id,
        status: "approved",
        blockchainStatus: "submitted"
      },
      {
        landId: land1.id,
        sellerId: citizen.id,
        buyerId: admin.id,
        status: "rejected",
        blockchainStatus: "failed"
      }
    ]).returning();

    const [t1, t2, t3] = insertedTransfers;

    /* ============================
       5. PAYMENTS
    ============================ */
    console.log("Seeding Payments...");

    await db.insert(payments).values([
      {
        transferRequestId: t2.id,
        landId: land2.id,
        operationType: "transfer",
        amount: "5000000.00",
        paymentMethod: "mpesa",
        paymentStatus: "completed",
        mpesaReceiptCode: "SJK9876543",
        confirmedAt: new Date(),
        confirmedBy: "mpesa"
      }
    ]);

    /* ============================
       6. AUDIT LOGS
    ============================ */
    console.log("Seeding Audit Logs...");

    await db.insert(auditLogs).values([
      {
        actionType: "LAND_VERIFIED",
        performedBy: officer.id,
        landId: land1.id,
        metadata: { note: "Land verified by officer" },
        blockchainTxHash: "0xaudit1"
      },
      {
        actionType: "TRANSFER_APPROVED",
        performedBy: admin.id,
        landId: land2.id,
        metadata: { transferId: t2.id },
        blockchainTxHash: "0xaudit2"
      },
      {
        actionType: "PAYMENT_COMPLETED",
        performedBy: admin.id,
        landId: land2.id,
        metadata: {
          amount: 5000000,
          method: "mpesa"
        },
        blockchainTxHash: "0xaudit3"
      }
    ]);

    console.log("Seed Complete");
    process.exit(0);

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();