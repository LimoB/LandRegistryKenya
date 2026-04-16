import express, { Application, Request, Response } from "express";
import cors from "cors";

// Routers
import { authRouter } from "./auth/auth.route";
import { userRouter } from "./users/user.route";
import { landRouter } from "./lands/land.route";
import { transferRouter } from "./transfers/transfer.route";

const app: Application = express();

/* ============================================================
   SECURITY + CORE MIDDLEWARE
============================================================ */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ============================================================
   HEALTH CHECK
============================================================ */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "🇰🇪 Kenyan Land Registry API is running",
    status: "healthy",
  });
});

/* ============================================================
   PUBLIC ROUTES
============================================================ */
app.use("/api/auth", authRouter);

/* ============================================================
   IMPORTANT FIX:
   DO NOT globally apply anyRoleAuth here
   because routers already control access per route
============================================================ */
app.use("/api/users", userRouter);
app.use("/api/lands", landRouter);
app.use("/api/transfers", transferRouter);

/* ============================================================
   404 HANDLER
============================================================ */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;