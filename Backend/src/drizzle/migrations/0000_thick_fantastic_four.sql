CREATE TYPE "public"."land_type" AS ENUM('agricultural', 'residential', 'commercial', 'industrial');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('stripe', 'mpesa');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'requires_payment', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'payment_pending', 'paid', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."token_type" AS ENUM('email_verification', 'password_reset');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'land_officer', 'citizen');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"action_type" varchar(100) NOT NULL,
	"performed_by" integer,
	"land_id" integer,
	"metadata" jsonb,
	"tx_hash" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blockchain_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "blockchain_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_name" varchar(100) NOT NULL,
	"tx_hash" varchar(255) NOT NULL,
	"block_number" integer,
	"processed" boolean DEFAULT false,
	"retry_count" integer DEFAULT 0,
	"payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "blockchain_events_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "idempotency_keys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"key" varchar(255) NOT NULL,
	"source" varchar(50) NOT NULL,
	"request_hash" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "idempotency_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "land_ownership_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "land_ownership_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"land_id" integer NOT NULL,
	"from_owner_id" integer,
	"to_owner_id" integer,
	"from_wallet" varchar(600),
	"to_wallet" varchar(600),
	"mpesa_ref" varchar(50),
	"tx_hash" varchar(255),
	"from_date" timestamp DEFAULT now(),
	"to_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "land_ownership_history_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "lands" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lands_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"owner_id" integer NOT NULL,
	"lr_number" varchar(50) NOT NULL,
	"county" varchar(50) NOT NULL,
	"constituency" varchar(50) NOT NULL,
	"size_acres" numeric(10, 4) NOT NULL,
	"land_type" "land_type" NOT NULL,
	"current_owner_wallet" varchar(600),
	"on_chain_id" integer,
	"ipfs_doc_hash" text,
	"blockchain_tx_hash" varchar(255),
	"block_number" integer,
	"network" varchar(50),
	"verification_status" "verification_status" DEFAULT 'pending',
	"verified_by" integer,
	"verified_at" timestamp,
	"is_for_sale" boolean DEFAULT false,
	"price_ksh" numeric(20, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "lands_lr_number_unique" UNIQUE("lr_number"),
	CONSTRAINT "lands_blockchain_tx_hash_unique" UNIQUE("blockchain_tx_hash")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"transfer_request_id" integer NOT NULL,
	"land_id" integer,
	"operation_type" varchar(50),
	"amount" numeric(20, 2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"mpesa_receipt_code" varchar(20),
	"stripe_payment_intent_id" varchar(100),
	"stripe_session_id" varchar(255),
	"stripe_event_id" varchar(255),
	"stripe_event_type" varchar(100),
	"stripe_raw" jsonb,
	"confirmed_at" timestamp,
	"confirmed_by" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
CREATE TABLE "transfer_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transfer_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"land_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"blockchain_status" varchar(50),
	"mpesa_receipt" varchar(20),
	"tx_hash" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"full_name" varchar(150) NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone" varchar(20),
	"id_number" varchar(20) NOT NULL,
	"wallet_address" varchar(600) NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'citizen' NOT NULL,
	"is_verified" boolean DEFAULT false,
	"email_verified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_id_number_unique" UNIQUE("id_number"),
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "verification_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"type" "token_type" NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_land_id_lands_id_fk" FOREIGN KEY ("land_id") REFERENCES "public"."lands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_ownership_history" ADD CONSTRAINT "land_ownership_history_land_id_lands_id_fk" FOREIGN KEY ("land_id") REFERENCES "public"."lands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_ownership_history" ADD CONSTRAINT "land_ownership_history_from_owner_id_users_id_fk" FOREIGN KEY ("from_owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_ownership_history" ADD CONSTRAINT "land_ownership_history_to_owner_id_users_id_fk" FOREIGN KEY ("to_owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lands" ADD CONSTRAINT "lands_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lands" ADD CONSTRAINT "lands_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_transfer_request_id_transfer_requests_id_fk" FOREIGN KEY ("transfer_request_id") REFERENCES "public"."transfer_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_land_id_lands_id_fk" FOREIGN KEY ("land_id") REFERENCES "public"."lands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_land_id_lands_id_fk" FOREIGN KEY ("land_id") REFERENCES "public"."lands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;