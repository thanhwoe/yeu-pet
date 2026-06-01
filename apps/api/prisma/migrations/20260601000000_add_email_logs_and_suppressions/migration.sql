CREATE TABLE "email_logs" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "resend_email_id" varchar(255),
    "account_id" uuid,
    "booking_id" uuid,
    "to_email" varchar(255) NOT NULL,
    "subject" varchar(255) NOT NULL,
    "status" varchar(50) NOT NULL DEFAULT 'pending',
    "error" text,
    "created_at" timestamptz(6) DEFAULT now(),
    "updated_at" timestamptz(6) DEFAULT now(),

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "email_suppressions" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "email" varchar(255) NOT NULL,
    "reason" varchar(50) NOT NULL,
    "created_at" timestamptz(6) DEFAULT now(),

    CONSTRAINT "email_suppressions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_logs_resend_email_id_key" ON "email_logs"("resend_email_id");
CREATE INDEX "idx_email_logs_account_id" ON "email_logs"("account_id");
CREATE INDEX "idx_email_logs_booking_id" ON "email_logs"("booking_id");
CREATE INDEX "idx_email_logs_status" ON "email_logs"("status");
CREATE INDEX "idx_email_logs_to_email" ON "email_logs"("to_email");

CREATE UNIQUE INDEX "email_suppressions_email_key" ON "email_suppressions"("email");
CREATE INDEX "idx_email_suppressions_email" ON "email_suppressions"("email");

ALTER TABLE "email_logs"
    ADD CONSTRAINT "fk_email_logs_account_id"
    FOREIGN KEY ("account_id") REFERENCES "accounts"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "email_logs"
    ADD CONSTRAINT "fk_email_logs_booking_id"
    FOREIGN KEY ("booking_id") REFERENCES "sitter_bookings"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
