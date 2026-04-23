import { eq, and } from "drizzle-orm";
import db from "../../drizzle/db";
import { transferRequests, lands, auditLogs } from "../../drizzle/schema";

export const createTransferRequestService = async (
  buyerId: number,
  landId: number
) => {
  const land = await db.query.lands.findFirst({
    where: eq(lands.id, landId)
  });

  if (!land) throw new Error("Land not found");
  if (land.ownerId === buyerId) throw new Error("You already own this land");
  if (!land.isForSale) throw new Error("Land is not for sale");
  if (land.verificationStatus !== "verified") throw new Error("Land is not verified");

  // Global Check: Is anyone else buying this?
  const existingAny = await db.query.transferRequests.findFirst({
    where: and(
      eq(transferRequests.landId, landId),
      eq(transferRequests.status, "pending")
    )
  });
  if (existingAny) throw new Error("This land already has a pending transfer request");

  // Buyer Check: Have you already tried to buy this?
  const existingBuyer = await db.query.transferRequests.findFirst({
    where: and(
      eq(transferRequests.landId, landId),
      eq(transferRequests.buyerId, buyerId),
      eq(transferRequests.status, "pending")
    )
  });
  if (existingBuyer) throw new Error("You already have a pending request for this land");

  const [request] = await db
    .insert(transferRequests)
    .values({
      landId,
      buyerId,
      sellerId: land.ownerId,
      status: "pending"
    })
    .returning();

  await db.insert(auditLogs).values({
    actionType: "TRANSFER_REQUEST_CREATED",
    performedBy: buyerId,
    landId,
    metadata: { transferId: request.id }
  });

  return request;
};