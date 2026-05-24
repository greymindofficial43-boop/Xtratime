import { ArticleStatus, PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const categories = [
  { name: 'WWE', slug: 'wwe', icon: '🤼', color: '#ff4d00', sortOrder: 1 },
  { name: 'NBA', slug: 'nba', icon: '🏀', color: '#1d428a', sortOrder: 2 },
  { name: 'NFL', slug: 'nfl', icon: '🏈', color: '#013369', sortOrder: 3 },
  { name: 'Cricket', slug: 'cricket', icon: '🏏', color: '#2e7d32', sortOrder: 4 },
  { name: 'Football', slug: 'football', icon: '⚽', color: '#00a651', sortOrder: 5 },
  { name: 'Soccer', slug: 'soccer', icon: '⚽', color: '#00a651', sortOrder: 6 },
  { name: 'MMA', slug: 'mma', icon: '🥊', color: '#d32f2f', sortOrder: 7 },
  { name: 'Tennis', slug: 'tennis', icon: '🎾', color: '#c6ff00', sortOrder: 8 },
  { name: 'NHL', slug: 'nhl', icon: '🏒', color: '#000000', sortOrder: 9 },
  { name: 'MLB', slug: 'mlb', icon: '⚾', color: '#041e42', sortOrder: 10 },
  { name: 'Gaming', slug: 'gaming', icon: '🎮', color: '#7b1fa2', sortOrder: 11 },
  { name: 'Indian Sports', slug: 'indian-sports', icon: '🇮🇳', color: '#ff9933', sortOrder: 12 },
  { name: 'F1', slug: 'f1', icon: '🏎️', color: '#e10600', sortOrder: 13 },
  { name: 'Golf', slug: 'golf', icon: '⛳', color: '#2e7d32', sortOrder: 14 },
];

type SampleArticle = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categorySlug: string;
  isFeatured: boolean;
  isTrending: boolean;
  tagSlugs: string[];
  daysAgo?: number;
};

