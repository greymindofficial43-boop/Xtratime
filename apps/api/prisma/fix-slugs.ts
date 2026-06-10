// One-time backfill: re-slugify any Category/Article whose slug contains
// non-ASCII characters (e.g. Bangla). Those URLs already 404, so rewriting them
// loses no working links. Run once after deploying the new slugify():
//   cd apps/api && npx ts-node prisma/fix-slugs.ts
import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/common/slug.util';

const prisma = new PrismaClient();

const isNonAscii = (s: string) => /[^\x00-\x7F]/.test(s);

async function uniqueSlug(
  base: string,
  taken: Set<string>,
): Promise<string> {
  let slug = base;
  let n = 1;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  taken.add(slug);
  return slug;
}

async function fixCategories() {
  const cats = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
  const taken = new Set(cats.filter((c) => !isNonAscii(c.slug)).map((c) => c.slug));
  let fixed = 0;
  for (const c of cats) {
    if (!isNonAscii(c.slug)) continue;
    const slug = await uniqueSlug(slugify(c.name), taken);
    await prisma.category.update({ where: { id: c.id }, data: { slug } });
    console.log(`category: "${c.slug}" -> "${slug}"`);
    fixed++;
  }
  console.log(`Categories fixed: ${fixed}`);
}

async function fixArticles() {
  const arts = await prisma.article.findMany({ select: { id: true, title: true, slug: true } });
  const taken = new Set(arts.filter((a) => !isNonAscii(a.slug)).map((a) => a.slug));
  let fixed = 0;
  for (const a of arts) {
    if (!isNonAscii(a.slug)) continue;
    const slug = await uniqueSlug(slugify(a.title), taken);
    await prisma.article.update({ where: { id: a.id }, data: { slug } });
    console.log(`article: "${a.slug}" -> "${slug}"`);
    fixed++;
  }
  console.log(`Articles fixed: ${fixed}`);
}

async function main() {
  await fixCategories();
  await fixArticles();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
