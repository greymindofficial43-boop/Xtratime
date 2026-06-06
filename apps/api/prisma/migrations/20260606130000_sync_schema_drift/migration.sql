-- CreateEnum
CREATE TYPE "MenuItemType" AS ENUM ('INTERNAL', 'CATEGORY', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "MenuItemPlacement" AS ENUM ('MAIN', 'MEGA');

-- AlterEnum
ALTER TYPE "AdType" ADD VALUE 'THIRD_PARTY';

-- AlterTable
ALTER TABLE "Advertisement" ADD COLUMN     "clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "details" JSONB,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "league" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "statusDetail" TEXT,
ADD COLUMN     "venue" TEXT;

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT,
    "type" "MenuItemType" NOT NULL DEFAULT 'INTERNAL',
    "placement" "MenuItemPlacement" NOT NULL DEFAULT 'MAIN',
    "description" TEXT,
    "badge" TEXT,
    "icon" TEXT,
    "groupName" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "opensInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuItem_placement_sortOrder_idx" ON "MenuItem"("placement", "sortOrder");

-- CreateIndex
CREATE INDEX "MenuItem_parentId_sortOrder_idx" ON "MenuItem"("parentId", "sortOrder");

-- CreateIndex
CREATE INDEX "Match_source_externalId_idx" ON "Match"("source", "externalId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
