"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import type { VideoInfo } from "@/hooks/use-downloader"

type PreviewState = "idle" | "playing" | "ended"

type Props = {
  info: VideoInfo
  url: string
}

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

const PREVIEW_SECONDS = 5

export function VideoPreview({ info, url }: Props) {
  const [status, setStatus]   = useState<PreviewState>("idle")
  const [timeLeft, setTimeLeft] = useState(PREVIEW_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const ytId = (info.platform === "youtube" || info.platform === "youtube-playlist")
    ? getYouTubeId(url)
    : null

  function startPreview() {
    if (!ytId) return
    setStatus("playing")
    setTimeLeft(PREVIEW_SECONDS)
  }

  function stopPreview() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStatus("ended")
    setTimeLeft(PREVIEW_SECONDS)
  }

  useEffect(() => {
    if (status !== "playing") return
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          setStatus("ended")
          return PREVIEW_SECONDS
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [status])

  const canPreview = !!ytId
  const embedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&start=0&end=${PREVIEW_SECONDS}&controls=0&rel=0&modestbranding=1&playsinline=1`
    : null

  return (
    <div
      className="rounded-2xl border overflow-hidden animate-fade-up"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: status === "playing" ? "#4CAF72" : "var(--muted-foreground)",
              opacity: status === "playing" ? 1 : 0.5,
            }}
          />
          <span className="text-xs font-semibold text-foreground">
            {PREVIEW_SECONDS}s Preview
          </span>
        </div>

        <div className="flex items-center gap-3">
          {status === "playing" && (
            <div className="flex items-center gap-1.5">
              {/* Countdown segments */}
              <div className="flex gap-0.5">
                {Array.from({ length: PREVIEW_SECONDS }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-1 rounded-full transition-all duration-300"
                    style={{
                      background: i < timeLeft
                        ? "var(--cobalt)"
                        : "var(--surface-3)",
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono font-semibold tabular-nums"
                style={{ color: "var(--cobalt)" }}>
                {timeLeft}s
              </span>
            </div>
          )}

          {status === "ended" && (
            <button
              onClick={() => setStatus("idle")}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Replay
            </button>
          )}

          {status === "playing" && (
            <button
              onClick={stopPreview}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Stop
            </button>
          )}

          {!canPreview && (
            <span className="text-[11px] text-muted-foreground font-mono">
              YouTube only
            </span>
          )}
        </div>
      </div>

      {/* ── Preview area ── */}
      <div className="relative aspect-video bg-black">
        {/* YouTube iframe (only while playing) */}
        {status === "playing" && embedSrc && (
          <iframe
            key="yt-preview"
            src={embedSrc}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            title="5-second video preview"
          />
        )}

        {/* Thumbnail overlay (idle + ended) */}
        {status !== "playing" && (
          <>
            <Image
              src={info.thumbnail}
              alt={info.title}
              fill
              className="object-cover"
              unoptimized
            />

            {/* Dark scrim */}
            <div className="absolute inset-0 bg-black/35" />

            {/* Ended overlay */}
            {status === "ended" && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 animate-fade-in"
                style={{ background: "rgba(0,0,0,0.55)" }}
              >
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(76,175,114,0.9)", color: "#fff" }}
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path
                      fillRule="evenodd"
                      d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Preview done
                </div>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-xs text-white/70 hover:text-white transition-colors"
                >
                  Watch again
                </button>
              </div>
            )}

            {/* Idle: play button */}
            {status === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center">
                {canPreview ? (
                  <button
                    onClick={startPreview}
                    className="group flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 duration-200"
                      style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-6 h-6"
                        style={{ color: "#1C1916", marginLeft: "2px" }}
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                    <span
                      className="text-xs font-semibold text-white px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(0,0,0,0.5)" }}
                    >
                      Play {PREVIEW_SECONDS}s preview
                    </span>
                  </button>
                ) : (
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-60">
                      <path
                        fillRule="evenodd"
                        d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75H10a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Preview available for YouTube only
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
