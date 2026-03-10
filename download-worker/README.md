# Medixoad Download Worker

Small HTTP service that runs **yt-dlp** and streams the video back. Use it when your main app is on **Vercel** (where yt-dlp cannot run).

## How it works

1. Your Next.js app on Vercel has `YT_DLP_API=https://this-worker.up.railway.app` (or your URL).
2. When a user clicks download, the Vercel API route proxies the request to this worker.
3. This worker runs `yt-dlp` and streams stdout to the client.

## Deploy to Railway

1. Install [Railway CLI](https://docs.railway.app/develop/cli) or use the [Railway dashboard](https://railway.app).
2. From this folder:
   ```bash
   cd download-worker
   railway init
   railway up
   ```
3. Railway will build the Dockerfile (installs Node + yt-dlp). Copy the public URL (e.g. `https://medixoad-download-worker-production.up.railway.app`).
4. In your Vercel project → Settings → Environment Variables, add:
   - **Name:** `YT_DLP_API`
   - **Value:** `https://your-app.up.railway.app` (no trailing slash)

## Deploy to Fly.io

1. Install [flyctl](https://fly.io/docs/hands-on/install-flyctl/).
2. From this folder:
   ```bash
   cd download-worker
   fly launch
   ```
   Use a unique app name. When asked for a Dockerfile, point to `./Dockerfile`.
3. Deploy:
   ```bash
   fly deploy
   ```
4. Get the URL: `fly info`. Add `YT_DLP_API=https://your-app.fly.dev` in Vercel.

## Deploy to a VPS (Docker)

```bash
cd download-worker
docker build -t medixoad-worker .
docker run -d -p 3333:3333 --name medixoad-worker medixoad-worker
```

Then put this behind nginx/caddy with HTTPS and set `YT_DLP_API=https://your-domain.com` in Vercel.

## Local test

```bash
cd download-worker
npm install
# Ensure yt-dlp is on PATH (brew install yt-dlp)
node server.js
```

Then:

```bash
curl -X POST http://localhost:3333/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/shorts/eej74COgcOw","filename":"short.mp4"}' \
  -o short.mp4
```

## Vercel function timeout

Vercel serverless functions have a **max duration** (e.g. 60s on Pro). For long videos the stream may be cut off. Options:

- Prefer shorter videos / Shorts.
- Upgrade to a longer timeout if your plan allows.
- Have the front-end open the worker URL directly in a new tab for very long downloads (you’d add a "Download via worker" link that uses the worker URL + token if you add auth later).
