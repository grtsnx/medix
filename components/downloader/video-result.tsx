"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { VideoInfo } from "@/hooks/use-downloader"

type PreviewState = "idle" | "playing" | "ended"

type Props = {
  info: VideoInfo
  url: string
  className?: string
}

const PLATFORM_LABEL: Record<string, string> = {
  youtube:            "YouTube",
  "youtube-playlist": "YouTube Playlist",
  tiktok:             "TikTok",
  instagram:          "Instagram",
  facebook:           "Facebook",
  twitter:            "X (Twitter)",
  threads:            "Threads",
}

const PREVIEW_SECS = 5

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, "")
    if (host === "youtube.com") return u.searchParams.get("v")
    if (host === "youtu.be") return u.pathname.slice(1).split("?")[0]
    return null
  } catch {
    return null
  }
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono whitespace-nowrap">
      {icon}
      {value}
    </span>
  )
}

const EyeIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
  </svg>
)

const LikeIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
    <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
  </svg>
)

const ListIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
    <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.493 2.493 0 00-.25-.032L5.25 4.5A2.5 2.5 0 002.75 7H2.5V3.34a.75.75 0 01.628-.74zM17.25 6.5a2 2 0 00-2-2H4.75a2 2 0 00-2 2v6a2 2 0 002 2h10.5a2 2 0 002-2v-6z" clipRule="evenodd" />
  </svg>
)

export function VideoResult({ info, url, className }: Props) {
  const [preview, setPreview] = useState<PreviewState>("idle")
  const [timeLeft, setTimeLeft] = useState(PREVIEW_SECS)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const ytId = (info.platform === "youtube" || info.platform === "youtube-playlist")
    ? getYouTubeId(url)
    : null

  const platformLabel = PLATFORM_LABEL[info.platform] ?? info.platform

  function startPreview() {
    setPreview("playing")
    setTimeLeft(PREVIEW_SECS)
  }

  function stopPreview() {
    if (timerRef.current) clearInterval(timerRef.current)
    setPreview("idle")
    setTimeLeft(PREVIEW_SECS)
  }

  useEffect(() => {
    if (preview !== "playing") return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setPreview("ended")
          return PREVIEW_SECS
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [preview])

  const isActive = preview === "playing" || preview === "ended"

  /* Info block — shared between both layout states */
  const InfoBlock = (
    <div
      className={cn(
        "flex flex-col gap-2.5 min-w-0",
        isActive ? "p-4" : "flex-1 p-4",
      )}
    >
      <div>
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground no-word-break">
          {info.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground truncate">{info.author}</p>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {info.views !== "—" && <Stat icon={<EyeIcon />} value={info.views} />}
        {info.likes !== "—" && <Stat icon={<LikeIcon />} value={info.likes} />}
        {info.isPlaylist && info.playlistCount && (
          <Stat icon={<ListIcon />} value={`${info.playlistCount} videos`} />
        )}
      </div>

      {info.isPlaylist && (
        <div
          className="flex items-start gap-1.5 px-2.5 py-2 rounded-xl text-xs no-word-break"
          style={{ background: "var(--cobalt-dim)", border: "1px solid var(--cobalt-border)", color: "var(--cobalt)" }}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 flex-none mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h8.25a1.875 1.875 0 010 3.75h-8.25a1.875 1.875 0 010-3.75z" />
          </svg>
          <p>Playlist — pick which videos you want below</p>
        </div>
      )}

      <div className="mt-auto flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full pulse-dot shrink-0" style={{ background: "#4CAF72" }} />
        <span className="text-xs font-mono text-muted-foreground">Ready to download</span>
      </div>
    </div>
  )

  return (
    <div className={cn("animate-fade-up w-full", className)}>
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
      >

        {/* ── PLAYING / ENDED: video stacked above info ── */}
        {isActive ? (
          <div className="flex flex-col animate-scale-up">
            {/* Video area */}
            <div className="relative w-full aspect-video bg-black overflow-hidden">

              {/* YouTube iframe */}
              {preview === "playing" && ytId && (
                <iframe
                  key="yt-embed"
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&start=0&end=${PREVIEW_SECS}&controls=0&rel=0&modestbranding=1&playsinline=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media"
                  title="Video preview"
                />
              )}

              {/* Non-YouTube playing: Ken Burns on thumbnail */}
              {preview === "playing" && !ytId && (
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    key="kb-preview"
                    src={info.thumbnail}
                    alt={info.title}
                    fill
                    className="object-cover ken-burns"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  {/* Platform label */}
                  <div
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white backdrop-blur-sm"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#4CAF72" }} />
                    {platformLabel} preview
                  </div>
                </div>
              )}

              {/* Ended: static thumbnail */}
              {preview === "ended" && (
                <>
                  <Image src={info.thumbnail} alt={info.title} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 animate-fade-in">
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                      style={{ background: "rgba(76,175,114,0.88)" }}
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      Preview ended
                    </div>
                    <button
                      onClick={startPreview}
                      className="text-xs text-white/75 hover:text-white transition-colors underline"
                    >
                      Watch again
                    </button>
                  </div>
                </>
              )}

              {/* Countdown bar (bottom) */}
              {preview === "playing" && (
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${(timeLeft / PREVIEW_SECS) * 100}%`,
                      background: ytId ? "rgba(255,255,255,0.85)" : "#4CAF72",
                      transition: "width 1s linear",
                    }}
                  />
                </div>
              )}

              {/* Countdown badge + stop button (top-right) */}
              {preview === "playing" && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold text-white"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#4CAF72" }} />
                    {timeLeft}s
                  </div>
                  <button
                    onClick={stopPreview}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                    aria-label="Stop preview"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                      <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {InfoBlock}
          </div>

        ) : (

          /* ── IDLE: thumbnail left + info right ── */
          <div className="flex flex-col sm:flex-row">
            {/* Thumbnail with play button */}
            <div
              className="relative sm:w-44 flex-none aspect-video sm:aspect-auto overflow-hidden group"
              style={{ background: "var(--surface-2)" }}
            >
              <Image
                src={info.thumbnail}
                alt={info.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent sm:bg-linear-to-r" />

              {/* Duration badge */}
              {info.duration !== "—" && (
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                  {info.duration}
                </span>
              )}

              {/* Platform badge */}
              <span
                className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-lg backdrop-blur-sm"
                style={{ background: "rgba(65,105,224,0.85)", color: "#ffffff" }}
              >
                {platformLabel}
              </span>

              {/* Play button */}
              <button
                onClick={startPreview}
                className="absolute inset-0 flex items-center justify-center"
                aria-label="Play 5-second preview"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                  style={{ background: "rgba(255,255,255,0.93)", boxShadow: "0 2px 16px rgba(0,0,0,0.35)" }}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: "#1C1916", marginLeft: "2px" }}>
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </button>
            </div>

            {InfoBlock}
          </div>
        )}
      </div>
    </div>
  )
}
