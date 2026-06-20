ALTER TABLE "sitter_booking_messages"
ADD COLUMN "client_message_id" VARCHAR(128),
ADD COLUMN "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "sitter_booking_messages_client_message_key"
ON "sitter_booking_messages"("booking_id", "sender_id", "client_message_id");
