# Deploy MyPDF to Firebase

MyPDF is a **full Next.js app** (API routes, login, PDF processing, database).  
Use **Firebase App Hosting** — not static Hosting alone.

| Plan | Cost | Notes |
|------|------|--------|
| Firebase **Spark** (free) | $0 | Static sites only — **will not run this app** |
| Firebase **Blaze** (pay-as-you-go) | ~$0 for small traffic | Required for App Hosting / SSR |

You can still use **Neon PostgreSQL** (free) for the database.

---

## Option A — Firebase App Hosting (recommended)

Best for Next.js + API routes. Deploys from GitHub automatically.

### 1. Create a Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/)
2. **Add project** → name it (e.g. `mypdf-app`)
3. Upgrade to **Blaze** plan (Billing → upgrade). You only pay if usage exceeds free quotas.

### 2. Enable App Hosting

1. In Firebase Console → **Build** → **App Hosting**
2. Click **Get started** / **Create backend**
3. Connect **GitHub** → select repo `khushijagga21/MyPDF`
4. Branch: `main`
5. **Root directory:** `/` (repo root)
6. **Build command:** `npm ci && npm run build:firebase`
7. Firebase auto-detects **Next.js**

### 3. Add environment secrets

In App Hosting → your backend → **Environment** → **Secrets**, add:

| Secret name | Value |
|-------------|--------|
| `DATABASE_URL` | Your Neon **pooled** PostgreSQL URL |
| `AUTH_SECRET` | Same random string as Vercel (32+ chars) |
| `AUTH_URL` | Your Firebase app URL (e.g. `https://mypdf-app--xxxxx.us-central1.hosted.app`) |
| `SITE_URL` | Same as `AUTH_URL` |

After the first deploy you get the live URL — update `AUTH_URL` and `SITE_URL`, then redeploy.

### 4. Database schema (one time)

From your PC (with `DATABASE_URL` in `.env`):

```bash
npx prisma db push
```

Or run it once in Neon SQL console if you prefer.

### 5. Deploy

Push to `main` on GitHub — App Hosting rebuilds automatically.

Or trigger **Rollout** manually in the Firebase Console.

---

## Option B — Firebase CLI (Hosting + frameworks backend)

```bash
npm install
copy .firebaserc.example .firebaserc
# Edit .firebaserc — set your Firebase project ID

npx firebase login
npx firebase experiments:enable webframeworks
npx firebase deploy --only hosting
```

Set env vars in Google Cloud Console for the Cloud Function / Cloud Run backend created by Firebase.

---

## After deploy — test

1. Open your Firebase URL
2. **Register** / **Login**
3. Try **Merge PDF** and **PDF → Word**
4. Check **Profile** for uploaded + processed files

---

## Custom domain

Firebase Console → App Hosting → your backend → **Custom domains** → add your domain and follow DNS steps.

---

## Keep Vercel too?

Yes. You can run the same repo on Vercel and Firebase. Use the same Neon `DATABASE_URL` and `AUTH_SECRET`, but set `AUTH_URL` / `SITE_URL` to each platform’s URL.
