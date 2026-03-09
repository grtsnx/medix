/**
 * /api/video-info
 *
 * Resolves short URLs (vm.tiktok.com, youtu.be, fb.watch, t.co) server-side
 * before processing, so platform detection and thumbnails are always correct.
 *
 * Currently returns realistic mock data. To go live: swap mockVideoInfo()
 * with a real yt-dlp subprocess or HTTP wrapper call.
 */

import { NextRequest, NextResponse } from "next/server"
import type { VideoInfo, PlaylistItem } from "@/hooks/use-downloader"

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
    if (!SHORT_HOSTS.has(host)) return url

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
      headers: {
        // Mimic a real browser so redirect chains don't bail early
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    })
    // res.url is the final URL after all redirects
    return res.url || url
  } catch {
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

    // youtube.com/watch?v=VIDEO_ID
    if (host === "youtube.com" || host === "m.youtube.com") {
      return u.searchParams.get("v") || null
    }
  } catch {
    // ignore
  }
  return null
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

  // For YouTube, derive thumbnail from actual video ID so it matches the link
  let thumbnail: string
  if (isYT) {
    const videoId = extractYouTubeVideoId(originalUrl)
    thumbnail = videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : "https://placehold.co/1280x720/0f0f0f/BEFF3E?text=YouTube+Video&font=montserrat"
  } else {
    thumbnail = FALLBACK_THUMBNAILS[platform] ?? "https://placehold.co/1280x720/0f0f0f/BEFF3E?text=Video&font=montserrat"
  }

  const base: VideoInfo = {
    title: "Amazing Video Title — Download Now",
    author: "@creator",
    duration: "10:32",
    thumbnail,
    views: "4.2M",
    likes: "183K",
    platform: platform as VideoInfo["platform"],
    formats: isYT ? FULL_FORMATS : SHORT_FORMATS,
  }

  const overrides: Record<string, Partial<VideoInfo>> = {
    youtube: {
      title: "How the Universe Works — A Stunning Documentary",
      author: "Kurzgesagt – In a Nutshell",
      duration: "14:22",
      views: "28.1M",
      likes: "1.4M",
    },
    "youtube-playlist": {
      title: "Lo-fi Beats to Study/Relax To 🎵 [4K]",
      author: "ChillHop Music",
      duration: "—",
      views: "—",
      likes: "—",
      isPlaylist: true,
      playlistCount: 47,
      playlistTitle: "Lo-fi Beats to Study/Relax To",
    },
    tiktok: {
      title: "Wait for it… 😂 #viral #fyp",
      author: "@trendingcreator",
      duration: "0:58",
      views: "12.8M",
      likes: "2.1M",
    },
    instagram: {
      title: "Sunset timelapse from the mountains 🌄",
      author: "@naturephotography",
      duration: "1:02",
      views: "880K",
      likes: "94K",
    },
    facebook: {
      title: "Epic Skateboarding Compilation 2024",
      author: "SkateFeed",
      duration: "8:14",
      views: "3.5M",
      likes: "210K",
    },
    twitter: {
      title: "This is incredible — watch till the end",
      author: "@viral_clips",
      duration: "2:11",
      views: "6.7M",
      likes: "345K",
    },
    threads: {
      title: "POV: You just discovered something amazing",
      author: "@threads_official",
      duration: "0:44",
      views: "520K",
      likes: "48K",
    },
  }

  return { ...base, ...(overrides[platform] ?? {}), thumbnail }
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
      return NextResponse.json({ error: "Missing url or platform" }, { status: 400 })
    }

    // Resolve short/redirect URLs so thumbnails & metadata are always correct
    const resolvedUrl = await resolveUrl(url)

    // If the resolved URL is different, re-derive platform from it
    // (e.g. vm.tiktok.com → tiktok.com/video/...)
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

    await new Promise((r) => setTimeout(r, 700)) // simulate processing

    const video = mockVideoInfo(platform, resolvedUrl || url)
    const playlist = platform === "youtube-playlist" ? mockPlaylistItems() : undefined

    return NextResponse.json({ video, playlist })
  } catch (err) {
    console.error("[video-info]", err)
    return NextResponse.json({ error: "Failed to fetch video info" }, { status: 500 })
  }
}
