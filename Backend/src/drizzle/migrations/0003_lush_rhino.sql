ALTER TABLE "transfer_requests" ALTER COLUMN "mpesa_receipt" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD COLUMN "retry_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD COLUMN "last_retry_at" timestamp;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD COLUMN "updated_at" timestamp DEFAULT now();