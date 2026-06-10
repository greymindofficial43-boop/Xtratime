-- Add configurable homepage section fields for admin-created category blocks.
ALTER TABLE "HomeSection"
ADD COLUMN "type" TEXT NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN "categoryId" TEXT,
ADD COLUMN "articleLimit" INTEGER NOT NULL DEFAULT 6;

ALTER TABLE "HomeSection"
ADD CONSTRAINT "HomeSection_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "HomeSection_type_sortOrder_idx" ON "HomeSection"("type", "sortOrder");
CREATE INDEX "HomeSection_categoryId_idx" ON "HomeSection"("categoryId");
