-- CreateTable
CREATE TABLE "company_verification_requests" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "website" TEXT,
    "contactEmail" TEXT,
    "note" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_verification_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "company_verification_requests" ADD CONSTRAINT "company_verification_requests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_verification_requests" ADD CONSTRAINT "company_verification_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_verification_requests" ADD CONSTRAINT "company_verification_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
