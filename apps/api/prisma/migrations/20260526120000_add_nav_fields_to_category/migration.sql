-- AddColumn: showInNav and navOrder to Category for admin-controlled navigation
ALTER TABLE "Category" ADD COLUMN "showInNav" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Category" ADD COLUMN "navOrder" INTEGER NOT NULL DEFAULT 99;
