/**
 * /api/download
 *
 * Real implementation: stream the download from yt-dlp via an HTTP wrapper
 * service or a self-hosted yt-dlp API, then pipe the response stream back to
 * the client so the browser can save the file.
 *
 * Currently returns a 200 with an empty body (demo mode).
 */

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, formatId } = body as { url: string; formatId: string }

    if (!url || !formatId) {
      return NextResponse.json({ error: "Missing url or formatId" }, { status: 400 })
    }

    // TODO: Stream real download here.
    // Example with yt-dlp HTTP API wrapper:
    //   const upstream = await fetch(`${YT_DLP_API}/download`, {
    //     method: "POST",
    //     body: JSON.stringify({ url, format: formatId }),
    //   })
    //   return new Response(upstream.body, {
    //     headers: {
    //       "Content-Type": "video/mp4",
    //       "Content-Disposition": `attachment; filename="video.mp4"`,
    //     },
    //   })

    return NextResponse.json({ message: "Demo mode — no actual download in mock." })
  } catch (err) {
    console.error("[download]", err)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
