const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const API_BASE = API_URL.replace(/\/api$/, '');

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type ManagedUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sortOrder: number;
  showInNav: boolean;
  navOrder: number;
  parentId?: string | null;
  children?: Category[];
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type MenuItemType = 'INTERNAL' | 'CATEGORY' | 'EXTERNAL';
export type MenuItemPlacement = 'MAIN' | 'MEGA';

export type MenuItem = {
  id: string;
  title: string;
  href?: string | null;
  type: MenuItemType;
  placement: MenuItemPlacement;
  description?: string | null;
  badge?: string | null;
  icon?: string | null;
  groupName?: string | null;
  isVisible: boolean;
  opensInNewTab: boolean;
  sortOrder: number;
  categoryId?: string | null;
  category?: Pick<Category, 'id' | 'name' | 'slug' | 'icon' | 'color'> | null;
  parentId?: string | null;
  children?: MenuItem[];
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  videoUrl?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
  isTrending: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string; color?: string | null };
  tags: Tag[];
};

export type MatchStatus = 'live' | 'upcoming' | 'result';

export type Match = {
  id: string;
  source?: string;
  externalId?: string | null;
  sport: string;
  league?: string | null;
  title: string;
  homeTeamName: string;
  homeTeamLogo: string;
  homeTeamScore?: string | null;
  awayTeamName: string;
  awayTeamLogo: string;
  awayTeamScore?: string | null;
  status: MatchStatus;
  note?: string | null;
  statusDetail?: string | null;
  venue?: string | null;
  details?: Record<string, unknown> | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type AdType = 'GOOGLE' | 'CUSTOM' | 'THIRD_PARTY';

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
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: boolean },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };

  if (init?.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `API error ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

export const adminApi = {
  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    }),

  me: () => apiFetch<AuthUser>('/auth/me'),

  getCategories: () => apiFetch<Category[]>('/categories'),
  createCategory: (data: Partial<Category>) =>
    apiFetch<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<Category>) =>
    apiFetch<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  reorderCategories: (updates: { id: string; sortOrder?: number; navOrder?: number }[]) =>
    apiFetch('/categories/reorder', { method: 'POST', body: JSON.stringify({ updates }) }),
  deleteCategory: (id: string) =>
    apiFetch(`/categories/${id}`, { method: 'DELETE' }),

  getTags: () => apiFetch<Tag[]>('/tags'),
  createTag: (name: string) =>
    apiFetch<Tag>('/tags', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteTag: (id: string) => apiFetch(`/tags/${id}`, { method: 'DELETE' }),

  getUsers: () => apiFetch<ManagedUser[]>('/users'),
  createUser: (data: { email: string; name: string; password: string; role: string }) =>
    apiFetch<ManagedUser>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (
    id: string,
    data: Partial<{ email: string; name: string; password: string; role: string }>,
  ) => apiFetch<ManagedUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: string) => apiFetch(`/users/${id}`, { method: 'DELETE' }),

  getMenus: () => apiFetch<MenuItem[]>('/menus'),
  createMenu: (data: Partial<MenuItem>) =>
    apiFetch<MenuItem>('/menus', { method: 'POST', body: JSON.stringify(data) }),
  updateMenu: (id: string, data: Partial<MenuItem>) =>
    apiFetch<MenuItem>(`/menus/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  reorderMenus: (updates: { id: string; sortOrder: number }[]) =>
    apiFetch('/menus/reorder', { method: 'POST', body: JSON.stringify({ updates }) }),
  deleteMenu: (id: string) => apiFetch(`/menus/${id}`, { method: 'DELETE' }),
  seedMenus: () => apiFetch<{ created: number; skipped: boolean }>('/menus/seed-defaults', { method: 'POST' }),

  getArticles: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : '';
    return apiFetch<{
      items: Article[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/articles/admin/all${qs}`);
  },

  createArticle: (data: Record<string, unknown>) =>
    apiFetch<Article>('/articles', { method: 'POST', body: JSON.stringify(data) }),

  updateArticle: (id: string, data: Record<string, unknown>) =>
    apiFetch<Article>(`/articles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteArticle: (id: string) =>
    apiFetch(`/articles/${id}`, { method: 'DELETE' }),

  getMatches: () => apiFetch<Match[]>('/matches'),
  createMatch: (data: Partial<Match>) =>
    apiFetch<Match>('/matches', { method: 'POST', body: JSON.stringify(data) }),
  updateMatch: (id: string, data: Partial<Match>) =>
    apiFetch<Match>(`/matches/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMatch: (id: string) =>
    apiFetch(`/matches/${id}`, { method: 'DELETE' }),
  syncMatches: () => apiFetch<{ success: boolean; synced: number; message?: string }>('/matches/sync', { method: 'POST' }),

  uploadFile: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message ?? 'Upload failed');
    }

    const data = (await res.json()) as { url: string };
    // If server returned a data URL (base64) warn the caller — in production this should not happen.
    if (typeof data.url === 'string' && data.url.startsWith('data:')) {
      throw new Error('Server returned inline base64 image. Configure Cloudinary for uploads in production.');
    }
    return { ...data, absoluteUrl: data.url };
  },

  getAds: () => apiFetch<Advertisement[]>('/ads'),
  createAd: (data: Partial<Advertisement>) =>
    apiFetch<Advertisement>('/ads', { method: 'POST', body: JSON.stringify(data) }),
  updateAd: (id: string, data: Partial<Advertisement>) =>
    apiFetch<Advertisement>(`/ads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAd: (id: string) =>
    apiFetch(`/ads/${id}`, { method: 'DELETE' }),
};
