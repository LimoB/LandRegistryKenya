import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  numeric,
  boolean,
  timestamp,
  integer,
  pgEnum
} from "drizzle-orm/pg-core";

/* ENUMS */
export const userRoleEnum = pgEnum("user_role", ["admin", "land_officer", "citizen"]);
export const landTypeEnum = pgEnum("land_type", ["agricultural", "residential", "commercial", "industrial"]);
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "verified", "rejected"]);
export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "rejected", "transferred"]);

/* TABLES */
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }),
  idNumber: varchar("id_number", { length: 20 }).unique().notNull(), 
  walletAddress: varchar("wallet_address", { length: 60 }).unique().notNull(), 
  password: text("password").notNull(), // Added this line
  role: userRoleEnum("role").default("citizen").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const lands = pgTable("lands", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  
  // Kenyan Specific Parcel Info
  lrNumber: varchar("lr_number", { length: 50 }).unique().notNull(), 
  county: varchar("county", { length: 50 }).notNull(),
  constituency: varchar("constituency", { length: 50 }).notNull(),
  sizeInAcres: numeric("size_acres", { precision: 10, scale: 4 }).notNull(),
  landType: landTypeEnum("land_type").notNull(),
  
  // Blockchain Sync
  onChainId: integer("on_chain_id"), // Maps to LandParcel.id in Solidity
  ipfsDocHash: text("ipfs_doc_hash"), 
  blockchainTxHash: varchar("blockchain_tx_hash", { length: 255 }),
  
  verificationStatus: verificationStatusEnum("verification_status").default("pending"),
  isForSale: boolean("is_for_sale").default(false),
  priceInKsh: numeric("price_ksh", { precision: 20, scale: 2 }), // Changed from Eth to Ksh
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
});

export const transferRequests = pgTable("transfer_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  landId: integer("land_id").references(() => lands.id).notNull(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  
  status: requestStatusEnum("status").default("pending"),
  
  // M-Pesa / Offline Reference
  mpesaReceiptCode: varchar("mpesa_receipt", { length: 20 }), 
  blockchainTxHash: varchar("tx_hash", { length: 100 }), 
  
  createdAt: timestamp("created_at").defaultNow()
});

export const auditLogs = pgTable("audit_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  action: text("action").notNull(), 
  performedBy: integer("performed_by").references(() => users.id),
  landId: integer("land_id").references(() => lands.id),
  blockchainTxHash: varchar("tx_hash", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations remain the same as your previous definition...

/* ================================
   RELATIONS
================================== */

export const userRelations = relations(users, ({ many }) => ({
  ownedLands: many(lands),
  sentRequests: many(transferRequests, { relationName: "seller" }),
  receivedRequests: many(transferRequests, { relationName: "buyer" }),
  logs: many(auditLogs)
}));

export const landRelations = relations(lands, ({ one, many }) => ({
  owner: one(users, {
    fields: [lands.ownerId],
    references: [users.id],
  }),
  transferHistory: many(transferRequests),
  auditLogs: many(auditLogs)
}));

export const transferRelations = relations(transferRequests, ({ one }) => ({
  land: one(lands, {
    fields: [transferRequests.landId],
    references: [lands.id],
  }),
  buyer: one(users, {
    fields: [transferRequests.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [transferRequests.sellerId],
    references: [users.id],
  })
}));