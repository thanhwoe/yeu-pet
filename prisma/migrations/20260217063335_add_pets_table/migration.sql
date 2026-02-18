-- CreateEnum
CREATE TYPE "gender_enum" AS ENUM ('male', 'female', 'unknown');

-- CreateEnum
CREATE TYPE "record_type" AS ENUM ('vaccination', 'checkup', 'surgery', 'medication');

-- CreateEnum
CREATE TYPE "species_enum" AS ENUM ('dog', 'cat', 'bird', 'rabbit', 'other');

-- CreateTable
CREATE TABLE "medical_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pet_id" UUID NOT NULL,
    "record_type" "record_type" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMPTZ(6),
    "vet_clinic" VARCHAR(200),
    "vet_name" VARCHAR(100),
    "attachments" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "age" SMALLINT,
    "birthdate" TIMESTAMPTZ(6),
    "breed" VARCHAR(100),
    "weight" VARCHAR(100),
    "color" VARCHAR(100),
    "avatar_url" TEXT,
    "gender" "gender_enum" DEFAULT 'unknown',
    "species" "species_enum" DEFAULT 'other',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_medical_records" ON "medical_records"("id");

-- CreateIndex
CREATE INDEX "idx_medical_records_pet_id" ON "medical_records"("pet_id");

-- CreateIndex
CREATE INDEX "idx_pets" ON "pets"("id");

-- CreateIndex
CREATE INDEX "idx_pets_account_id" ON "pets"("account_id");

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "fk_medical_records_pet_id" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "fk_pets_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
