"use client"

import { useRef, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import type { DownloaderState, Platform } from "@/hooks/use-downloader"

const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube",
  "youtube-playlist": "YT Playlist",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X (Twitter)",
  threads: "Threads",
  unknown: "",
}

const DETECTING_QUIPS = ["Sniffing out the platform…", "Checking the vibes…", "On it…"]
const FETCHING_QUIPS = ["Grabbing the deets…", "Interrogating the server…", "Almost got it…"]

type Props = {
  url: string
  state: DownloaderState
  platform: Platform
  error: string | null
  onChange: (val: string) => void
  onSubmit: () => void
}

export function UrlInput({ url, state, platform, error, onChange, onSubmit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isLoading = state === "detecting" || state === "fetching"
  const hasUrl = url.trim().length > 0
  const isKnown = platform !== "unknown" && hasUrl
  const platformLabel = isKnown ? PLATFORM_LABELS[platform] : null

  const detectingQuip = DETECTING_QUIPS[0]
  const fetchingQuip = FETCHING_QUIPS[0]

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !isLoading) onSubmit()
  }

  function handlePaste() {
    setTimeout(() => {
      if (inputRef.current) onChange(inputRef.current.value)
    }, 0)
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row">
        {/* Input */}
        <div
          className={cn(
            "input-glow flex-1 flex items-center rounded-xl sm:rounded-r-none border transition-all duration-300",
            "bg-(--surface-2) min-w-0",
            error ? "border-red-500/40" : "border-border"
          )}
        >
          {/* Icon / spinner */}
          <div className="flex-none pl-3 sm:pl-4 pr-2">
            {isLoading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 spin-loader" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
            )}
          </div>

          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKey}
            onPaste={handlePaste}
            placeholder="Paste any video link here…"
            disabled={isLoading}
            className={cn(
              "flex-1 py-3.5 sm:py-4 pr-2 text-sm bg-transparent outline-none",
              "placeholder:text-muted-foreground font-mono text-foreground",
              "min-w-0 w-full",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Video URL"
          />

          {/* Platform badge — desktop */}
          {isKnown && !isLoading && (
            <div
              className="hidden sm:flex flex-none mx-2 items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold tracking-wide"
              style={{ background: "rgba(190,255,62,0.08)", color: "#BEFF3E", border: "1px solid rgba(190,255,62,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full pulse-ring shrink-0" style={{ background: "#BEFF3E" }} />
              {platformLabel}
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={onSubmit}
          disabled={isLoading || !hasUrl}
          className={cn(
            "btn-download rounded-xl sm:rounded-l-none px-5 py-3.5 text-sm font-bold tracking-wide",
            "flex items-center justify-center gap-2 whitespace-nowrap",
            (!hasUrl || isLoading) && "opacity-40 cursor-not-allowed transform-none! shadow-none!"
          )}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 spin-loader" style={{ borderTopColor: "#080808" }} />
              <span className="hidden sm:inline">
                {state === "detecting" ? detectingQuip : fetchingQuip}
              </span>
              <span className="sm:hidden">Loading…</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-none">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              Grab It
            </>
          )}
        </button>
      </div>

      {/* Platform badge — mobile */}
      {isKnown && !isLoading && (
        <div className="flex sm:hidden items-center gap-1.5 text-xs font-mono px-1" style={{ color: "#BEFF3E" }}>
          <span className="w-1.5 h-1.5 rounded-full pulse-ring inline-block shrink-0" style={{ background: "#BEFF3E" }} />
          {platformLabel} detected
        </div>
      )}

      {/* Progress bar */}
      {state === "fetching" && (
        <div className="h-px w-full bg-(--surface-3) overflow-hidden rounded-full">
          <div className="h-full progress-animate rounded-full" style={{ background: "#BEFF3E" }} />
        </div>
      )}

      {/* State labels */}
      {(state === "detecting" || state === "fetching") && (
        <p className="text-center text-xs font-mono animate-pulse" style={{ color: "#BEFF3E", opacity: 0.7 }}>
          ◉ {state === "detecting" ? "Detecting platform…" : "Fetching video info…"}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="flex items-start gap-1.5 text-red-400 text-sm px-1 slide-up">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-none mt-0.5 shrink-0">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Hint */}
      {!hasUrl && state === "idle" && (
        <p className="text-start text-xs text-muted-foreground px-2 font-mono">
          YouTube · TikTok · Instagram · Facebook · X · Threads · Playlists
        </p>
      )}
    </div>
  )
}
