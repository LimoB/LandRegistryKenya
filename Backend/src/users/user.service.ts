import { eq } from "drizzle-orm";
import  db  from "../drizzle/db";
import { users } from "../drizzle/schema";

export type TUserInsert = typeof users.$inferInsert;
export type TUserSelect = typeof users.$inferSelect;

/* ================================
   GET ALL USERS (Admin/Officer View)
================================ */
export const getUsersService = async () => {
  return await db.query.users.findMany({
    with: {
      ownedLands: { columns: { id: true, lrNumber: true } },
    },
    orderBy: (users, { desc }) => [desc(users.createdAt)]
  });
};

/* ================================
   GET USER BY ID (Full Profile)
================================ */
export const getUserByIdService = async (userId: number) => {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      ownedLands: true,
      sentRequests: true,
      receivedRequests: true,
    }
  });
};

/* ================================
   UPDATE USER (Role & Verification)
================================ */
export const updateUserService = async (userId: number, updates: Partial<TUserInsert>) => {
  const result = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
  if (!result.length) throw new Error("User not found");
  return "User updated successfully";
};

/* ================================
   UPDATE PROFILE (Self)
================================ */
export const updateProfileService = async (userId: number, updates: Partial<TUserInsert>) => {
  const payload = { ...updates };
  
  // Security: Citizens cannot verify themselves or change roles
  delete (payload as any).role;
  delete (payload as any).isVerified;

  const result = await db.update(users).set(payload).where(eq(users.id, userId)).returning();
  if (!result.length) throw new Error("User not found");
  return "Profile updated successfully";
};

/* ================================
   DELETE USER
================================ */
export const deleteUserService = async (userId: number): Promise<boolean> => {
  const result = await db.delete(users).where(eq(users.id, userId)).returning();
  return result.length > 0;
};