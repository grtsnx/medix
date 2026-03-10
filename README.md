# Next.js template

This is a Next.js template with shadcn/ui.

## Deploying to Vercel (with downloads)

The app uses **yt-dlp** for video downloads. Vercel serverless functions cannot run yt-dlp, so you need a small **download worker** running elsewhere:

1. Deploy the worker: see **[download-worker/README.md](download-worker/README.md)** for Railway, Fly.io, or Docker.
2. In Vercel → Project Settings → Environment Variables, add:
   - `YT_DLP_API` = your worker URL (e.g. `https://your-app.up.railway.app`, no trailing slash)

With `YT_DLP_API` set, the `/api/download` route proxies requests to the worker and streams the file back. Without it, the route runs yt-dlp locally (for dev or a VPS).

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
