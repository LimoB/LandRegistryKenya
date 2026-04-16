import { eq, or } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export type UserSelect = typeof users.$inferSelect;
export type SafeUser = Omit<UserSelect, "password">;

/* ================================
   REGISTER SERVICE
================================ */
export const registerService = async (userData: any): Promise<SafeUser> => {
  const email = userData.email?.toLowerCase().trim();

  if (!email) throw new Error("Email is required");

  // Prevent role injection (IMPORTANT)
  const allowedRole = ["citizen", "land_officer"];
  if (!allowedRole.includes(userData.role || "citizen")) {
    throw new Error("Invalid role assignment");
  }

  // Check duplicates
  const existingUser = await db.query.users.findFirst({
    where: or(
      eq(users.email, email),
      eq(users.idNumber, userData.idNumber),
      eq(users.walletAddress, userData.walletAddress)
    ),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const [newUser] = await db.insert(users).values({
    fullName: userData.fullName,
    email,
    phone: userData.phone,
    idNumber: userData.idNumber,
    walletAddress: userData.walletAddress,
    password: hashedPassword,
    role: userData.role || "citizen",
    isVerified: false,
  }).returning();

  const { password, ...safeUser } = newUser;
  return safeUser as SafeUser;
};

/* ================================
   LOGIN SERVICE
================================ */
export const loginService = async (
  email: string,
  passwordAttempt: string
) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(passwordAttempt, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Optional: block unverified users
  if (!user.isVerified) {
    throw new Error("Account not verified");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT secret missing");

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