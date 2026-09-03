-- CreateTable
CREATE TABLE "public"."ResumeProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "headline" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "summary" TEXT,
    "experience" JSONB,
    "education" JSONB,
    "skills" JSONB,
    "projects" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ResumeCustomization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" JSONB,
    "template" TEXT NOT NULL DEFAULT 'PROFESSIONAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeCustomization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeProfile_userId_key" ON "public"."ResumeProfile"("userId");

-- CreateIndex
CREATE INDEX "ResumeProfile_userId_idx" ON "public"."ResumeProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeCustomization_userId_key" ON "public"."ResumeCustomization"("userId");

-- CreateIndex
CREATE INDEX "ResumeCustomization_userId_idx" ON "public"."ResumeCustomization"("userId");

-- AddForeignKey
ALTER TABLE "public"."ResumeProfile" ADD CONSTRAINT "ResumeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResumeCustomization" ADD CONSTRAINT "ResumeCustomization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
