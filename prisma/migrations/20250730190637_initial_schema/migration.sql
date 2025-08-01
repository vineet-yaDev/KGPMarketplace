-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('LISTED', 'SOLD', 'RENTED');

-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('NEW', 'USED', 'RENT', 'SERVICE');

-- CreateEnum
CREATE TYPE "public"."ProductSeasonality" AS ENUM ('NONE', 'HALL_DAYS', 'PLACEMENTS', 'SEMESTER_END', 'FRESHERS', 'FESTIVE');

-- CreateEnum
CREATE TYPE "public"."KGPHalls" AS ENUM ('RK', 'RP', 'MS', 'LLR', 'MMM', 'LBS', 'AZAD', 'PATEL', 'NEHRU', 'SNIG', 'SNVH', 'MT');

-- CreateEnum
CREATE TYPE "public"."ProductCategory" AS ENUM ('ELECTRONICS', 'BOOKS', 'CLOTHING', 'FURNITURE', 'SPORTS', 'VEHICLES', 'FOOD', 'STATIONERY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ServiceCategory" AS ENUM ('TUTORING', 'REPAIR', 'DELIVERY', 'CLEANING', 'PHOTOGRAPHY', 'CODING', 'DESIGN', 'CONSULTING', 'OTHER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "mobileNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "originalPrice" DOUBLE PRECISION,
    "productType" "public"."ProductType" NOT NULL DEFAULT 'USED',
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'LISTED',
    "condition" INTEGER NOT NULL DEFAULT 3,
    "ageInMonths" DOUBLE PRECISION,
    "addressHall" "public"."KGPHalls",
    "mobileNumber" TEXT,
    "ecommerceLink" TEXT,
    "invoiceImageUrl" TEXT,
    "seasonality" "public"."ProductSeasonality" NOT NULL DEFAULT 'NONE',
    "category" "public"."ProductCategory" NOT NULL DEFAULT 'OTHER',
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "addressHall" "public"."KGPHalls",
    "portfolioUrl" TEXT,
    "experienceYears" DOUBLE PRECISION,
    "mobileNumber" TEXT,
    "category" "public"."ServiceCategory" NOT NULL DEFAULT 'OTHER',
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Demand" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mobileNumber" TEXT,
    "productCategory" "public"."ProductCategory",
    "serviceCategory" "public"."ServiceCategory",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Demand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedById" TEXT NOT NULL,
    "reportedAgainstId" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MODERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "public"."Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Demand" ADD CONSTRAINT "Demand_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reportedAgainstId_fkey" FOREIGN KEY ("reportedAgainstId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
