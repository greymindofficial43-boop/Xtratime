# Deploy to Vercel

The **public site** and **admin panel** run on Vercel. The **NestJS API** and **PostgreSQL** must be hosted separately (Render + Neon are free options).

## Architecture

| Service | Host | Notes |
|---------|------|--------|
| `apps/web` | Vercel | Public Sportskeeda site |
| `apps/admin` | Vercel | Admin CMS (second Vercel project) |
| `apps/api` | [Render](https://render.com) | Use included `render.yaml` |
| PostgreSQL | [Neon](https://neon.tech) | Free serverless Postgres |

---

## 1. Database (Neon)

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **connection string** (pooled URL recommended).
3. You will use it as `DATABASE_URL` on Render.

---

## 2. API (Render)

1. Push this repo to GitHub.
2. On [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect the repo; Render reads `render.yaml` at the repo root.
4. Set environment variables when prompted:
   - `DATABASE_URL` — Neon connection string
   - `CORS_ORIGINS` — your Vercel URLs (comma-separated), e.g.  
     `https://your-site.vercel.app,https://your-admin.vercel.app`
5. After deploy, note the API URL, e.g. `https://sportskeeda-api.onrender.com`.
6. API base for frontends: `https://sportskeeda-api.onrender.com/api`

Optional: run seed once from your machine:

```bash
cd apps/api
DATABASE_URL="your-neon-url" npx prisma db seed
```

---

## 3. Public site (Vercel)

### Option A — Vercel Dashboard

1. [vercel.com/new](https://vercel.com/new) → Import your GitHub repo.
2. **Root Directory:** `apps/web`
3. Framework is auto-detected (Next.js).
4. **Environment variables:**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API.onrender.com/api` |
| `NEXT_PUBLIC_ADMIN_URL` | `https://YOUR-ADMIN.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-SITE.vercel.app` |

5. Deploy.

### Option B — Vercel CLI

```bash
npm i -g vercel
cd apps/web
vercel
# follow prompts; set root to apps/web when asked
vercel env add NEXT_PUBLIC_API_URL
vercel --prod
```

---

## 4. Admin panel (Vercel)

Create a **second** Vercel project from the same repo:

1. **Root Directory:** `apps/admin`
2. **Environment variables:**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API.onrender.com/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-SITE.vercel.app` |

3. Deploy, then update `CORS_ORIGINS` on Render to include the admin URL.
4. Update `NEXT_PUBLIC_ADMIN_URL` on the **web** project to this admin URL.

---

## 5. Post-deploy checklist

- [ ] Render API health: open `https://YOUR-API.onrender.com/api/categories`
- [ ] Web site loads articles (not empty / no fetch errors)
- [ ] Admin login works (`admin@sportskeeda.local` / `admin123` — **change in production**)
- [ ] `CORS_ORIGINS` on Render lists both Vercel domains exactly (no trailing slashes)
- [ ] Redeploy web/admin after changing env vars

---

## Monorepo build notes

Each app has a `vercel.json` that runs install/build from the repo root:

```json
"installCommand": "cd ../.. && npm install",
"buildCommand": "cd ../.. && npm run build -w @sports/web"
```

Enable **“Include source files outside of the Root Directory”** in Vercel project settings if builds fail to resolve workspaces.

---

## Custom domains

In each Vercel project → **Settings** → **Domains**, add your domain. Update `CORS_ORIGINS` and all `NEXT_PUBLIC_*` URLs accordingly.
