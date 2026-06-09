# 🚀 Deployment Guide — MockMind

## Overview

| Service | Purpose | Cost |
|---------|---------|------|
| GitHub | Code hosting | Free |
| Render | Backend (Node.js) | Free tier |
| Vercel | Frontend (React) | Free tier |
| MongoDB Atlas | Database | Free tier |

---

## Step 1 — Update API URL in frontend

Open `client/src/services/api.js` and make sure it reads from env:

```js
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});
```

---

## Step 2 — Update CORS in backend

Open `server/src/index.js` and update CORS to allow your Vercel domain:

```js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mockmind.vercel.app',        // your Vercel URL
    'https://mockmind-*.vercel.app',      // preview deployments
  ],
  credentials: true,
}));
```

---

## Step 3 — Push to GitHub

```bash
# Navigate to your project root (where .gitignore is)
cd MockMind

# Initialize git if not done
git init

# Stage all files (.env is ignored automatically by .gitignore)
git add .

# Verify .env is NOT in the list — run this and check
git status
# You should NOT see any .env files listed

# Commit
git commit -m "feat: initial MockMind release"

# Connect to your GitHub repo
git remote add origin https://github.com/Baala-Murugan-K/MockMind.git

# Push
git branch -M main
git push -u origin main
```

---

## Step 4 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your **MockMind** GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| Name | mockmind-backend |
| Root Directory | `server` |
| Environment | Node |
| Build Command | `npm install` |
| Start Command | `node src/index.js` |

5. Scroll down to **Environment Variables** → Add these one by one:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | your MongoDB Atlas connection string |
| `JWT_SECRET` | any random 32+ char string |
| `OPENROUTER_API_KEY` | your OpenRouter key |
| `MURF_API_KEY` | your Murf key |
| `PORT` | `10000` |

6. Click **Create Web Service**
7. Wait ~3 minutes for build
8. Copy your URL: `https://mockmind-backend-xxxx.onrender.com`

---

## Step 5 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New** → **Project**
3. Import your **MockMind** repo
4. Configure:

| Setting | Value |
|---------|-------|
| Root Directory | `client` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. Under **Environment Variables** → Add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://mockmind-backend-xxxx.onrender.com/api` |

6. Click **Deploy**
7. Your app is live at `https://mockmind.vercel.app` 🎉

---

## Step 6 — Update CORS with real Vercel URL

Once you have your Vercel URL, go back to `server/src/index.js`, update the CORS origin with the real URL, push to GitHub — Render will auto-redeploy.

---

## ⚠️ Important Notes

**Render free tier sleeps after 15 min inactivity** — first request after sleep takes ~30 seconds. To fix:
- Upgrade to Render's $7/month Starter plan, OR
- Use [UptimeRobot](https://uptimerobot.com) (free) to ping your backend every 14 minutes

**Never commit .env** — the `.gitignore` already blocks it. Always use the Render/Vercel environment variables dashboard instead.

**MongoDB Atlas** — make sure Network Access allows `0.0.0.0/0` (all IPs) so Render can connect.

---

## Local Development vs Production

| | Local | Production |
|-|-------|-----------|
| Frontend URL | `http://localhost:5173` | `https://mockmind.vercel.app` |
| Backend URL | `http://localhost:5000` | `https://mockmind-backend.onrender.com` |
| API base | `/api` (Vite proxy) | `VITE_API_URL` env var |
| .env location | `server/.env` (local only) | Render dashboard |
