import { eq, or } from "drizzle-orm";
import db  from "../drizzle/db";
import { users } from "../drizzle/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Use $inferSelect to get the full type including password
export type UserSelect = typeof users.$inferSelect;
export type SafeUser = Omit<UserSelect, "password">;

/* ================================
   REGISTER SERVICE
================================ */
export const registerService = async (userData: any): Promise<SafeUser> => {
  // 1. Check existence (Email or ID Number)
  const existingUser = await db.query.users.findFirst({
    where: or(eq(users.email, userData.email), eq(users.idNumber, userData.idNumber)),
  });

  if (existingUser) throw new Error("User with this email or ID Number already exists");

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  // 3. Insert user
  const [newUser] = await db.insert(users).values({
    ...userData,
    password: hashedPassword,
  }).returning();

  // 4. Safely remove password
  const { password, ...safeUser } = newUser;
  return safeUser as SafeUser;
};

/* ================================
   LOGIN SERVICE
================================ */
export const loginService = async (email: string, passwordAttempt: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // Check if user exists
  if (!user) throw new Error("Invalid email or password");

  // 5. Bcrypt compare
  const isMatch = await bcrypt.compare(passwordAttempt, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");

  // 6. Sign Token with walletAddress included!
  // This satisfies the DecodedToken interface in bearAuth.ts
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      walletAddress: user.walletAddress // ✅ CRITICAL: Added for Blockchain actions
    },
    secret,
    { expiresIn: "1d" }
  );

  const { password: _, ...safeUser } = user;
  return { user: safeUser as SafeUser, token };
};