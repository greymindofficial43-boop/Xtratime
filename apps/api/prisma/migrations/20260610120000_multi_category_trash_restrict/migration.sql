-- Soft-delete (trash) support for articles
ALTER TABLE "Article" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Article_deletedAt_idx" ON "Article"("deletedAt");

-- Multiple categories per article (primary stays on Article.categoryId)
CREATE TABLE "ArticleCategory" (
    "articleId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("articleId","categoryId")
);

-- CreateIndex
CREATE INDEX "ArticleCategory_categoryId_idx" ON "ArticleCategory"("categoryId");

-- Backfill memberships from each article's existing primary category
INSERT INTO "ArticleCategory" ("articleId", "categoryId")
SELECT "id", "categoryId" FROM "Article"
ON CONFLICT DO NOTHING;

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Stop category deletes from cascading into (destroying) their articles.
-- Restrict makes the DB block a delete while articles still reference it.
ALTER TABLE "Article" DROP CONSTRAINT "Article_categoryId_fkey";
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
