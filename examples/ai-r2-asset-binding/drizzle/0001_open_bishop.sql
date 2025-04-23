CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_message" text NOT NULL,
	"transformed_message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
