import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { users, auditLogs } from "../drizzle/schema";

export type TUserInsert = typeof users.$inferInsert;

/* ================================
   GET ALL USERS (Admin/Officer)
================================ */
export const getUsersService = async () => {
  return await db.query.users.findMany({
    columns: {
      password: false
    },
    with: {
      ownedLands: {
        columns: {
          id: true,
          lrNumber: true
        }
      }
    },
    orderBy: (users, { desc }) => [desc(users.createdAt)]
  });
};

/* ================================
   GET USER BY ID
================================ */
export const getUserByIdService = async (userId: number) => {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      password: false
    },
    with: {
      ownedLands: true,
      verifiedLands: true,
      sentRequests: true,
      receivedRequests: true,
      logs: true,
      tokens: true,
      ownershipHistoryFrom: true,
      ownershipHistoryTo: true
    }
  });
};

/* ================================
   UPDATE USER (ADMIN ONLY)
================================ */
export const updateUserService = async (
  adminId: number,
  userId: number,
  updates: Partial<TUserInsert> & { id?: any } // Allow 'id' for destructuring
) => {
  // Destructure to safely remove fields
  // 'id' is extracted here so it doesn't end up in 'payload'
  const { 
    password, 
    id, 
    createdAt, 
    emailVerifiedAt, 
    ...payload 
  } = updates;

  const result = await db
    .update(users)
    .set(payload)
    .where(eq(users.id, userId))
    .returning();

  if (!result.length) throw new Error("User not found");

  await db.insert(auditLogs).values({
    actionType: "USER_UPDATED",
    performedBy: adminId,
    metadata: {
      updatedUserId: userId,
      changes: payload
    }
  });

  return result[0];
};

/* ================================
   UPDATE PROFILE (SELF)
=============================== */
export const updateProfileService = async (
  userId: number,
  updates: Partial<TUserInsert> & { id?: any } // Allow 'id' for destructuring
) => {
  // Destructure to prevent privilege escalation
  const { 
    role, 
    isVerified, 
    walletAddress, 
    emailVerifiedAt, 
    password: _, 
    id: __, 
    ...payload 
  } = updates;

  const result = await db
    .update(users)
    .set(payload)
    .where(eq(users.id, userId))
    .returning();

  if (!result.length) throw new Error("User not found");

  return result[0];
};

/* ================================
   DELETE USER (ADMIN ONLY)
================================ */
export const deleteUserService = async (
  adminId: number,
  userId: number
) => {
  const result = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning();

  if (!result.length) throw new Error("User not found");

  await db.insert(auditLogs).values({
    actionType: "USER_DELETED",
    performedBy: adminId,
    metadata: {
      deletedUserId: userId
    }
  });

  return true;
};