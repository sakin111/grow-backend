/*
  Warnings:

  - You are about to drop the `auth` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `discussion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `follow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mentor_availability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mentor_profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `save` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session_booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `share` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `video_session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."auth" DROP CONSTRAINT "auth_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat_message" DROP CONSTRAINT "chat_message_discussionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comment" DROP CONSTRAINT "comment_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comment" DROP CONSTRAINT "comment_discussionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."company" DROP CONSTRAINT "company_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."discussion" DROP CONSTRAINT "discussion_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."follow" DROP CONSTRAINT "follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."follow" DROP CONSTRAINT "follow_followingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."like" DROP CONSTRAINT "like_discussionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."like" DROP CONSTRAINT "like_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."like" DROP CONSTRAINT "like_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."mentor_availability" DROP CONSTRAINT "mentor_availability_mentorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."mentor_profile" DROP CONSTRAINT "mentor_profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."post" DROP CONSTRAINT "post_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."review" DROP CONSTRAINT "review_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."review" DROP CONSTRAINT "review_mentorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."review" DROP CONSTRAINT "review_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."save" DROP CONSTRAINT "save_discussionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."save" DROP CONSTRAINT "save_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."save" DROP CONSTRAINT "save_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."session_booking" DROP CONSTRAINT "session_booking_mentorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."session_booking" DROP CONSTRAINT "session_booking_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."share" DROP CONSTRAINT "share_discussionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."share" DROP CONSTRAINT "share_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."share" DROP CONSTRAINT "share_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."video_session" DROP CONSTRAINT "video_session_bookingId_fkey";

-- DropTable
DROP TABLE "public"."auth";

-- DropTable
DROP TABLE "public"."chat_message";

-- DropTable
DROP TABLE "public"."comment";

-- DropTable
DROP TABLE "public"."company";

-- DropTable
DROP TABLE "public"."discussion";

-- DropTable
DROP TABLE "public"."follow";

-- DropTable
DROP TABLE "public"."like";

-- DropTable
DROP TABLE "public"."mentor_availability";

-- DropTable
DROP TABLE "public"."mentor_profile";

-- DropTable
DROP TABLE "public"."notification";

-- DropTable
DROP TABLE "public"."post";

-- DropTable
DROP TABLE "public"."review";

-- DropTable
DROP TABLE "public"."save";

-- DropTable
DROP TABLE "public"."session_booking";

-- DropTable
DROP TABLE "public"."share";

-- DropTable
DROP TABLE "public"."user";

-- DropTable
DROP TABLE "public"."video_session";

-- DropEnum
DROP TYPE "public"."BookingStatus";

-- DropEnum
DROP TYPE "public"."DayOfWeek";

-- DropEnum
DROP TYPE "public"."NotificationType";

-- DropEnum
DROP TYPE "public"."Provider";

-- DropEnum
DROP TYPE "public"."Role";

-- DropEnum
DROP TYPE "public"."SessionStatus";

-- DropEnum
DROP TYPE "public"."Topic";

-- DropEnum
DROP TYPE "public"."UserStatus";

-- DropEnum
DROP TYPE "public"."VerificationStatus";
