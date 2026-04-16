import express, { Application, Request, Response } from "express";
import cors from "cors";

// Routers
import { authRouter } from "./auth/auth.route";
import { userRouter } from "./users/user.route";
import { landRouter } from "./lands/land.route";
import { transferRouter } from "./transfers/transfer.route";
import { paymentRouter } from "./payments/payment.routes";
import { auditRouter } from "./audit/audit.routes";

const app: Application = express();

/* ============================================================
   CORS
============================================================ */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* ============================================================
   ⚠️ IMPORTANT STRIPE FIX
   Stripe webhook needs RAW body BEFORE express.json()
============================================================ */
app.use(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" })
);

/* ============================================================
   JSON MIDDLEWARE (AFTER WEBHOOK RAW ROUTE)
============================================================ */
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
   ROUTES
============================================================ */
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/lands", landRouter);
app.use("/api/transfers", transferRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/audit", auditRouter);

/* ============================================================
   404 HANDLER
============================================================ */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;