const sampleArticles: SampleArticle[] = [
  {
    title: 'Live WWE WrestleMania Night 1: Cody Rhodes vs Randy Orton full results',
    slug: 'wwe-wrestlemania-night-1-live-results',
    excerpt: 'Follow live updates, match results and highlights from WrestleMania Night 1.',
    content: `<p>WrestleMania Night 1 is underway in Las Vegas with Cody Rhodes defending against Randy Orton in the main event.</p><p>Stay tuned for live results, surprises, and post-match fallout as WWE's biggest weekend unfolds.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200&h=675&fit=crop',
    categorySlug: 'wwe',
    isFeatured: true,
    isTrending: true,
    tagSlugs: ['breaking-news'],
    daysAgo: 0,
  },
  {
    title: 'WWE WrestleMania 41: Full card predictions and match outcomes',
    slug: 'wwe-wrestlemania-41-predictions',
    excerpt: 'Our experts break down every match on the WrestleMania card with bold predictions.',
    content: `<p>WrestleMania 41 is shaping up to be one of the biggest events in WWE history.</p><h2>Key matches to watch</h2><ul><li>World Championship match</li><li>Tag team showcase</li><li>Women's division spotlight</li></ul>`,
    featuredImage: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200&h=675&fit=crop',
    categorySlug: 'wwe',
    isFeatured: false,
    isTrending: true,
    tagSlugs: ['analysis'],
    daysAgo: 1,
  },
  {
    title: 'RCB vs DC Highlights, IPL 2026: 3 moments that generated buzz among fans',
    slug: 'rcb-vs-dc-highlights-ipl-2026',
    excerpt: 'Virat Kohli, Maxwell and the death overs — the talking points from Match 26.',
    content: `<p>Royal Challengers Bengaluru took on Delhi Capitals in a high-scoring IPL 2026 encounter.</p><p>Here are the three moments that had fans talking long after the final ball.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1531415071021-2a0dd3f6f9f0?w=1200&h=675&fit=crop',
    categorySlug: 'cricket',
    isFeatured: true,
    isTrending: true,
    tagSlugs: ['breaking-news', 'analysis'],
    daysAgo: 0,
  },
  {
    title: 'IPL 2026: Points table, net run rate and playoff scenarios explained',
    slug: 'ipl-2026-points-table-playoff-scenarios',
    excerpt: 'Who qualifies, who needs miracles — your complete IPL 2026 standings guide.',
    content: `<p>The IPL 2026 league stage is entering its final stretch with several teams still in the playoff race.</p><p>We break down net run rate, remaining fixtures, and every permutation for the top four.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1624526261021-1e3a2791c8f7?w=1200&h=675&fit=crop',
    categorySlug: 'cricket',
    isFeatured: false,
    isTrending: true,
    tagSlugs: ['analysis'],
    daysAgo: 0,
  },
  {
    title: 'NBA Playoffs 2026: Power rankings after conference semifinals',
    slug: 'nba-playoffs-2026-power-rankings',
    excerpt: 'Which teams have momentum heading into the conference finals?',
    content: `<p>The NBA playoffs have delivered non-stop drama across both conferences.</p><p>Our updated power rankings reflect current form, injuries, and matchup advantages.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=675&fit=crop',
    categorySlug: 'nba',
    isFeatured: false,
    isTrending: true,
    tagSlugs: ['analysis'],
    daysAgo: 1,
  },
  {
    title: 'Top 5 Blockbuster Destinations for Donovan Mitchell if Cavaliers star leaves',
    slug: 'donovan-mitchell-trade-destinations',
    excerpt: 'If Cleveland cannot extend their superstar, these five teams could enter the race.',
    content: `<p>Donovan Mitchell's future in Cleveland remains one of the NBA's biggest offseason storylines.</p><p>We examine five realistic landing spots and what each trade package might look like.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=675&fit=crop',
    categorySlug: 'nba',
    isFeatured: false,
    isTrending: false,
    tagSlugs: ['rumors'],
    daysAgo: 2,
  },
  {
    title: 'Pittsburgh Steelers 7-round mock draft: Fixing the offense in 2026',
    slug: 'steelers-7-round-mock-draft-2026',
    excerpt: 'Mike McCarthy needs weapons — our full seven-round projection for Pittsburgh.',
    content: `<p>The Steelers enter the 2026 NFL Draft with clear needs on offense and depth across the roster.</p><p>This seven-round mock addresses the biggest holes while staying realistic on prospect availability.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9396?w=1200&h=675&fit=crop',
    categorySlug: 'nfl',
    isFeatured: false,
    isTrending: true,
    tagSlugs: ['analysis'],
    daysAgo: 0,
  },
  {
    title: 'Manchester United fans furious as Carrick leaves star out vs Chelsea',
    slug: 'man-utd-carrick-lineup-chelsea-reaction',
    excerpt: 'Supporters question team selection after narrow defeat at Old Trafford.',
    content: `<p>Manchester United supporters took to social media after a controversial starting XI against Chelsea.</p><p>The decision to bench a key wide attacker dominated post-match discussion.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&fit=crop',
    categorySlug: 'football',
    isFeatured: false,
    isTrending: true,
    tagSlugs: ['breaking-news'],
    daysAgo: 0,
  },
  {
    title: 'Barcelona Open 2026 Final: Rublev vs Fils preview and prediction',
    slug: 'barcelona-open-2026-final-preview',
    excerpt: 'Head-to-head, form guide and betting tips for the clay-court final.',
    content: `<p>Andrey Rublev meets Arthur Fils in the Barcelona Open final with both chasing their first title of 2026.</p><p>We break down tactics, recent form, and a scoreline prediction.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1622166057926-ee3009d5f4cd?w=1200&h=675&fit=crop',
    categorySlug: 'tennis',
    isFeatured: false,
    isTrending: false,
    tagSlugs: ['analysis'],
    daysAgo: 0,
  },
  {
    title: 'Toto Wolff on George Russell vs Kimi Antonelli at Canadian GP sprint',
    slug: 'wolff-russell-antonelli-canadian-gp',
    excerpt: 'Mercedes boss shares his take on the intra-team battle after sprint qualifying.',
    content: `<p>Toto Wolff addressed media after a tense sprint session that saw Russell and Antonelli split by hundredths.</p><p>The Mercedes principal praised both drivers while hinting at strategic calls for race day.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&h=675&fit=crop',
    categorySlug: 'f1',
    isFeatured: false,
    isTrending: false,
    tagSlugs: ['breaking-news'],
    daysAgo: 0,
  },
  {
    title: 'Who is T1 Dumbo? Viral clip after LCK 2026 loss explained',
    slug: 't1-dumbo-viral-clip-lck-2026',
    excerpt: 'The League of Legends community reacts to a bizarre post-match moment.',
    content: `<p>T1's latest LCK defeat sparked a viral clip featuring a figure fans have nicknamed "Dumbo."</p><p>We explain the context, the memes, and what it means for the roster going forward.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=675&fit=crop',
    categorySlug: 'gaming',
    isFeatured: false,
    isTrending: true,
    tagSlugs: ['breaking-news'],
    daysAgo: 0,
  },
  {
    title: 'JSW Indian Open PSA Copper: Indian squash stars shine on home soil',
    slug: 'jsw-indian-open-squash-2026',
    excerpt: 'Home favourites advance as the PSA Copper event delivers drama in Mumbai.',
    content: `<p>The JSW Indian Open has showcased the depth of Indian squash with several upsets in the early rounds.</p><p>We recap the biggest results and look ahead to the quarter-finals.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1599586120429-48281b6f0bdb?w=1200&h=675&fit=crop',
    categorySlug: 'indian-sports',
    isFeatured: false,
    isTrending: false,
    tagSlugs: ['analysis'],
    daysAgo: 1,
  },
  {
    title: 'Will LIV Golf shut down at the end of the 2026 season?',
    slug: 'liv-golf-2026-shutdown-rumors',
    excerpt: 'Reports swirl about the future of the breakaway tour — what we know so far.',
    content: `<p>Speculation about LIV Golf's future has intensified as the 2026 season reaches its midpoint.</p><p>We separate fact from rumor and outline the most likely outcomes.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1593111774240-29f383144c59?w=1200&h=675&fit=crop',
    categorySlug: 'golf',
    isFeatured: false,
    isTrending: false,
    tagSlugs: ['rumors'],
    daysAgo: 1,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sportskeeda.local' },
    update: {},
    create: {
      email: 'admin@sportskeeda.local',
      passwordHash,
      name: 'Sports Admin',
      role: UserRole.ADMIN,
    },
  });

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  const tagData = [
    { name: 'Breaking News', slug: 'breaking-news' },
    { name: 'Rumors', slug: 'rumors' },
    { name: 'Analysis', slug: 'analysis' },
    { name: 'Transfer', slug: 'transfer' },
  ];

  const tags = await Promise.all(
    tagData.map((t) =>
      prisma.tag.upsert({
        where: { slug: t.slug },
        update: {},
        create: t,
      }),
    ),
  );

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );

  for (const article of sampleArticles) {
    const categoryId = categoryMap[article.categorySlug];
    if (!categoryId) continue;

    const existing = await prisma.article.findUnique({
      where: { slug: article.slug },
    });
    if (existing) continue;

    const publishedAt = new Date();
    if (article.daysAgo) {
      publishedAt.setDate(publishedAt.getDate() - article.daysAgo);
    }

    const articleTags = tags.filter((t) => article.tagSlugs.includes(t.slug));

    await prisma.article.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        featuredImage: article.featuredImage,
        status: ArticleStatus.PUBLISHED,
        isFeatured: article.isFeatured,
        isTrending: article.isTrending,
        publishedAt,
        authorId: admin.id,
        categoryId,
        tags: {
          create: articleTags.map((tag) => ({ tagId: tag.id })),
        },
      },
    });
  }

  console.log('Seed completed.');
  console.log('Admin login: admin@sportskeeda.local / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
