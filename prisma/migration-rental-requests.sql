-- Миграция: добавление системы заявок на аренду
-- Выполнить в Supabase SQL Editor

CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "rental_requests" (
    "id" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    CONSTRAINT "rental_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rental_requests_tenantId_propertyId_key" ON "rental_requests"("tenantId", "propertyId");
CREATE INDEX "rental_requests_propertyId_idx" ON "rental_requests"("propertyId");
CREATE INDEX "rental_requests_tenantId_idx" ON "rental_requests"("tenantId");

ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
