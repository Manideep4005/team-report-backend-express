-- CreateEnum
CREATE TYPE "public"."EmailReminderJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'SKIPPED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."email_reminder_jobs" (
    "id" UUID NOT NULL,
    "jobDate" DATE NOT NULL,
    "slotTime" TEXT NOT NULL,
    "status" "public"."EmailReminderJobStatus" NOT NULL DEFAULT 'PENDING',
    "recipientUserIds" JSONB NOT NULL,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_reminder_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_reminder_jobs_status_scheduledFor_idx" ON "public"."email_reminder_jobs"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "email_reminder_jobs_jobDate_idx" ON "public"."email_reminder_jobs"("jobDate");

-- CreateIndex
CREATE UNIQUE INDEX "email_reminder_jobs_jobDate_slotTime_key" ON "public"."email_reminder_jobs"("jobDate", "slotTime");
