-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('ARTICLE', 'GALLERY');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN "type" "ArticleType" NOT NULL DEFAULT 'ARTICLE';

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryImage_articleId_idx" ON "GalleryImage"("articleId");

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
