import { eq, desc } from "drizzle-orm";
import db from "../drizzle/db";
import { transferRequests, lands, auditLogs } from "../drizzle/schema";

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
export const approveTransferService = async (transferId: number, txHash: string, officerId: number) => {
  return await db.transaction(async (tx) => {
    // 1. Get the transfer details
    const transfer = await tx.query.transferRequests.findFirst({
      where: eq(transferRequests.id, transferId),
    });

    if (!transfer) throw new Error("Transfer request not found");

    // 2. Update Transfer Request Status
    await tx.update(transferRequests)
      .set({ 
        status: "transferred", 
        blockchainTxHash: txHash 
      })
      .where(eq(transferRequests.id, transferId));

    // 3. Update the Land Owner in the database
    await tx.update(lands)
      .set({ 
        ownerId: transfer.buyerId,
        isForSale: false, 
        updatedAt: new Date()
      })
      .where(eq(lands.id, transfer.landId));

    // 4. Create an Audit Log for the Government
    await tx.insert(auditLogs).values({
      action: `Ownership Transferred: Land ID ${transfer.landId} from User ${transfer.sellerId} to ${transfer.buyerId}`,
      performedBy: officerId,
      landId: transfer.landId,
      blockchainTxHash: txHash
    });

    return { message: "Database updated and ownership transferred successfully", txHash };
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