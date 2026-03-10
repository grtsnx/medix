/**
 * /api/video-info
 *
 * Resolves short URLs, then fetches real metadata via yt-dlp when available.
 * Falls back to mock data if yt-dlp is not installed or the request fails.
 *
 * On Vercel: set YT_DLP_API to your download worker URL; the worker's /video-info is used for real metadata.
 */

import { NextRequest, NextResponse } from "next/server"
import { spawn } from "node:child_process"
import type { VideoInfo, PlaylistItem } from "@/hooks/use-downloader"

const YT_DLP_API = process.env.YT_DLP_API?.replace(/\/$/, "")

// ─── URL resolution ────────────────────────────────────────────────────────────

const SHORT_HOSTS = new Set([
  "youtu.be",
  "vm.tiktok.com",
  "vt.tiktok.com",
  "fb.watch",
  "t.co",
  "instagr.am",
])

/**
 * Follow redirects server-side to get the canonical URL.
 * Returns the original URL if resolution fails or isn't needed.
 */
async function resolveUrl(url: string): Promise<string> {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "")
    if (!SHORT_HOSTS.has(host)) {
      console.log("[video-info] resolveUrl: not a short host, using as-is", { host, url })
      return url
    }
    console.log("[video-info] resolveUrl: following redirects", { host, url })
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    })
    const final = res.url || url
    if (final !== url) console.log("[video-info] resolveUrl: resolved", { from: url, to: final })
    return final
  } catch (err) {
    console.error("[video-info] resolveUrl failed, using original URL", { url, err })
    return url
  }
}

// ─── YouTube video ID extraction ───────────────────────────────────────────────

function extractYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase().replace(/^www\./, "")

    // youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0].split("?")[0]
      return id || null
    }

    // youtube.com/shorts/VIDEO_ID or m.youtube.com/shorts/VIDEO_ID
    if (host === "youtube.com" || host === "m.youtube.com") {
      const shortsMatch = u.pathname.match(/^\/shorts\/([^/?]+)/)
      if (shortsMatch) return shortsMatch[1]
      return u.searchParams.get("v") || null
    }
  } catch {
    // ignore
  }
  return null
}

// ─── Real metadata via yt-dlp ──────────────────────────────────────────────────

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return "—"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

function formatCount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—"
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
  return String(n)
}

type YtDlpJson = {
  title?: string
  uploader?: string
  channel?: string
  duration?: number | null
  view_count?: number | null
  like_count?: number | null
  thumbnail?: string
  _type?: string
  entries?: YtDlpJson[]
}

function runYtDlpJson(url: string): Promise<YtDlpJson | null> {
  return new Promise((resolve) => {
    const proc = spawn("yt-dlp", ["-j", "--no-download", "--no-warnings", "--no-playlist", url], {
      stdio: ["ignore", "pipe", "pipe"],
    })
    let out = ""
    proc.stdout?.on("data", (chunk: Buffer) => { out += chunk.toString() })
    proc.stderr?.on("data", () => {})
    proc.on("error", (err) => {
      if (process.env.NODE_ENV === "development") console.warn("[video-info] yt-dlp spawn error", err.message)
      resolve(null)
    })
    proc.on("close", (code, signal) => {
      if (code !== 0 && process.env.NODE_ENV === "development") {
        console.warn("[video-info] yt-dlp exit", { code, signal })
      }
      try {
        const firstLine = out.trim().split("\n")[0]
        resolve(firstLine ? (JSON.parse(firstLine) as YtDlpJson) : null)
      } catch {
        resolve(null)
      }
    })
  })
}

