/*
  Warnings:

  - The values [CLOTHING,VEHICLES,FOOD] on the enum `ProductCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [TUTORING,REPAIR,DELIVERY,CLEANING,PHOTOGRAPHY,CONSULTING] on the enum `ServiceCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."KGPHalls" ADD VALUE 'HJB';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'VS';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'BCR';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'ABV';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'BRH';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'JCB';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'GKH';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'RLB';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'SBP';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'ZH';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'GOKHALE';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'VSRC';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'SAM';
ALTER TYPE "public"."KGPHalls" ADD VALUE 'OTHER';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProductCategory_new" AS ENUM ('ELECTRONICS', 'BOOKS', 'STATIONERY', 'FURNITURE', 'HOUSEHOLD', 'SPORTS', 'CYCLE', 'APPAREL', 'TICKETS', 'OTHER');
ALTER TABLE "public"."Product" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "public"."Product" ALTER COLUMN "category" TYPE "public"."ProductCategory_new" USING ("category"::text::"public"."ProductCategory_new");
ALTER TABLE "public"."Demand" ALTER COLUMN "productCategory" TYPE "public"."ProductCategory_new" USING ("productCategory"::text::"public"."ProductCategory_new");
ALTER TYPE "public"."ProductCategory" RENAME TO "ProductCategory_old";
ALTER TYPE "public"."ProductCategory_new" RENAME TO "ProductCategory";
DROP TYPE "public"."ProductCategory_old";
ALTER TABLE "public"."Product" ALTER COLUMN "category" SET DEFAULT 'OTHER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ServiceCategory_new" AS ENUM ('ACADEMICS', 'CAREERS', 'COMPETITION', 'FREELANCING', 'DESIGN', 'CODING', 'VENDORS', 'OTHER');
ALTER TABLE "public"."Service" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "public"."Service" ALTER COLUMN "category" TYPE "public"."ServiceCategory_new" USING ("category"::text::"public"."ServiceCategory_new");
ALTER TABLE "public"."Demand" ALTER COLUMN "serviceCategory" TYPE "public"."ServiceCategory_new" USING ("serviceCategory"::text::"public"."ServiceCategory_new");
ALTER TYPE "public"."ServiceCategory" RENAME TO "ServiceCategory_old";
ALTER TYPE "public"."ServiceCategory_new" RENAME TO "ServiceCategory";
DROP TYPE "public"."ServiceCategory_old";
ALTER TABLE "public"."Service" ALTER COLUMN "category" SET DEFAULT 'OTHER';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Demand" DROP CONSTRAINT "Demand_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_reportedAgainstId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_reportedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_ownerId_fkey";

-- CreateIndex
CREATE INDEX "idx_admin_username" ON "public"."Admin"("username");

-- CreateIndex
CREATE INDEX "idx_admin_email" ON "public"."Admin"("email");

-- CreateIndex
CREATE INDEX "idx_admin_role" ON "public"."Admin"("role");

-- CreateIndex
CREATE INDEX "idx_demand_owner_id" ON "public"."Demand"("ownerId");

-- CreateIndex
CREATE INDEX "idx_demand_created_at" ON "public"."Demand"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_demand_product_category" ON "public"."Demand"("productCategory");

-- CreateIndex
CREATE INDEX "idx_demand_service_category" ON "public"."Demand"("serviceCategory");

-- CreateIndex
CREATE INDEX "idx_product_owner_id" ON "public"."Product"("ownerId");

-- CreateIndex
CREATE INDEX "idx_product_category" ON "public"."Product"("category");

-- CreateIndex
CREATE INDEX "idx_product_status" ON "public"."Product"("status");

-- CreateIndex
CREATE INDEX "idx_product_type" ON "public"."Product"("productType");

-- CreateIndex
CREATE INDEX "idx_product_hall" ON "public"."Product"("addressHall");

-- CreateIndex
CREATE INDEX "idx_product_created_at" ON "public"."Product"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_product_price" ON "public"."Product"("price");

-- CreateIndex
CREATE INDEX "idx_product_condition" ON "public"."Product"("condition");

-- CreateIndex
CREATE INDEX "idx_product_seasonality" ON "public"."Product"("seasonality");

-- CreateIndex
CREATE INDEX "idx_product_status_category" ON "public"."Product"("status", "category");

-- CreateIndex
CREATE INDEX "idx_product_category_date" ON "public"."Product"("category", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_product_price_condition" ON "public"."Product"("price", "condition");

-- CreateIndex
CREATE INDEX "idx_report_reported_by" ON "public"."Report"("reportedById");

-- CreateIndex
CREATE INDEX "idx_report_reported_against" ON "public"."Report"("reportedAgainstId");

-- CreateIndex
CREATE INDEX "idx_report_created_at" ON "public"."Report"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_service_owner_id" ON "public"."Service"("ownerId");

-- CreateIndex
CREATE INDEX "idx_service_category" ON "public"."Service"("category");

-- CreateIndex
CREATE INDEX "idx_service_hall" ON "public"."Service"("addressHall");

-- CreateIndex
CREATE INDEX "idx_service_created_at" ON "public"."Service"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_service_min_price" ON "public"."Service"("minPrice");

-- CreateIndex
CREATE INDEX "idx_service_max_price" ON "public"."Service"("maxPrice");

-- CreateIndex
CREATE INDEX "idx_service_experience" ON "public"."Service"("experienceYears");

-- CreateIndex
CREATE INDEX "idx_service_category_date" ON "public"."Service"("category", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_service_price_range" ON "public"."Service"("minPrice", "maxPrice");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "idx_user_created_at" ON "public"."User"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_user_blocked" ON "public"."User"("isBlocked");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Demand" ADD CONSTRAINT "Demand_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reportedAgainstId_fkey" FOREIGN KEY ("reportedAgainstId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
