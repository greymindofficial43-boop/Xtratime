const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  showInNav?: boolean;
  navOrder?: number;
  _count?: { articles: number };
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Author = {
  id: string;
  name: string;
  email: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  viewCount: number;
  publishedAt?: string | null;
  createdAt: string;
  author: Author;
  category: Pick<Category, 'id' | 'name' | 'slug' | 'color'>;
  tags: Tag[];
};

export type PaginatedArticles = {
  items: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MatchStatus = 'live' | 'upcoming' | 'result';

export type Match = {
  id: string;
  sport: string;
  title: string;
  homeTeamName: string;
  homeTeamLogo: string;
  homeTeamScore?: string | null;
  awayTeamName: string;
  awayTeamLogo: string;
  awayTeamScore?: string | null;
  status: MatchStatus;
  note?: string | null;
  date: string;
};

export type AdType = 'GOOGLE' | 'CUSTOM';

export type Advertisement = {
  id: string;
  title: string;
  type: AdType;
  partnerName?: string | null;
  imageUrl?: string | null;
  targetUrl?: string | null;
  googleCode?: string | null;
  slotId: string;
  isActive: boolean;
};

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    next: init?.cache === 'no-store' ? undefined : { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getCategories: () => fetchApi<Category[]>('/categories'),
  getCategory: (slug: string) => fetchApi<Category>(`/categories/${slug}`),
  getArticles: (params?: Record<string, string | number | boolean>) => {
    const search = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') search.set(k, String(v));
      });
    }
    const qs = search.toString();
    return fetchApi<PaginatedArticles>(`/articles${qs ? `?${qs}` : ''}`);
  },
  getArticle: (slug: string) => fetchApi<Article>(`/articles/${slug}`),
  searchArticles: (q: string) =>
    fetchApi<PaginatedArticles>(`/articles?search=${encodeURIComponent(q)}&limit=20`),
  getMatches: () => fetchApi<Match[]>('/matches', { cache: 'no-store' }),
  getAds: (slotId?: string) =>
    fetchApi<Advertisement[]>(`/ads${slotId ? `?slotId=${encodeURIComponent(slotId)}` : ''}`, {
      cache: 'no-store',
    }),
};
