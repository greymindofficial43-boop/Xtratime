-- Per-post SEO meta fields
ALTER TABLE "Article" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "Article" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "Article" ADD COLUMN "metaKeywords" TEXT;
