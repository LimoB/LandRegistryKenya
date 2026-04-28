import { eq, and, inArray, or } from "drizzle-orm";
import db from "../../drizzle/db";
import { transferRequests, lands, auditLogs } from "../../drizzle/schema";

/**
 * 🔥 CREATE TRANSFER REQUEST (HARDENED VERSION)
 */
export const createTransferRequestService = async (
  buyerId: number,
  landId: number
) => {
  console.log(`[Service] Initiating transfer for Land ID: ${landId} by Buyer: ${buyerId}`);

  return await db.transaction(async (tx) => {

    /* ============================================================
       1. FETCH LAND
    ============================================================ */
    const land = await tx.query.lands.findFirst({
      where: eq(lands.id, landId)
    });

    if (!land) throw new Error("Land not found");

    /* ============================================================
       2. VALIDATION
    ============================================================ */
    if (land.ownerId === buyerId) {
      throw new Error("You already own this land");
    }

    if (!land.isForSale) {
      throw new Error("Land is not available for sale");
    }

    if (land.verificationStatus !== "verified") {
      throw new Error("Land must be verified before transfer");
    }

    /* ============================================================
       3. BLOCK ALL ACTIVE TRANSFERS (FIXED)
    ============================================================ */
    const activeStatuses = [
      "pending",
      "payment_pending",
      "paid"
    ] as const;

    const activeBlockchainStatuses = [
      "pending",
      "processing",
      "submitted"
    ] as const;

    const existing = await tx.query.transferRequests.findFirst({
      where: and(
        eq(transferRequests.landId, landId),
        or(
          inArray(transferRequests.status, activeStatuses),
          inArray(transferRequests.blockchainStatus, activeBlockchainStatuses)
        )
      )
    });

    if (existing) {
      console.warn(`[Blocked] Active transfer exists: ${existing.id}`);
      throw new Error("This land already has an ongoing transfer process");
    }

    /* ============================================================
       4. LOCK LAND (PREVENT PARALLEL SALES)
    ============================================================ */
    await tx.update(lands)
      .set({
        isForSale: false,
        updatedAt: new Date()
      })
      .where(eq(lands.id, landId));

    /* ============================================================
       5. CREATE TRANSFER REQUEST
    ============================================================ */
    const [request] = await tx.insert(transferRequests)
      .values({
        landId,
        buyerId,
        sellerId: land.ownerId,
        status: "pending",
        blockchainStatus: "pending"
      })
      .returning();

    /* ============================================================
       6. AUDIT LOG
    ============================================================ */
    await tx.insert(auditLogs).values({
      actionType: "TRANSFER_REQUEST_CREATED",
      performedBy: buyerId,
      landId,
      metadata: {
        transferId: request.id,
        buyerId,
        sellerId: land.ownerId
      }
    });

    console.log(`[SUCCESS] Transfer ${request.id} created`);

    return request;
  });
};