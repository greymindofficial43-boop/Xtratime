-- Let categories drive homepage sections
ALTER TABLE "Category" ADD COLUMN "showOnHomepage" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Category" ADD COLUMN "homepageOrder" INTEGER NOT NULL DEFAULT 99;
