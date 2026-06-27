/*
  Warnings:

  - A unique constraint covering the columns `[userId,commentId]` on the table `like` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `discussion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."comment" DROP CONSTRAINT "comment_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comment" DROP CONSTRAINT "comment_discussionId_fkey";

-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "postId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL  DEFAULT NOW(),
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "discussionId" DROP NOT NULL,
ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "discussion" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL  DEFAULT NOW();

-- AlterTable
ALTER TABLE "like" ADD COLUMN     "commentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "like_userId_commentId_key" ON "like"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
