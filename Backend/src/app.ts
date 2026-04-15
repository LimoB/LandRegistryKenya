import express, { Application, Request, Response } from "express";
import cors from "cors";

// ✅ Import the correct middleware from your new file
// I'm using 'anyRoleAuth' as the baseline protector
import { anyRoleAuth } from "./middleware/bearAuth"; 

// Routers
import { authRouter } from "./auth/auth.route";
import { userRouter } from "./users/user.route";
import { landRouter } from "./lands/land.route";           
import { transferRouter } from "./transfers/transfer.route"; 

const app: Application = express();

// =========================
// CORS & CORE MIDDLEWARE
// =========================
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "🇰🇪 Land Registry Kenya API is running" });
});

// =========================
// PUBLIC ROUTES
// =========================
app.use("/api/auth", authRouter);

// =========================
// PROTECTED ROUTES
// =========================
// ✅ FIX: Replaced 'authMiddleware' with 'anyRoleAuth'
// This ensures the user is logged in before even hitting the sub-routers
app.use("/api/users", anyRoleAuth, userRouter);
app.use("/api/lands", anyRoleAuth, landRouter);
app.use("/api/transfers", anyRoleAuth, transferRouter);

export default app;