function mapYtDlpToVideoInfo(raw: YtDlpJson, platform: string, resolvedUrl: string): VideoInfo {
  const isYT = platform === "youtube" || platform === "youtube-playlist"
  const formats = isYT ? FULL_FORMATS : SHORT_FORMATS

  let thumbnail = raw.thumbnail ?? ""
  if (isYT && !thumbnail) {
    const videoId = extractYouTubeVideoId(resolvedUrl)
    thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ""
  }

  const isPlaylist = raw._type === "playlist" || Array.isArray(raw.entries)
  const entry = isPlaylist && raw.entries?.length ? raw.entries[0] : raw

  return {
    title: (entry?.title ?? raw.title ?? "Video").toString().trim() || "Video",
    author: (entry?.uploader ?? entry?.channel ?? raw.uploader ?? raw.channel ?? "—").toString().trim() || "—",
    duration: formatDuration(entry?.duration ?? raw.duration),
    thumbnail: thumbnail || "https://placehold.co/1280x720/0f0f0f/BEFF3E?text=Video&font=montserrat",
    views: formatCount(entry?.view_count ?? raw.view_count),
    likes: formatCount(entry?.like_count ?? raw.like_count),
    platform: platform as VideoInfo["platform"],
    formats,
    ...(isPlaylist && raw.entries?.length
      ? { isPlaylist: true, playlistCount: raw.entries.length, playlistTitle: raw.title }
      : {}),
  }
}

// ─── Mock helpers ──────────────────────────────────────────────────────────────

const FALLBACK_THUMBNAILS: Record<string, string> = {
  tiktok:    "https://placehold.co/1280x720/0f0f0f/BEFF3E?text=TikTok+Video&font=montserrat",
  instagram: "https://placehold.co/1280x720/0f0f0f/BEFF3E?text=Instagram+Video&font=montserrat",
  facebook:  "https://placehold.co/1280x720/0f0f0f/BEFF3E?text=Facebook+Video&font=montserrat",
  twitter:   "https://placehold.co/1280x720/0f0f0f/BEFF3E?text=X+Video&font=montserrat",
  threads:   "https://placehold.co/1280x720/0f0f0f/BEFF3E?text=Threads+Video&font=montserrat",
}

const FULL_FORMATS = [
  { id: "f137+f140", label: "4K Ultra HD",  quality: "4K",    size: "1.2 GB", ext: "mp4", fps: 60, hasVideo: true,  hasAudio: true  },
  { id: "f137+f141", label: "Full HD",       quality: "1080p", size: "480 MB", ext: "mp4", fps: 60, hasVideo: true,  hasAudio: true  },
  { id: "f136+f140", label: "HD",            quality: "720p",  size: "180 MB", ext: "mp4", fps: 30, hasVideo: true,  hasAudio: true  },
  { id: "f135+f140", label: "SD",            quality: "480p",  size: "80 MB",  ext: "mp4", fps: 30, hasVideo: true,  hasAudio: true  },
  { id: "f134+f140", label: "Low",           quality: "360p",  size: "45 MB",  ext: "mp4", fps: 30, hasVideo: true,  hasAudio: true  },
  { id: "f140",      label: "Audio Only",    quality: "audio", size: "12 MB",  ext: "mp3", hasVideo: false, hasAudio: true  },
] as VideoInfo["formats"]

const SHORT_FORMATS = [
  { id: "f137+f140", label: "Full HD",    quality: "1080p", size: "90 MB", ext: "mp4", fps: 60, hasVideo: true, hasAudio: true },
  { id: "f136+f140", label: "HD",         quality: "720p",  size: "40 MB", ext: "mp4", fps: 30, hasVideo: true, hasAudio: true },
  { id: "f140",      label: "Audio Only", quality: "audio", size: "4 MB",  ext: "mp3", hasVideo: false, hasAudio: true },
] as VideoInfo["formats"]

