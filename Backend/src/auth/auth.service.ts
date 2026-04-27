import { eq, or } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export type UserSelect = typeof users.$inferSelect;
export type SafeUser = Omit<UserSelect, "password">;

/* ============================================================
   REGISTER SERVICE
============================================================ */
export const registerService = async (userData: any): Promise<SafeUser> => {
  const email = userData.email?.toLowerCase().trim();
  const wallet = userData.walletAddress?.toLowerCase().trim();

  if (!email) throw new Error("Email is required");

  // 1. Role Logic: Allow 'admin' only if specifically needed, 
  // but ensure default is 'citizen'
  const allowedRoles = ["citizen", "land_officer", "admin"]; 
  const assignedRole = allowedRoles.includes(userData.role) ? userData.role : "citizen";

  // 2. Check Duplicates (Wallet, ID, or Email)
  const existingUser = await db.query.users.findFirst({
    where: or(
      eq(users.email, email),
      eq(users.idNumber, userData.idNumber),
      eq(users.walletAddress, wallet)
    ),
  });

  if (existingUser) {
    // Better debugging: tell the dev which field collided
    if (existingUser.email === email) throw new Error("Email already registered");
    if (existingUser.idNumber === userData.idNumber) throw new Error("ID Number already registered");
    if (existingUser.walletAddress === wallet) throw new Error("Wallet address already linked to an account");
    throw new Error("User already exists");
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // 4. Insert User
  const [newUser] = await db.insert(users).values({
    fullName: userData.fullName,
    email,
    phone: userData.phone,
    idNumber: userData.idNumber,
    walletAddress: wallet,
    password: hashedPassword,
    role: assignedRole,
    isVerified: userData.isVerified ?? false, // Respect seed data if provided
  }).returning();

  const { password, ...safeUser } = newUser;
  return safeUser as SafeUser;
};

/* ============================================================
   LOGIN SERVICE
============================================================ */
export const loginService = async (
  email: string,
  passwordAttempt: string
) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Fetch User
  const user = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // 2. Verify Password
  const isMatch = await bcrypt.compare(passwordAttempt, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // NOTE: We do NOT throw an "Account not verified" error here.
  // We return the user so the Controller can decide how to handle the 403 response.
  // This prevents the global error handler from catching it as a 500 error.

  // 3. Generate JWT
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("CRITICAL: JWT_SECRET is missing in .env file");
    throw new Error("Internal server configuration error");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
    },
    secret,
    { expiresIn: "1d" }
  );

  const { password, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
};