/*
  Warnings:

  - You are about to drop the `auth` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."auth" DROP CONSTRAINT "auth_userId_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "auths" "Provider" NOT NULL DEFAULT 'CREDENTIALS';

-- DropTable
DROP TABLE "public"."auth";
