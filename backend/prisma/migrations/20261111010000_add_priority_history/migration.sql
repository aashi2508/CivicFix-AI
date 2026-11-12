CREATE TYPE "ComplaintPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
ALTER TABLE "Complaint" ADD COLUMN "priority" "ComplaintPriority" NOT NULL DEFAULT 'MEDIUM';
CREATE TABLE "StatusHistory" (
  "id" TEXT NOT NULL,
  "complaintId" TEXT NOT NULL,
  "fromStatus" "ComplaintStatus",
  "toStatus" "ComplaintStatus" NOT NULL,
  "changedById" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StatusHistory_complaintId_createdAt_idx" ON "StatusHistory"("complaintId", "createdAt");
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
