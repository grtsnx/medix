/**
 * /api/download
 *
 * Two modes:
 * 1. Vercel (serverless): Set YT_DLP_API to your download worker URL. This route proxies
 *    the request to the worker and streams the response back.
 * 2. Local / VPS: If YT_DLP_API is not set, runs yt-dlp as a subprocess (requires yt-dlp on PATH).
 *
 * For Vercel: deploy a small download worker (see download-worker/) to Railway, Fly.io, or a VPS,
 * then set YT_DLP_API=https://your-worker.railway.app (no trailing slash).
 */

import { NextRequest, NextResponse } from "next/server"
import { spawn } from "node:child_process"
import { Readable } from "node:stream"

const YT_DLP_API = process.env.YT_DLP_API?.replace(/\/$/, "") // base URL, no trailing slash

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, formatId, filename: requestedFilename } = body as {
      url: string
      formatId: string
      filename?: string
    }

    if (!url) {
      console.error("[download] validation failed: missing url")
      return NextResponse.json({ error: "Missing url" }, { status: 400 })
    }

    const base = sanitizeFilename(requestedFilename ?? "video")
    const safeFilename = /\.(mp4|webm|mkv|mp3|m4a)$/i.test(base) ? base : base + ".mp4"

    // ─── Vercel / serverless: proxy to external download worker ───
    if (YT_DLP_API) {
      console.log("[download] proxying to YT_DLP_API", { url: url.slice(0, 60) })
      const workerRes = await fetch(`${YT_DLP_API}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, filename: safeFilename }),
      })

      if (!workerRes.ok) {
        const err = await workerRes.json().catch(() => ({}))
        console.error("[download] worker error", workerRes.status, err)
        return NextResponse.json(
          { error: err.error || "Download service failed" },
          { status: workerRes.status }
        )
      }

      const contentType = workerRes.headers.get("Content-Type") || "video/mp4"
      const contentDisposition = workerRes.headers.get("Content-Disposition") || `attachment; filename="${safeFilename}"`

      return new Response(workerRes.body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": contentDisposition,
        },
      })
    }

    // ─── Local / VPS: run yt-dlp directly ───
    const format = "best"
    console.log("[download] local yt-dlp", { url: url.slice(0, 80), format })

    const proc = spawn(
      "yt-dlp",
      [
        "-f",
        format,
        "-o",
        "-",
        "--no-part",
        "--no-warnings",
        "--no-colors",
        url,
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    )

    const { stdout, stderr } = proc

    stderr?.on("data", (chunk: Buffer) => {
      if (process.env.NODE_ENV === "development") process.stderr.write(chunk)
    })

    proc.on("error", (err: NodeJS.ErrnoException) => {
      console.error("[download] yt-dlp spawn error", err)
      if (err.code === "ENOENT") {
        console.error("[download] yt-dlp not found. Install it (e.g. brew install yt-dlp) or set YT_DLP_API for Vercel.")
      }
    })

    const webStream = stdout ? Readable.toWeb(stdout as Readable) : new ReadableStream()

    return new Response(webStream as ReadableStream<Uint8Array>, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      },
    })
  } catch (err) {
    console.error("[download] error", err)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .slice(0, 200)
    .trim() || "video"
}
