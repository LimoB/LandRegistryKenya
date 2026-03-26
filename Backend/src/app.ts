import express, { Application, Request, Response } from "express";
import cors from "cors";

// Middleware
import { authMiddleware } from "./middleware/bearAuth"; // Changed to your new Bearer Auth file

// Routers (Updated for Land Registry)
import { authRouter } from "./auth/auth.route";
import { userRouter } from "./users/user.route";
import { landRouter } from "./lands/land.route";           // New
import { transferRouter } from "./transfers/transfer.route"; // New

const app: Application = express();

// =========================
// CORS CONFIGURATION
// =========================
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

// =========================
// CORE MIDDLEWARE
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// HEALTH CHECK ROUTE
// =========================
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "🇰🇪 Land Registry Kenya API is running",
  });
});

// =========================
// PUBLIC ROUTES
// =========================
app.use("/api/auth", authRouter);

// =========================
// PROTECTED ROUTES
// =========================
// Note: userRouter internally uses role guards, but we apply authMiddleware here for baseline security
app.use("/api/users", authMiddleware, userRouter);
app.use("/api/lands", authMiddleware, landRouter);
app.use("/api/transfers", authMiddleware, transferRouter);

export default app;