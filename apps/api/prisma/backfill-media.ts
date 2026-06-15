/**
 * One-time backfill: imports every existing image URL from all DB tables into MediaFile.
 * Run on the VPS after deploying:
 *   npm run media:backfill
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function extractFilename(url: string): string {
  try {
    const parts = new URL(url).pathname.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'image');
  } catch {
    return url.split('/').pop() ?? 'image';
  }
}

/** Extract Cloudinary public_id (no extension) from a Cloudinary secure URL */
function extractPublicId(url: string): string | null {
  // e.g. https://res.cloudinary.com/cloud/image/upload/v1234/xtratime/photo.jpg
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
  return match ? match[1] : null;
}

function getMimeType(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg',
    png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg',
  };
  return map[ext] ?? 'image/jpeg';
}

async function main() {
  const [articles, galleryImages, ads, promos, popupAds] = await Promise.all([
    prisma.article.findMany({
      where: { featuredImage: { not: null } },
      select: { featuredImage: true },
    }),
    prisma.galleryImage.findMany({ select: { url: true } }),
    prisma.advertisement.findMany({
      where: { imageUrl: { not: null } },
      select: { imageUrl: true },
    }),
    prisma.promo.findMany({
      where: { imageUrl: { not: null } },
      select: { imageUrl: true },
    }),
    prisma.popupAd.findMany({ select: { imageUrl: true } }),
  ]);

  const allUrls = new Set<string>(
    [
      ...articles.map((a) => a.featuredImage!),
      ...galleryImages.map((g) => g.url),
      ...ads.map((a) => a.imageUrl!),
      ...promos.map((p) => p.imageUrl!),
      ...popupAds.map((p) => p.imageUrl),
    ].filter((url) => url && (url.startsWith('http://') || url.startsWith('https://')))
  );

  const existing = await prisma.mediaFile.findMany({
    where: { url: { in: Array.from(allUrls) } },
    select: { url: true },
  });
  const existingUrls = new Set(existing.map((e) => e.url));

  const toCreate = Array.from(allUrls).filter((url) => !existingUrls.has(url));

  console.log(`Total unique image URLs found : ${allUrls.size}`);
  console.log(`Already in MediaFile          : ${existingUrls.size}`);
  console.log(`To import                     : ${toCreate.length}`);

  if (toCreate.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  let created = 0;
  for (const url of toCreate) {
    await prisma.mediaFile.create({
      data: {
        url,
        filename:  extractFilename(url),
        mimeType:  getMimeType(url),
        publicId:  extractPublicId(url),
      },
    });
    created++;
    if (created % 20 === 0 || created === toCreate.length) {
      console.log(`  ${created}/${toCreate.length} imported…`);
    }
  }

  console.log(`\nDone — imported ${created} image${created !== 1 ? 's' : ''} into MediaFile.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
