-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('GOOGLE', 'CUSTOM');

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "homeTeamName" TEXT NOT NULL,
    "homeTeamLogo" TEXT NOT NULL,
    "homeTeamScore" TEXT,
    "awayTeamName" TEXT NOT NULL,
    "awayTeamLogo" TEXT NOT NULL,
    "awayTeamScore" TEXT,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AdType" NOT NULL DEFAULT 'CUSTOM',
    "partnerName" TEXT,
    "imageUrl" TEXT,
    "targetUrl" TEXT,
    "googleCode" TEXT,
    "slotId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);
