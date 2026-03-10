/**
 * Download worker: runs yt-dlp and streams the result.
 * Deploy to Railway, Fly.io, or any VPS with Node + yt-dlp.
 *
 * Set YT_DLP_API to this service's URL in your Vercel project env.
 */

import express from "express"
import { spawn } from "node:child_process"

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3333

function sanitize(filename) {
  return (filename || "video")
    .replace(/[<>:"/\\|?*]/g, "_")
    .slice(0, 200)
    .trim() || "video"
}

function formatDuration(seconds) {
  if (seconds == null || !Number.isFinite(seconds)) return "—"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

function formatCount(n) {
  if (n == null || !Number.isFinite(n)) return "—"
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B"
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
  return String(n)
}

const FULL_FORMATS = [
  { id: "f137+f140", label: "4K Ultra HD", quality: "4K", size: "1.2 GB", ext: "mp4", fps: 60, hasVideo: true, hasAudio: true },
  { id: "f137+f141", label: "Full HD", quality: "1080p", size: "480 MB", ext: "mp4", fps: 60, hasVideo: true, hasAudio: true },
  { id: "f136+f140", label: "HD", quality: "720p", size: "180 MB", ext: "mp4", fps: 30, hasVideo: true, hasAudio: true },
  { id: "f135+f140", label: "SD", quality: "480p", size: "80 MB", ext: "mp4", fps: 30, hasVideo: true, hasAudio: true },
  { id: "f134+f140", label: "Low", quality: "360p", size: "45 MB", ext: "mp4", fps: 30, hasVideo: true, hasAudio: true },
  { id: "f140", label: "Audio Only", quality: "audio", size: "12 MB", ext: "mp3", hasVideo: false, hasAudio: true },
]
const SHORT_FORMATS = [
  { id: "f137+f140", label: "Full HD", quality: "1080p", size: "90 MB", ext: "mp4", fps: 60, hasVideo: true, hasAudio: true },
  { id: "f136+f140", label: "HD", quality: "720p", size: "40 MB", ext: "mp4", fps: 30, hasVideo: true, hasAudio: true },
  { id: "f140", label: "Audio Only", quality: "audio", size: "4 MB", ext: "mp3", hasVideo: false, hasAudio: true },
]

function runYtDlpJson(url) {
  return new Promise((resolve) => {
    const proc = spawn("yt-dlp", ["-j", "--no-download", "--no-warnings", url], { stdio: ["ignore", "pipe", "pipe"] })
    let out = ""
    proc.stdout?.on("data", (chunk) => { out += chunk.toString() })
    proc.stderr?.on("data", () => {})
    proc.on("error", () => resolve(null))
    proc.on("close", (code) => {
      if (code !== 0) {
        resolve(null)
        return
      }
      try {
        const firstLine = out.trim().split("\n")[0]
        resolve(firstLine ? JSON.parse(firstLine) : null)
      } catch {
        resolve(null)
      }
    })
  })
}

function mapToVideoInfo(raw, platform, resolvedUrl) {
  const isYT = platform === "youtube" || platform === "youtube-playlist"
  const formats = isYT ? FULL_FORMATS : SHORT_FORMATS
  let thumbnail = raw.thumbnail ?? ""
  const isPlaylist = raw._type === "playlist" || Array.isArray(raw.entries)
  const entry = isPlaylist && raw.entries?.length ? raw.entries[0] : raw
  return {
    title: String(entry?.title ?? raw.title ?? "Video").trim() || "Video",
    author: String(entry?.uploader ?? entry?.channel ?? raw.uploader ?? raw.channel ?? "—").trim() || "—",
    duration: formatDuration(entry?.duration ?? raw.duration),
    thumbnail: thumbnail || "https://placehold.co/1280x720/0f0f0f/BEFF3E?text=Video&font=montserrat",
    views: formatCount(entry?.view_count ?? raw.view_count),
    likes: formatCount(entry?.like_count ?? raw.like_count),
    platform,
    formats,
    ...(isPlaylist && raw.entries?.length ? { isPlaylist: true, playlistCount: raw.entries.length, playlistTitle: raw.title } : {}),
  }
}

app.post("/video-info", async (req, res) => {
  const { url, platform } = req.body || {}
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url" })
  }
  const plat = platform || "youtube"
  console.log("[worker] video-info", url.slice(0, 60))
  const raw = await runYtDlpJson(url)
  if (!raw?.title) {
    return res.status(502).json({ error: "Could not fetch video info" })
  }
  const video = mapToVideoInfo(raw, plat, url)
  res.json({ video, playlist: undefined, resolvedUrl: url })
})

app.post("/download", (req, res) => {
  const { url, filename: requestedFilename } = req.body || {}
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url" })
  }

  const filename = sanitize(requestedFilename)
  const safeFilename = /\.(mp4|webm|mkv|mp3|m4a)$/i.test(filename) ? filename : filename + ".mp4"

  console.log("[worker] download", url.slice(0, 60))

  const proc = spawn(
    "yt-dlp",
    ["-f", "best", "-o", "-", "--no-part", "--no-warnings", "--no-colors", url],
    { stdio: ["ignore", "pipe", "pipe"] }
  )

  proc.stderr.on("data", (chunk) => process.stderr.write(chunk))

  proc.on("error", (err) => {
    console.error("[worker] yt-dlp error", err)
    if (!res.headersSent) res.status(503).json({ error: "yt-dlp not available" })
  })

  proc.on("close", (code) => {
    if (code !== 0 && !res.headersSent) {
      res.status(502).json({ error: "Download failed", code })
    }
  })

  res.setHeader("Content-Type", "video/mp4")
  res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`)
  proc.stdout.pipe(res)
})

app.get("/health", (_, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`[worker] listening on port ${PORT}`)
})
