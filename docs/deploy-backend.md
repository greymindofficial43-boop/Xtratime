# Backend deployment — two language editions

The web + admin frontends run on Vercel (4 projects). The backend runs on the
**VPS** as **two independent API editions**, each with its own database:

```
VPS
├── Postgres (one container, :5432)
│     ├── db: sportskeeda      → Bangla content
│     └── db: sportskeeda_en   → English content
├── api-bn  :4000  → api-bn.yourdomain.com   (Bangla web + admin)
└── api-en  :4001  → api-en.yourdomain.com   (English web + admin)
```

Each edition is fully isolated: no shared content, no code differences — only
its env file (`apps/api/.env.bn` / `.env.en`) differs.

---

## One-time setup

### 1. Clone + install
```bash
git clone <repo> ~/sports && cd ~/sports
npm install
```

### 2. Start Postgres and create the second database
```bash
npm run db:up                                   # existing Postgres container
docker exec -it sportskeeda-db psql -U sports -c "CREATE DATABASE sportskeeda_en;"
```

### 3. Create the two env files (NEVER commit these)
```bash
cp apps/api/.env.bn.example apps/api/.env.bn
cp apps/api/.env.en.example apps/api/.env.en
# edit each: DATABASE_URL, JWT_SECRET, CORS_ORIGINS (the Vercel domains), keys
```
`.env.bn` / `.env.en` are gitignored so they are never dual-pushed to the public repo.

### 4. Install PM2
```bash
npm install -g pm2
```

### 5. Reverse proxy (Nginx) + SSL
Add DNS A records `api-bn` and `api-en` → VPS IP, then:

`/etc/nginx/sites-available/api-bn` (and an `api-en` copy with `:4001`):
```nginx
server {
  server_name api-bn.yourdomain.com;
  location / {
    proxy_pass http://localhost:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
```bash
ln -s /etc/nginx/sites-available/api-bn /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/api-en /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d api-bn.yourdomain.com -d api-en.yourdomain.com
```

### 6. First deploy + survive reboots
```bash
bash scripts/deploy-api.sh
pm2 startup        # run the command it prints
pm2 save
```

---

## Every deploy after that
```bash
bash scripts/deploy-api.sh
```
This pulls, installs, builds, runs migrations on **both** databases, and
reloads both PM2 processes (`--update-env` re-reads the env files).

---

## Wire up Vercel
Set per project, then redeploy each (env changes need a rebuild):

| Project        | `NEXT_PUBLIC_API_URL`              |
|----------------|------------------------------------|
| Bangla web     | `https://api-bn.yourdomain.com`    |
| Bangla admin   | `https://api-bn.yourdomain.com`    |
| English web    | `https://api-en.yourdomain.com`    |
| English admin  | `https://api-en.yourdomain.com`    |

Each API's `CORS_ORIGINS` must list its own two Vercel domains.

---

## Smoke test
- `https://api-bn.yourdomain.com` and `api-en` both answer over HTTPS.
- An article saved in the Bangla admin appears only on the Bangla web site.
- Bangla web: `<html lang="bn">` + Bangla logo. English: `lang="en"` + English logo.
