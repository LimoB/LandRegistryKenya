CREATE TYPE "public"."land_type" AS ENUM('agricultural', 'residential', 'commercial', 'industrial');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'rejected', 'transferred');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'land_officer', 'citizen');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"action" text NOT NULL,
	"performed_by" integer,
	"land_id" integer,
	"tx_hash" varchar(100),
	"created_at" timestamp DEFAULT now()
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
	"on_chain_id" integer,
	"ipfs_doc_hash" text,
	"verification_status" "verification_status" DEFAULT 'pending',
	"is_for_sale" boolean DEFAULT false,
	"price_ksh" numeric(20, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "lands_lr_number_unique" UNIQUE("lr_number")
);
--> statement-breakpoint
CREATE TABLE "transfer_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transfer_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"land_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"status" "request_status" DEFAULT 'pending',
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
	"wallet_address" varchar(60) NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'citizen' NOT NULL,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_id_number_unique" UNIQUE("id_number"),
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_land_id_lands_id_fk" FOREIGN KEY ("land_id") REFERENCES "public"."lands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lands" ADD CONSTRAINT "lands_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_land_id_lands_id_fk" FOREIGN KEY ("land_id") REFERENCES "public"."lands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;