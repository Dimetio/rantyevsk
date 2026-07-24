-- Migration: add-rental-periods-and-termination

-- 1. Добавить rentStart и rentEnd в properties
ALTER TABLE "properties" ADD COLUMN "rentStart" TIMESTAMP(3);
ALTER TABLE "properties" ADD COLUMN "rentEnd" TIMESTAMP(3);

-- 2. Создать таблицу termination_requests
CREATE TABLE "termination_requests" (
    "id" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "initiatedById" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    CONSTRAINT "termination_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "termination_requests_propertyId_idx" ON "termination_requests"("propertyId");
CREATE INDEX "termination_requests_initiatedById_idx" ON "termination_requests"("initiatedById");

ALTER TABLE "termination_requests" ADD CONSTRAINT "termination_requests_initiatedById_fkey"
    FOREIGN KEY ("initiatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "termination_requests" ADD CONSTRAINT "termination_requests_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
