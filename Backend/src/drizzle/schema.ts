import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  numeric,
  boolean,
  timestamp,
  integer,
  pgEnum,
  jsonb
} from "drizzle-orm/pg-core";

/* ================= ENUMS ================= */

export const userRoleEnum = pgEnum("user_role", ["admin", "land_officer", "citizen"]);

export const landTypeEnum = pgEnum("land_type", [
  "agricultural",
  "residential",
  "commercial",
  "industrial"
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "verified",
  "rejected"
]);

// FIXED: Proper lifecycle
export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "approved",
  "payment_pending",
  "paid",
  "completed",
  "rejected"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed"
]);

export const tokenTypeEnum = pgEnum("token_type", [
  "email_verification",
  "password_reset"
]);

/* ================= USERS ================= */

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  fullName: varchar("full_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }),

  idNumber: varchar("id_number", { length: 20 }).unique().notNull(),
  walletAddress: varchar("wallet_address", { length: 600 }).unique().notNull(),

  password: text("password").notNull(),
  role: userRoleEnum("role").default("citizen").notNull(),

  isVerified: boolean("is_verified").default(false),
  emailVerifiedAt: timestamp("email_verified_at"),

  createdAt: timestamp("created_at").defaultNow()
});

/* ================= TOKENS ================= */

export const verificationTokens = pgTable("verification_tokens", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  token: text("token").notNull(),
  type: tokenTypeEnum("type").notNull(),

  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================= LANDS ================= */

export const lands = pgTable("lands", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  ownerId: integer("owner_id")
    .references(() => users.id)
    .notNull(),

  lrNumber: varchar("lr_number", { length: 50 }).unique().notNull(),

  county: varchar("county", { length: 50 }).notNull(),
  constituency: varchar("constituency", { length: 50 }).notNull(),

  sizeInAcres: numeric("size_acres", { precision: 10, scale: 4 }).notNull(),
  landType: landTypeEnum("land_type").notNull(),

  onChainId: integer("on_chain_id"),
  ipfsDocHash: text("ipfs_doc_hash"),
  blockchainTxHash: varchar("blockchain_tx_hash", { length: 255 }),

  verificationStatus: verificationStatusEnum("verification_status")
    .default("pending"),

  // ✅ NEW: who verified
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),

  isForSale: boolean("is_for_sale").default(false),
  priceInKsh: numeric("price_ksh", { precision: 20, scale: 2 }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
});

/* ================= OWNERSHIP HISTORY ================= */

export const landOwnershipHistory = pgTable("land_ownership_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  landId: integer("land_id")
    .references(() => lands.id)
    .notNull(),

  ownerId: integer("owner_id")
    .references(() => users.id)
    .notNull(),

  fromDate: timestamp("from_date").defaultNow(),
  toDate: timestamp("to_date")
});

/* ================= TRANSFER REQUESTS ================= */

export const transferRequests = pgTable("transfer_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  landId: integer("land_id")
    .references(() => lands.id)
    .notNull(),

  buyerId: integer("buyer_id")
    .references(() => users.id)
    .notNull(),

  sellerId: integer("seller_id")
    .references(() => users.id)
    .notNull(),

  status: requestStatusEnum("status")
    .default("pending")
    .notNull(),

  mpesaReceiptCode: varchar("mpesa_receipt", { length: 20 }),
  blockchainTxHash: varchar("tx_hash", { length: 100 }),

  createdAt: timestamp("created_at").defaultNow()
});

/* ================= PAYMENTS ================= */

export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  transferRequestId: integer("transfer_request_id")
    .references(() => transferRequests.id)
    .notNull(),

  amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),

  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),

  paymentStatus: paymentStatusEnum("payment_status")
    .default("pending")
    .notNull(),

  mpesaReceiptCode: varchar("mpesa_receipt_code", { length: 20 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 100 }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
});

/* ================= AUDIT LOGS ================= */

export const auditLogs = pgTable("audit_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  actionType: varchar("action_type", { length: 100 }).notNull(),

  performedBy: integer("performed_by").references(() => users.id),

  landId: integer("land_id").references(() => lands.id),

  metadata: jsonb("metadata"),

  blockchainTxHash: varchar("tx_hash", { length: 100 }),

  createdAt: timestamp("created_at").defaultNow()
});

/* ================= RELATIONS ================= */

export const userRelations = relations(users, ({ many }) => ({
  ownedLands: many(lands),

  sentRequests: many(transferRequests, { relationName: "seller" }),
  receivedRequests: many(transferRequests, { relationName: "buyer" }),

  logs: many(auditLogs),
  tokens: many(verificationTokens),

  ownershipHistory: many(landOwnershipHistory)
}));

export const tokenRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [verificationTokens.userId],
    references: [users.id]
  })
}));

export const landRelations = relations(lands, ({ one, many }) => ({
  owner: one(users, {
    fields: [lands.ownerId],
    references: [users.id]
  }),

  transferHistory: many(transferRequests),
  auditLogs: many(auditLogs),
  ownershipHistory: many(landOwnershipHistory)
}));

export const transferRelations = relations(transferRequests, ({ one }) => ({
  land: one(lands, {
    fields: [transferRequests.landId],
    references: [lands.id]
  }),

  buyer: one(users, {
    fields: [transferRequests.buyerId],
    references: [users.id]
  }),

  seller: one(users, {
    fields: [transferRequests.sellerId],
    references: [users.id]
  }),

  payment: one(payments)
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  transferRequest: one(transferRequests, {
    fields: [payments.transferRequestId],
    references: [transferRequests.id]
  })
}));

export const ownershipRelations = relations(landOwnershipHistory, ({ one }) => ({
  land: one(lands, {
    fields: [landOwnershipHistory.landId],
    references: [lands.id]
  }),

  owner: one(users, {
    fields: [landOwnershipHistory.ownerId],
    references: [users.id]
  })
}));