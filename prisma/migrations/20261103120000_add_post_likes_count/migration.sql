-- AlterTable
ALTER TABLE "post" ADD COLUMN "likesCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "post_likesCount_idx" ON "post"("likesCount");