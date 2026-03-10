"use client"

import { useState, useCallback } from "react"

export type Platform =
  | "youtube"
  | "youtube-playlist"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "twitter"
  | "threads"
  | "unknown"

export type VideoQuality = "4K" | "1080p" | "720p" | "480p" | "360p" | "audio"

export type FormatOption = {
  id: string
  label: string
  quality: VideoQuality
  size: string
  ext: string
  fps?: number
  hasVideo: boolean
  hasAudio: boolean
}

export type VideoInfo = {
  title: string
  author: string
  duration: string
  thumbnail: string
  views: string
  likes: string
  platform: Platform
  formats: FormatOption[]
  isPlaylist?: boolean
  playlistCount?: number
  playlistTitle?: string
}

export type PlaylistItem = {
  index: number
  title: string
  duration: string
  thumbnail: string
  id: string
}

export type DownloaderState =
  | "idle"
  | "detecting"
  | "fetching"
  | "ready"
  | "downloading"
  | "done"
  | "error"

export function detectPlatform(url: string): Platform {
  try {
    const u = new URL(url)
    // Use regex anchored at start to avoid stripping substrings mid-hostname
    // e.g. "vm.tiktok.com" has "m." at position 1, NOT a prefix — so /^m\./ won't match it
    const host = u.hostname
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/^m\./, "")

    if (host === "youtube.com") {
      const isPlaylist =
        u.searchParams.has("list") ||
        u.pathname.startsWith("/playlist")
      return isPlaylist ? "youtube-playlist" : "youtube"
    }
    // youtu.be short URLs — always a single video
    if (host === "youtu.be") return "youtube"

    // TikTok: vm.tiktok.com and vt.tiktok.com are short redirect links
    if (host === "tiktok.com" || host === "vm.tiktok.com" || host === "vt.tiktok.com") return "tiktok"

    if (host === "instagram.com" || host === "instagr.am") return "instagram"
    if (host === "facebook.com" || host === "fb.watch") return "facebook"
    if (host === "twitter.com" || host === "x.com" || host === "t.co") return "twitter"
    if (host === "threads.net") return "threads"
    return "unknown"
  } catch {
    return "unknown"
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const SASSY_ERRORS: Record<string, string> = {
  unknown: "We don't recognize that URL. Try YouTube, TikTok, Instagram, Facebook, X, or Threads — you know, platforms that exist.",
  invalid: "That's not a URL. That's just... words. Paste a real link.",
}

export function useDownloader() {
  const [url, setUrl] = useState("")
  const [state, setState] = useState<DownloaderState>("idle")
  const [platform, setPlatform] = useState<Platform>("unknown")
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([])
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)

  const handleUrlChange = useCallback((value: string) => {
    setUrl(value)
    setVideoInfo(null)
    setResolvedUrl(null)
    setVideoId(null)
    setError(null)
    setState("idle")
    if (isValidUrl(value)) {
      setPlatform(detectPlatform(value))
    } else {
      setPlatform("unknown")
    }
  }, [])

  const fetchVideoInfo = useCallback(async () => {
    if (!isValidUrl(url)) {
      setError(SASSY_ERRORS.invalid)
      return
    }

    const detected = detectPlatform(url)
    if (detected === "unknown") {
      setError(SASSY_ERRORS.unknown)
      setState("error")
      return
    }

    setError(null)
    setState("detecting")
    setPlatform(detected)

    await new Promise((r) => setTimeout(r, 400))
    setState("fetching")

    try {
      const res = await fetch("/api/video-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, platform: detected }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data.error || "Couldn't fetch video info. The URL might be private or region-locked."
        console.error("[useDownloader] fetchVideoInfo HTTP error", { status: res.status, url, data })
        throw new Error(msg)
      }

      const data = await res.json()
      const resolved = data.resolvedUrl ?? url
      const ytId = data.videoId ?? null

      console.log("[useDownloader] fetchVideoInfo success", {
        url,
        resolvedUrl: resolved,
        videoId: ytId,
        hasVideo: !!data.video,
      })

      setVideoInfo(data.video)
      if (data.playlist) setPlaylistItems(data.playlist)
      if (data.video?.formats?.length) setSelectedFormat(data.video.formats[0].id)
      setResolvedUrl(resolved)
      setVideoId(ytId)
      setState("ready")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went sideways. Try again?"
      console.error("[useDownloader] fetchVideoInfo error", { url, err, message })
      setError(message)
      setState("error")
    }
  }, [url])

  const triggerDownload = useCallback(async () => {
    if (!selectedFormat || !videoInfo) return
    setState("downloading")
    setDownloadProgress(0)

    const ticks = [15, 35, 55, 72, 88, 100]
    for (const tick of ticks) {
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 200))
      setDownloadProgress(tick)
    }

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: resolvedUrl || url,
          formatId: selectedFormat,
          filename: `${videoInfo.title.slice(0, 40).replace(/[<>:"/\\|?*]/g, "_")}.${videoInfo.formats.find((f) => f.id === selectedFormat)?.ext ?? "mp4"}`,
        }),
      })

      if (res.ok && res.body) {
        const blob = await res.blob()
        const fmt = videoInfo.formats.find((f) => f.id === selectedFormat)
        const ext = fmt?.ext ?? "mp4"
        const contentDisposition = res.headers.get("Content-Disposition")
        const filenameMatch = contentDisposition?.match(/filename="?([^";\n]+)"?/)
        const filename = filenameMatch ? filenameMatch[1].trim() : `${videoInfo.title.slice(0, 40)}.${ext}`
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = filename
        a.click()
        URL.revokeObjectURL(a.href)
        console.log("[useDownloader] download saved", { filename })
      } else {
        const data = await res.json().catch(() => ({}))
        const errMsg = data.error || "Download failed. Try again."
        console.error("[useDownloader] download failed", { status: res.status, url: resolvedUrl || url, data })
        setError(errMsg)
      }
    } catch (err) {
      console.error("[useDownloader] triggerDownload error", err)
      setError("Download failed. Try again.")
    }

    setState("done")
  }, [selectedFormat, videoInfo, url, resolvedUrl])

  const reset = useCallback(() => {
    setUrl("")
    setVideoInfo(null)
    setPlaylistItems([])
    setResolvedUrl(null)
    setVideoId(null)
    setSelectedFormat(null)
    setError(null)
    setState("idle")
    setPlatform("unknown")
    setDownloadProgress(0)
  }, [])

  return {
    url,
    resolvedUrl,
    videoId,
    state,
    platform,
    videoInfo,
    playlistItems,
    selectedFormat,
    error,
    downloadProgress,
    handleUrlChange,
    fetchVideoInfo,
    setSelectedFormat,
    triggerDownload,
    reset,
  }
}
