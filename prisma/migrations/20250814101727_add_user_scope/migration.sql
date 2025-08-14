/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Tag_name_key";

-- AlterTable
ALTER TABLE "public"."Tag" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."Todo" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "public"."Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "public"."Tag"("userId", "name");

-- CreateIndex
CREATE INDEX "Todo_userId_idx" ON "public"."Todo"("userId");
