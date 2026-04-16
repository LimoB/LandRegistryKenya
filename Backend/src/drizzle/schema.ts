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

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "land_officer",
  "citizen"
]);

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
  "processing",
  "completed",
  "failed",
  "requires_payment",
  "canceled"
]);

export const tokenTypeEnum = pgEnum("token_type", [
  "email_verification",
  "password_reset"
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "stripe",
  "mpesa"
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

/* ================= BLOCKCHAIN EVENT LOG (NEW - CRITICAL) ================= */

export const blockchainEvents = pgTable("blockchain_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  eventName: varchar("event_name", { length: 100 }).notNull(),

  txHash: varchar("tx_hash", { length: 255 }).unique().notNull(),

  blockNumber: integer("block_number"),

  processed: boolean("processed").default(false),

  retryCount: integer("retry_count").default(0),

  payload: jsonb("payload").notNull(),

  createdAt: timestamp("created_at").defaultNow()
});

/* ================= IDEMPOTENCY KEYS (NEW - CRITICAL) ================= */

export const idempotencyKeys = pgTable("idempotency_keys", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  key: varchar("key", { length: 255 }).unique().notNull(),

  source: varchar("source", { length: 50 }).notNull(), // stripe | blockchain | mpesa

  requestHash: varchar("request_hash", { length: 255 }),

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

  currentOwnerWallet: varchar("current_owner_wallet", { length: 600 }),

  onChainId: integer("on_chain_id"),
  ipfsDocHash: text("ipfs_doc_hash"),
  blockchainTxHash: varchar("blockchain_tx_hash", { length: 255 }).unique(),

  blockNumber: integer("block_number"),
  network: varchar("network", { length: 50 }), // ganache | sepolia

  verificationStatus: verificationStatusEnum("verification_status").default("pending"),

  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),

  isForSale: boolean("is_for_sale").default(false),
  priceInKsh: numeric("price_ksh", { precision: 20, scale: 2 }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
});

/* ================= OWNERSHIP HISTORY ================= */

export const landOwnershipHistory = pgTable("land_ownership_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  landId: integer("land_id")
    .references(() => lands.id)
    .notNull(),

  fromOwnerId: integer("from_owner_id").references(() => users.id),
  toOwnerId: integer("to_owner_id").references(() => users.id),

  fromWallet: varchar("from_wallet", { length: 600 }),
  toWallet: varchar("to_wallet", { length: 600 }),

  mpesaRef: varchar("mpesa_ref", { length: 50 }),

  blockchainTxHash: varchar("tx_hash", { length: 255 }).unique(),

  fromDate: timestamp("from_date").defaultNow(),
  toDate: timestamp("to_date"),

  createdAt: timestamp("created_at").defaultNow()
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

  status: requestStatusEnum("status").default("pending").notNull(),

  blockchainStatus: varchar("blockchain_status", { length: 50 }),

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

  landId: integer("land_id").references(() => lands.id),

  operationType: varchar("operation_type", { length: 50 }),

  amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),

  paymentMethod: paymentMethodEnum("payment_method").notNull(),

  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),

  mpesaReceiptCode: varchar("mpesa_receipt_code", { length: 20 }),

  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 100 }),

  stripeSessionId: varchar("stripe_session_id", { length: 255 }).unique(),

  stripeEventId: varchar("stripe_event_id", { length: 255 }),

  stripeEventType: varchar("stripe_event_type", { length: 100 }),

  stripeRaw: jsonb("stripe_raw"),

  confirmedAt: timestamp("confirmed_at"),

  confirmedBy: varchar("confirmed_by", { length: 50 }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
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
/* ================= USERS ================= */

export const userRelations = relations(users, ({ many }) => ({
  ownedLands: many(lands),

  sentRequests: many(transferRequests, {
    relationName: "sentRequests"
  }),

  receivedRequests: many(transferRequests, {
    relationName: "receivedRequests"
  }),

  logs: many(auditLogs),
  tokens: many(verificationTokens),

  ownershipHistoryFrom: many(landOwnershipHistory),
  ownershipHistoryTo: many(landOwnershipHistory)
}));

/* ================= TOKENS ================= */

export const tokenRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [verificationTokens.userId],
    references: [users.id]
  })
}));

/* ================= LANDS ================= */

export const landRelations = relations(lands, ({ one, many }) => ({
  owner: one(users, {
    fields: [lands.ownerId],
    references: [users.id]
  }),

  verifier: one(users, {
    fields: [lands.verifiedBy],
    references: [users.id]
  }),

  transferRequests: many(transferRequests),

  payments: many(payments),

  auditLogs: many(auditLogs),

  ownershipHistory: many(landOwnershipHistory)
}));

/* ================= TRANSFER REQUESTS ================= */

export const transferRelations = relations(transferRequests, ({ one }) => ({
  land: one(lands, {
    fields: [transferRequests.landId],
    references: [lands.id]
  }),

  buyer: one(users, {
    fields: [transferRequests.buyerId],
    references: [users.id],
    relationName: "receivedRequests"
  }),

  seller: one(users, {
    fields: [transferRequests.sellerId],
    references: [users.id],
    relationName: "sentRequests"
  }),

  payment: one(payments, {
    fields: [transferRequests.id],
    references: [payments.transferRequestId]
  })
}));

/* ================= PAYMENTS ================= */

export const paymentRelations = relations(payments, ({ one }) => ({
  transferRequest: one(transferRequests, {
    fields: [payments.transferRequestId],
    references: [transferRequests.id]
  }),

  land: one(lands, {
    fields: [payments.landId],
    references: [lands.id]
  })
}));

/* ================= OWNERSHIP HISTORY ================= */

export const ownershipRelations = relations(
  landOwnershipHistory,
  ({ one }) => ({
    land: one(lands, {
      fields: [landOwnershipHistory.landId],
      references: [lands.id]
    }),

    fromOwner: one(users, {
      fields: [landOwnershipHistory.fromOwnerId],
      references: [users.id]
    }),

    toOwner: one(users, {
      fields: [landOwnershipHistory.toOwnerId],
      references: [users.id]
    })
  })
);

/* ================= AUDIT LOGS ================= */

export const auditRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.performedBy],
    references: [users.id]
  }),

  land: one(lands, {
    fields: [auditLogs.landId],
    references: [lands.id]
  })
}));