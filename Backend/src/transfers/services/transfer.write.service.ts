import { eq, and } from "drizzle-orm";
import db from "../../drizzle/db";
import { transferRequests, lands, auditLogs } from "../../drizzle/schema";

/**
 * Creates a new transfer request initiated by a Buyer (Citizen)
 */
export const createTransferRequestService = async (
  buyerId: number,
  landId: number
) => {
  console.log(`[Service] Initiating transfer for Land ID: ${landId} by Buyer: ${buyerId}`);

  // 1. Fetch Land Details
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId)
  });

  // --- VALIDATION BLOCKS ---
  if (!land) throw new Error("Land not found in the registry");
  if (land.ownerId === buyerId) throw new Error("Ownership conflict: You already own this asset.");
  if (!land.isForSale) throw new Error("This asset is not currently listed for sale.");
  if (land.verificationStatus !== "verified") throw new Error("Registry Error: Land must be verified before transfer.");

  // 2. Global Check: Prevent multiple simultaneous transfers for the same plot
  const existingAny = await db.query.transferRequests.findFirst({
    where: and(
      eq(transferRequests.landId, landId),
      eq(transferRequests.status, "pending")
    )
  });
  
  if (existingAny) {
    console.warn(`[Service] Blocked: Land ${landId} already has a pending request ID: ${existingAny.id}`);
    throw new Error("This land already has an active pending transfer request.");
  }

  // 3. Insert the new request
  const [request] = await db
    .insert(transferRequests)
    .values({
      landId,
      buyerId,
      sellerId: land.ownerId,
      status: "pending"
    })
    .returning();

  // 4. Audit Log for transparency
  await db.insert(auditLogs).values({
    actionType: "TRANSFER_REQUEST_CREATED",
    performedBy: buyerId,
    landId,
    metadata: { 
      transferId: request.id,
      buyerId,
      sellerId: land.ownerId 
    }
  });

  console.log(`%c[Service Success] Transfer ID ${request.id} created successfully.`, "color: #10b981; font-weight: bold;");
  
  return request;
};