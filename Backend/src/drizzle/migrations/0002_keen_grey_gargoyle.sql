CREATE TABLE "land_ownership_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "land_ownership_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"land_id" integer NOT NULL,
	"owner_id" integer NOT NULL,
	"from_date" timestamp DEFAULT now(),
	"to_date" timestamp
);
--> statement-breakpoint
ALTER TABLE "transfer_requests" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "transfer_requests" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."request_status";--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'payment_pending', 'paid', 'completed', 'rejected');--> statement-breakpoint
ALTER TABLE "transfer_requests" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."request_status";--> statement-breakpoint
ALTER TABLE "transfer_requests" ALTER COLUMN "status" SET DATA TYPE "public"."request_status" USING "status"::"public"."request_status";--> statement-breakpoint
ALTER TABLE "transfer_requests" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "action_type" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "lands" ADD COLUMN "verified_by" integer;--> statement-breakpoint
ALTER TABLE "lands" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "land_ownership_history" ADD CONSTRAINT "land_ownership_history_land_id_lands_id_fk" FOREIGN KEY ("land_id") REFERENCES "public"."lands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_ownership_history" ADD CONSTRAINT "land_ownership_history_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lands" ADD CONSTRAINT "lands_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" DROP COLUMN "action";--> statement-breakpoint
ALTER TABLE "transfer_requests" DROP COLUMN "payment_id";