import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The sample articles inserted by prisma/seed.ts. Removing these leaves your
// real content, categories, menus and users untouched.
const DEMO_SLUGS = [
  'wwe-wrestlemania-night-1-live-results',
  'wwe-wrestlemania-41-predictions',
  'rcb-vs-dc-highlights-ipl-2026',
  'ipl-2026-points-table-playoff-scenarios',
  'nba-playoffs-2026-power-rankings',
  'donovan-mitchell-trade-destinations',
  'steelers-7-round-mock-draft-2026',
  'man-utd-carrick-lineup-chelsea-reaction',
  'barcelona-open-2026-final-preview',
  'wolff-russell-antonelli-canadian-gp',
  't1-dumbo-viral-clip-lck-2026',
  'jsw-indian-open-squash-2026',
  'liv-golf-2026-shutdown-rumors',
];

async function main() {
  const articles = await prisma.article.findMany({
    where: { slug: { in: DEMO_SLUGS } },
    select: { id: true, title: true },
  });
  const ids = articles.map((a) => a.id);

  if (ids.length) {
    await prisma.articleTag.deleteMany({ where: { articleId: { in: ids } } });
    await prisma.article.deleteMany({ where: { id: { in: ids } } });
  }

  console.log(`Removed ${ids.length} demo article(s):`);
  articles.forEach((a) => console.log(`  - ${a.title}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
