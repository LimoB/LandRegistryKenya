import { eq, desc } from "drizzle-orm";
import db from "../drizzle/db";
import { transferRequests, lands, auditLogs } from "../drizzle/schema";
import { transferLandOnChain } from "@/blockchain/landRegistry";

/* ================================
   CREATE TRANSFER REQUEST
================================ */
export const createTransferRequestService = async (data: any) => {
  return await db.insert(transferRequests).values(data).returning();
};

/* ================================
   GET TRANSFER BY ID
================================ */
export const getTransferByIdService = async (id: number) => {
  return await db.query.transferRequests.findFirst({
    where: eq(transferRequests.id, id),
    with: {
      land: true,
      buyer: { columns: { id: true, fullName: true, walletAddress: true } },
      seller: { columns: { id: true, fullName: true, walletAddress: true } }
    }
  });
};

/* ================================
   APPROVE & EXECUTE TRANSFER
================================ */
export const approveTransferService = async (transferId: number, officerId: number) => {
  // 1. Fetch full transfer details
  const transfer = await getTransferByIdService(transferId);
  
  if (!transfer) throw new Error("Transfer request not found");
  if (transfer.status !== "pending") throw new Error("Transfer is already processed");

  /* ============================================================
     TYPE GUARDS: Ensuring all Blockchain data is present
     ============================================================ */
  
  // Check onChainId (number)
  if (transfer.land.onChainId === null || transfer.land.onChainId === undefined) {
    throw new Error("Validation Error: This land has not been minted on the blockchain.");
  }

  // Check Buyer Wallet Address (string)
  if (!transfer.buyer.walletAddress) {
    throw new Error("Validation Error: Buyer does not have a registered wallet address.");
  }

  // Check M-Pesa Receipt Code (string)
  if (!transfer.mpesaReceiptCode) {
    throw new Error("Validation Error: M-Pesa transaction reference is missing.");
  }

  // At this point, TypeScript "narrows" the types to strictly 'number' and 'string'
  const validOnChainId: number = transfer.land.onChainId;
  const validWallet: string = transfer.buyer.walletAddress;
  const validMpesaRef: string = transfer.mpesaReceiptCode;

  /* ============================================================
     2. EXECUTE ON BLOCKCHAIN
     ============================================================ */
  let tx;
  try {
    console.log(`Initiating Blockchain Transfer for Land ID: ${validOnChainId}`);
    
    tx = await transferLandOnChain(
      validOnChainId, 
      validWallet, 
      validMpesaRef
    );
    
    console.log(`Blockchain Success! Hash: ${tx.hash}`);
  } catch (error: any) {
    // If the blockchain fails, we stop here. DB remains unchanged.
    throw new Error(`Blockchain Transaction Failed: ${error.message}`);
  }

  /* ============================================================
     3. DATABASE TRANSACTION (Only runs if Blockchain succeeded)
     ============================================================ */
  return await db.transaction(async (txDb) => {
    // Update Transfer Request Status
    await txDb.update(transferRequests)
      .set({ 
        status: "transferred", 
        blockchainTxHash: tx.hash 
      })
      .where(eq(transferRequests.id, transferId));

    // Update the Land Owner in the DB
    await txDb.update(lands)
      .set({ 
        ownerId: transfer.buyerId,
        isForSale: false, 
        updatedAt: new Date()
      })
      .where(eq(lands.id, transfer.landId));

    // Create Government Audit Log
    await txDb.insert(auditLogs).values({
      action: `Ownership Transferred: Land ID ${transfer.landId} approved by Officer ${officerId}`,
      performedBy: officerId,
      landId: transfer.landId,
      blockchainTxHash: tx.hash
    });

    return { 
      message: "Transfer successful on-chain and database synchronized", 
      txHash: tx.hash 
    };
  });
};

/* ================================
   GET PENDING TRANSFERS (Updated for Blockchain)
================================ */
export const getPendingTransfersService = async () => {
  return await db.query.transferRequests.findMany({
    where: eq(transferRequests.status, "pending"),
    with: { 
      land: { 
        columns: { 
          lrNumber: true, 
          county: true,
          onChainId: true // CRITICAL: Your Smart Contract needs the uint ID
        } 
      }, 
      buyer: { 
        columns: { 
          fullName: true, 
          idNumber: true,
          walletAddress: true // CRITICAL: Your Smart Contract needs the target address
        } 
      },
      seller: { columns: { fullName: true } }
    },
    orderBy: (tr, { desc }) => [desc(tr.createdAt)]
  });
};


/* ================================
   REJECT TRANSFER SERVICE
================================ */
export const rejectTransferService = async (transferId: number, officerId: number, reason: string) => {
  return await db.transaction(async (tx) => {
    // 1. Update status to rejected
    const [updated] = await tx.update(transferRequests)
      .set({ status: "rejected" })
      .where(eq(transferRequests.id, transferId))
      .returning();

    if (!updated) throw new Error("Transfer request not found");

    // 2. Log the rejection in Audit Logs
    await tx.insert(auditLogs).values({
      action: `Transfer Rejected: Land ID ${updated.landId}. Reason: ${reason || "No reason provided"}`,
      performedBy: officerId,
      landId: updated.landId,
    });

    return { message: "Transfer request rejected and logged." };
  });
};

/* ================================
   GET SELLER TRANSFERS SERVICE
================================ */
export const getSellerTransfersService = async (sellerId: number) => {
  return await db.query.transferRequests.findMany({
    where: eq(transferRequests.sellerId, sellerId),
    with: {
      land: true,
      buyer: { columns: { fullName: true, idNumber: true } }
    },
    orderBy: (tr, { desc }) => [desc(tr.createdAt)]
  });
};