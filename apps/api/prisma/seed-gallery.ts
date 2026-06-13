import { ArticleStatus, ArticleType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find published articles that have a Cloudinary featuredImage
  const articles = await prisma.article.findMany({
    where: {
      type: ArticleType.ARTICLE,
      status: ArticleStatus.PUBLISHED,
      featuredImage: { not: null },
      deletedAt: null,
    },
    include: { category: true, author: true },
    orderBy: { publishedAt: 'desc' },
    take: 100,
  });

  if (articles.length === 0) {
    console.log('No published articles with images found. Upload some articles with featured images first.');
    return;
  }

  // Group by category
  const byCategory = new Map<string, typeof articles>();
  for (const a of articles) {
    const existing = byCategory.get(a.categoryId) ?? [];
    byCategory.set(a.categoryId, [...existing, a]);
  }

  let created = 0;

  for (const [, catArticles] of byCategory) {
    // Need at least 3 images to make a meaningful gallery
    const withImages = catArticles.filter((a) => !!a.featuredImage);
    if (withImages.length < 3) continue;

    const cat = withImages[0].category;
    const author = withImages[0].author;

    // Pick up to 8 images
    const picks = withImages.slice(0, 8);
    const galleryImages = picks.map((a, i) => ({
      url: a.featuredImage!,
      caption: a.title,
      order: i,
    }));

    // Check a gallery for this category doesn't already exist
    const existing = await prisma.article.findFirst({
      where: {
        type: ArticleType.GALLERY,
        categoryId: cat.id,
        deletedAt: null,
      },
    });
    if (existing) {
      console.log(`Skipping ${cat.name} — gallery already exists.`);
      continue;
    }

    const slug = `${cat.slug}-photo-gallery-${Date.now()}`;

    await prisma.article.create({
      data: {
        title: `${cat.name} ফটো গ্যালারি`,
        slug,
        excerpt: `${cat.name} বিভাগের সেরা মুহূর্তগুলির একটি ফটো সংকলন।`,
        content: '',
        type: ArticleType.GALLERY,
        status: ArticleStatus.PUBLISHED,
        featuredImage: galleryImages[0].url,
        publishedAt: new Date(),
        categoryId: cat.id,
        authorId: author.id,
        galleryImages: { create: galleryImages },
      },
    });

    console.log(`✓ Created gallery: ${cat.name} (${galleryImages.length} photos)`);
    created++;
  }

  console.log(`\nDone — ${created} galleries created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
