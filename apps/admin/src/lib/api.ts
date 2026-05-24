const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sortOrder: number;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
  isTrending: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  tags: Tag[];
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
  deleteCategory: (id: string) =>
    apiFetch(`/categories/${id}`, { method: 'DELETE' }),

  getTags: () => apiFetch<Tag[]>('/tags'),
  createTag: (name: string) =>
    apiFetch<Tag>('/tags', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteTag: (id: string) => apiFetch(`/tags/${id}`, { method: 'DELETE' }),

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
};
