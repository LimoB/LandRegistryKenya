import db from "./db";
import { users, lands, transferRequests, auditLogs } from "./schema";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  console.log("🌱 Starting Kenyan Land Registry Seed...");

  // 1. Clear existing data (Optional, but helps prevent unique constraint errors)
  // await db.delete(auditLogs);
  // await db.delete(transferRequests);
  // await db.delete(lands);
  // await db.delete(users);

  const hashedPassword = await bcrypt.hash("password123", 10);

  try {
    // ==========================================
    // 2. SEED USERS (3 total)
    // ==========================================
    console.log("👤 Seeding Users...");
    const insertedUsers = await db.insert(users).values([
      {
        fullName: "Ministry Admin",
        email: "admin@registry.go.ke",
        idNumber: "11112222",
        walletAddress: "0xdb941125fd848c03cfa27dc1e32d5a2e0e25f6e1", // Your Account(0)
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      },
      {
        fullName: "John Kamau",
        email: "john.kamau@gmail.com",
        idNumber: "33334444",
        walletAddress: "0xa8e50f60e5d34e7532e0a197221e3082489833f1", // Your Account(1)
        password: hashedPassword,
        role: "citizen",
        isVerified: true,
      },
      {
        fullName: "Sarah Wanjiku",
        email: "sarah.wanjiku@outlook.com",
        idNumber: "55556666",
        walletAddress: "0x8cbef89a6716215433baddf34eae5e004275a1d0", // Your Account(2)
        password: hashedPassword,
        role: "land_officer",
        isVerified: true,
      }
    ]).returning();

    const [admin, citizen, officer] = insertedUsers;

    // ==========================================
    // 3. SEED LANDS (3 total)
    // ==========================================
    console.log("🏘️ Seeding Lands...");
    const insertedLands = await db.insert(lands).values([
      {
        ownerId: citizen.id,
        lrNumber: "LAI/NYAHU/2026/001",
        county: "Laikipia",
        constituency: "Laikipia West",
        sizeInAcres: "5.5000",
        landType: "agricultural",
        verificationStatus: "verified",
        onChainId: 1,
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
        onChainId: 2,
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
        priceInKsh: "15000000.00"
      }
    ]).returning();

    const [land1, land2, land3] = insertedLands;

    // ==========================================
    // 4. SEED TRANSFER REQUESTS (3 total)
    // ==========================================
    console.log("📝 Seeding Transfer Requests...");
    await db.insert(transferRequests).values([
      {
        landId: land1.id,
        sellerId: citizen.id,
        buyerId: officer.id,
        status: "pending",
        mpesaReceiptCode: "RGC1234567"
      },
      {
        landId: land2.id,
        sellerId: officer.id,
        buyerId: admin.id,
        status: "approved",
        mpesaReceiptCode: "SJK9876543"
      },
      {
        landId: land1.id,
        sellerId: citizen.id,
        buyerId: admin.id,
        status: "rejected"
      }
    ]);

    // ==========================================
    // 5. SEED AUDIT LOGS (3 total)
    // ==========================================
    console.log("📜 Seeding Audit Logs...");
    await db.insert(auditLogs).values([
      {
        action: "LAND_REGISTRATION_VERIFIED",
        performedBy: admin.id,
        landId: land1.id,
        blockchainTxHash: "0x2545870eba01ad1bb45e641833dc1a3d4a7192af342933f53bc7dcd9d77a199d"
      },
      {
        action: "USER_VERIFICATION_APPROVED",
        performedBy: officer.id,
        landId: null
      },
      {
        action: "OWNERSHIP_TRANSFER_APPROVED",
        performedBy: admin.id,
        landId: land2.id,
        blockchainTxHash: "0xc0a60b0f1111adc4ba0323df4f8a25ed4c284e6661510b4e19da68cf4a618b37"
      }
    ]);

    console.log("✨ Seeding Complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();