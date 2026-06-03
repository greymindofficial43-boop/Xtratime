# Sportskeeda Clone

A Sportskeeda-style sports news platform built with **Next.js**, **NestJS**, and **PostgreSQL**, including an admin panel for content management.

## Stack

| Layer | Tech |
|-------|------|
| Public site | Next.js 15 (port 3000) |
| Admin panel | Next.js 15 (port 3001) |
| API | NestJS 11 (port 4000) |
| Database | PostgreSQL 16 + Prisma |

## Features

### Public website
- Dark Sportskeeda-inspired UI with category navigation
- Homepage: featured hero, category grid, latest news, trending sidebar
- Category pages, article detail pages, search
- SEO-friendly metadata

### Admin panel
- JWT authentication
- Dashboard with content stats
- CRUD for articles (draft / published / archived, featured & trending flags)
- Manage categories and tags
- HTML content editor

## Quick start

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL)

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
npm run db:up
```

### 3. Run migrations & seed

```bash
cd apps/api
npx prisma migrate dev --name init
npm run prisma:seed
cd ../..
```

### 4. Start all apps

```bash
npm run dev
```

| App | URL |
|-----|-----|
| Public site | http://localhost:3000 |
| Admin panel | http://localhost:3001 |
| API | http://localhost:4000/api |

### Default admin login

- **Email:** `admin@sportskeeda.local`
- **Password:** `admin123`

## Project structure

```
sports/
├── apps/
│   ├── api/       # NestJS + Prisma API
│   ├── web/       # Public Next.js site
│   └── admin/     # Admin Next.js panel
├── docker-compose.yml
└── package.json   # npm workspaces
```

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Admin login |
| GET | `/api/categories` | No | List categories |
| GET | `/api/articles` | No | List published articles |
| GET | `/api/articles/:slug` | No | Article by slug |
| POST | `/api/articles` | Yes | Create article |
| PATCH | `/api/articles/:id` | Yes | Update article |
| GET | `/api/articles/admin/all` | Yes | All articles (admin) |

## Environment variables

Copy `apps/api/.env.example` to `apps/api/.env` and adjust if needed.

```env
DATABASE_URL="postgresql://sports:sports123@localhost:5432/sportskeeda?schema=public"
JWT_SECRET="your-secret"
PORT=4000
```

## Deploy to production

See **[DEPLOY.md](./DEPLOY.md)** for full steps:

- **Vercel** — `apps/web` and `apps/admin` (two projects)
- **Render** — `apps/api` (via `render.yaml`)
- **Neon** — PostgreSQL

Quick env vars for Vercel (web):

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api
NEXT_PUBLIC_ADMIN_URL=https://your-admin.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
```

## Production notes

- Change `JWT_SECRET` and admin password
- Use a proper image CDN / upload service for featured images
- Add rich text editor (TipTap, Editor.js) in admin
- Configure `CORS_ORIGINS` on the API for your Vercel domains
