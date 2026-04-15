import { eq, or } from "drizzle-orm";
import db from "../drizzle/db";
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
  // 1. Check existence (Email, ID Number, or Wallet)
  const existingUser = await db.query.users.findFirst({
    where: or(
      eq(users.email, userData.email), 
      eq(users.idNumber, userData.idNumber),
      eq(users.walletAddress, userData.walletAddress)
    ),
  });

  if (existingUser) throw new Error("User with this email, ID Number, or Wallet already exists");

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  // 3. Insert user
  const [newUser] = await db.insert(users).values({
    ...userData,
    password: hashedPassword,
    isVerified: false, // Ensure they start unverified
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

  // 6. Verification Check
  // We return the user even if not verified, 
  // and let the controller decide if it blocks the login or not.
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");

  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      walletAddress: user.walletAddress 
    },
    secret,
    { expiresIn: "1d" }
  );

  const { password: _, ...safeUser } = user;
  return { user: safeUser as SafeUser, token };
};