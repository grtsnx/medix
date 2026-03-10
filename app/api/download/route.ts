/**
 * /api/download
 *
 * Streams the download from yt-dlp (must be installed on the server).
 * Usage: yt-dlp must be on PATH (e.g. install via: pip install yt-dlp, or brew install yt-dlp).
 *
 * For serverless (Vercel etc.) yt-dlp is not available – use an external download API or run this on a VPS.
 */

import { NextRequest, NextResponse } from "next/server"
import { spawn } from "node:child_process"
import { Readable } from "node:stream"

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

    // yt-dlp format: use "best" for best single file (works for Shorts, regular videos, etc.)
    // Our mock formatIds (f137+f140 etc.) are not real yt-dlp codes; "best" gives a working file
    const format = "best"
    const safeFilename = sanitizeFilename(requestedFilename ?? "video") + ".mp4"

    console.log("[download] starting yt-dlp", { url: url.slice(0, 80), format })

    const proc = spawn(
      "yt-dlp",
      [
        "-f",
        format,
        "-o",
        "-", // stdout
        "--no-part",
        "--no-warnings",
        "--no-colors",
        "--newline",
        url,
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
      }
    )

    const { stdout, stderr } = proc

    stderr?.on("data", (chunk: Buffer) => {
      // Progress and logs go to stderr; log only in dev to avoid flooding
      if (process.env.NODE_ENV === "development") {
        process.stderr.write(chunk)
      }
    })

    proc.on("error", (err) => {
      console.error("[download] yt-dlp spawn error", err)
    })

    // Node Readable (stdout) -> Web ReadableStream for Response
    const webStream = stdout
      ? Readable.toWeb(stdout as Readable)
      : new ReadableStream()

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
