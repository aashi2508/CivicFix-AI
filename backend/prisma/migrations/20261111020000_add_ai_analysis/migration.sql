CREATE TYPE "AIReviewState" AS ENUM ('PENDING', 'COMPLETED', 'NEEDS_HUMAN_REVIEW', 'APPROVED', 'CORRECTED', 'FAILED');
CREATE TABLE "AIAnalysis" (
  "id" TEXT NOT NULL,
  "complaintId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "priority" "ComplaintPriority" NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "reason" TEXT NOT NULL,
  "needsHumanReview" BOOLEAN NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "state" "AIReviewState" NOT NULL DEFAULT 'PENDING',
  "reviewedById" TEXT,
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AIAnalysis_complaintId_createdAt_idx" ON "AIAnalysis"("complaintId", "createdAt");
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
