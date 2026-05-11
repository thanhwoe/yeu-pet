-- CreateTable
CREATE TABLE "budget_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "image_url" TEXT,
    "image_id" TEXT,
    "color" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" VARCHAR(512),
    "date" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "budget_categories_name_key" ON "budget_categories"("name");

-- CreateIndex
CREATE INDEX "idx_budget_categories" ON "budget_categories"("id");

-- CreateIndex
CREATE INDEX "idx_budget_categories_name" ON "budget_categories"("name");

-- CreateIndex
CREATE INDEX "idx_budget_transactions" ON "budget_transactions"("id");

-- CreateIndex
CREATE INDEX "idx_budget_transactions_account_id" ON "budget_transactions"("account_id");

-- CreateIndex
CREATE INDEX "idx_budget_transactions_category_id" ON "budget_transactions"("category_id");

-- CreateIndex
CREATE INDEX "idx_budgets" ON "budgets"("id");

-- CreateIndex
CREATE INDEX "idx_budgets_account_id" ON "budgets"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_user_month_year_unique" ON "budgets"("account_id", "month", "year");

-- AddForeignKey
ALTER TABLE "budget_transactions" ADD CONSTRAINT "fk_budget_transactions_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "budget_transactions" ADD CONSTRAINT "fk_budget_transactions_category_id" FOREIGN KEY ("category_id") REFERENCES "budget_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "fk_budget_transactions_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
