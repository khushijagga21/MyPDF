# MyPDF

Premium PDF tools online — merge, split, compress, and convert PDFs.

## Local development

```bash
npm install
cp .env.example .env   # set DATABASE_URL and AUTH_SECRET
npx prisma db push
npm run dev
```

## Free deploy (recommended): Vercel + Neon — $0/month

You already use this stack. Both have **free tiers** that stay free for personal/small projects.

| Service | Free tier | Role |
|---------|-----------|------|
| [Vercel](https://vercel.com) | Hobby plan | Hosts the website |
| [Neon](https://neon.tech) | Free PostgreSQL | Database + file storage |

### Step 1 — Push latest code

```bash
git add .
git commit -m "Free production deploy: reliable uploads"
git push
```

### Step 2 — Vercel (if not connected)

1. [vercel.com](https://vercel.com) → sign in with GitHub  
2. **Add New** → **Project** → import **MyPDF**  
3. Deploy (uses `vercel.json` automatically)

### Step 3 — Environment variables on Vercel

**Settings** → **Environment Variables**:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon **pooled** URL (`-pooler` in hostname) |
| `AUTH_SECRET` | Random 32+ character string |
| `AUTH_URL` | `https://my-pdf-hazel.vercel.app` (your Vercel URL) |
| `SITE_URL` | Same as `AUTH_URL` |

Redeploy after saving variables.

### Step 4 — Neon database

1. [neon.tech](https://neon.tech) → your project  
2. Copy **pooled** connection string  
3. Paste into Vercel `DATABASE_URL`  

Schema updates run automatically on each deploy (`prisma db push` in build).

### Your live URLs (iLovePDF-style)

- `https://your-site.vercel.app/merge`  
- `https://your-site.vercel.app/split`  
- `https://your-site.vercel.app/pdf-to-word`  

### Free tier limits

- **File size:** up to ~4.5 MB per upload on Vercel free  
- **Traffic:** generous for hundreds of users  
- **Cost:** $0  

---

## Free alternative: Render + Neon

Render free web tier **sleeps** after 15 min with no visitors (first visit may take ~30s to wake up).

1. [render.com](https://render.com) → sign in with GitHub  
2. **New** → **Blueprint** → connect repo (uses `render.yaml`)  
3. Set `DATABASE_URL` (Neon), `AUTH_SECRET`, `AUTH_URL`, `SITE_URL`  
4. **Free** — $0/month  

---

## Paid / more stable: Railway


Railway runs your app as a **persistent server** (not serverless), so uploads and PDF tools work reliably for many users.

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. **New Project** → **Deploy from GitHub** → select **MyPDF**.
3. Add **PostgreSQL** plugin (click **+ New** → **Database** → **PostgreSQL**).
4. Click your **web service** → **Variables** and add:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Reference from PostgreSQL plugin (pooled URL) |
| `AUTH_SECRET` | Random string (32+ chars) |
| `AUTH_URL` | Your Railway URL, e.g. `https://mypdf-production.up.railway.app` |
| `SITE_URL` | Same as `AUTH_URL` |
| `NODE_ENV` | `production` |

5. Deploy. Railway uses the `Dockerfile` automatically.
6. Open **Settings** → **Networking** → **Generate domain** — your app is live.

### Custom domain (like ilovepdf.com)

1. Railway → **Settings** → **Networking** → **Custom Domain**
2. Add your domain (e.g. `mypdf.com`)
3. Update DNS at your registrar (Railway shows the records)
4. Set `SITE_URL` and `AUTH_URL` to `https://mypdf.com`

### Short tool URLs (iLovePDF-style)

Users can open tools directly:

- `yoursite.com/merge` → Merge PDF
- `yoursite.com/split` → Split PDF
- `yoursite.com/compress` → Compress PDF
- `yoursite.com/pdf-to-word` → PDF to Word

Full list is in `src/lib/data/tool-redirects.ts`.

## Why Railway instead of Vercel?

| | Vercel | Railway |
|---|--------|---------|
| File uploads | Limited (serverless disk) | Reliable (database storage) |
| Always running | Cold starts | Always on |
| Large files | 4.5 MB on free tier | Up to 50 MB |
| Redeploy | Every git push | Only when you change code |

After the first deploy, the site stays online until you push new code.

## Health check

`GET /api/health` — used by Railway to keep the app healthy.
