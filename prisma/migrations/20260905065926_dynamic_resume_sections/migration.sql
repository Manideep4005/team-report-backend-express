/*
  Warnings:

  - You are about to drop the column `education` on the `ResumeProfile` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `ResumeProfile` table. All the data in the column will be lost.
  - You are about to drop the column `projects` on the `ResumeProfile` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `ResumeProfile` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `ResumeProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ResumeProfile" DROP COLUMN "education",
DROP COLUMN "experience",
DROP COLUMN "projects",
DROP COLUMN "skills",
DROP COLUMN "summary",
ADD COLUMN     "sections" JSONB;
