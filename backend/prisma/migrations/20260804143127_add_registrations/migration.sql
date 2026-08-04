/*
  Warnings:

  - You are about to drop the column `created_at` on the `registrations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "registrations" DROP COLUMN "created_at",
ADD COLUMN     "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