function mockVideoInfo(platform: string, originalUrl: string): VideoInfo {
  const isYT = platform === "youtube" || platform === "youtube-playlist"

  let thumbnail: string
  if (isYT) {
    const videoId = extractYouTubeVideoId(originalUrl)
    thumbnail = videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : "https://placehold.co/1280x720/0f0f0f/BEFF3E?text=YouTube+Video&font=montserrat"
  } else {
    thumbnail = FALLBACK_THUMBNAILS[platform] ?? "https://placehold.co/1280x720/0f0f0f/BEFF3E?text=Video&font=montserrat"
  }

  return {
    title: "Video",
    author: "—",
    duration: "—",
    thumbnail,
    views: "—",
    likes: "—",
    platform: platform as VideoInfo["platform"],
    formats: isYT ? FULL_FORMATS : SHORT_FORMATS,
  }
}

function mockPlaylistItems(): PlaylistItem[] {
  const titles = [
    "Dreamy Afternoon — Chillhop Sessions",
    "Midnight Drive Vibes",
    "Rainy Day Cafe Beats",
    "Study Mode Activated 📚",
    "Tokyo Jazz Walks",
    "Golden Hour Instrumentals",
    "Autumn Leaves lo-fi",
    "Morning Coffee Melodies",
    "Focus Flow — Deep Work",
    "Late Night Thoughts",
  ]

  return titles.map((title, i) => ({
    index: i + 1,
    title,
    duration: `${Math.floor(Math.random() * 4 + 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg",
    id: `yt-${i}`,
  }))
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let { url, platform } = body as { url: string; platform: string }

    if (!url || !platform) {
      console.error("[video-info] validation failed: missing url or platform", { url: !!url, platform: !!platform })
      return NextResponse.json({ error: "Missing url or platform" }, { status: 400 })
    }

    // Resolve short/redirect URLs so thumbnails & metadata are always correct
    const resolvedUrl = await resolveUrl(url)

    // If the resolved URL is different, re-derive platform from it
    if (resolvedUrl !== url) {
      try {
        const rHost = new URL(resolvedUrl).hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "")
        if (rHost === "tiktok.com") platform = "tiktok"
        else if (rHost === "youtube.com" || rHost === "youtu.be") platform = "youtube"
        else if (rHost === "instagram.com") platform = "instagram"
        else if (rHost === "facebook.com") platform = "facebook"
        else if (rHost === "twitter.com" || rHost === "x.com") platform = "twitter"
        else if (rHost === "threads.net") platform = "threads"
      } catch {
        // Keep original platform if parsing fails
      }
    }

    const finalUrl = resolvedUrl || url

    // ─── Vercel: get real metadata from download worker ───
    if (YT_DLP_API) {
      try {
        const workerRes = await fetch(`${YT_DLP_API}/video-info`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: finalUrl, platform }),
        })
        if (workerRes.ok) {
          const data = await workerRes.json()
          const videoId = (platform === "youtube" || platform === "youtube-playlist")
            ? extractYouTubeVideoId(finalUrl)
            : null
          return NextResponse.json({
            video: data.video,
            playlist: data.playlist,
            resolvedUrl: finalUrl,
            videoId,
          })
        }
      } catch (err) {
        console.warn("[video-info] worker fetch failed, falling back", err)
      }
    }

    // ─── Local / VPS: run yt-dlp -j for real metadata ───
    const ytDlpMeta = await runYtDlpJson(finalUrl)
    let video: VideoInfo
    if (ytDlpMeta?.title) {
      video = mapYtDlpToVideoInfo(ytDlpMeta, platform, finalUrl)
      console.log("[video-info] real metadata", { title: video.title.slice(0, 40) })
    } else {
      video = mockVideoInfo(platform, finalUrl)
      console.log("[video-info] mock metadata (yt-dlp not available or failed)")
    }

    const playlist = platform === "youtube-playlist" ? mockPlaylistItems() : undefined

    const videoId = (platform === "youtube" || platform === "youtube-playlist")
      ? extractYouTubeVideoId(finalUrl)
      : null

    return NextResponse.json({
      video,
      playlist,
      resolvedUrl: finalUrl,
      videoId,
    })
  } catch (err) {
    console.error("[video-info] error", err)
    return NextResponse.json({ error: "Failed to fetch video info" }, { status: 500 })
  }
}
