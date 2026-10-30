CREATE TYPE "library_shelf" AS ENUM('reading', 'planned', 'completed');--> statement-breakpoint
CREATE TABLE "library_entries" (
	"owner_hash" text,
	"manga_id" text,
	"title" text NOT NULL,
	"cover" text DEFAULT '' NOT NULL,
	"source" text NOT NULL,
	"country" text DEFAULT '' NOT NULL,
	"shelf" "library_shelf" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "library_entries_pkey" PRIMARY KEY("owner_hash","manga_id")
);
--> statement-breakpoint
CREATE INDEX "library_owner_shelf_idx" ON "library_entries" ("owner_hash","shelf");