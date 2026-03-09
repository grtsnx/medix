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

/* Platform logos in brand colors (hint row when idle). Use light tones for dark bg. */
const BRAND_LOGOS = [
  { name: "YouTube", color: "#FF0000", path: "M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
  { name: "TikTok", color: "#EE1D52", path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" },
  { name: "Instagram", color: "#E4405F", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" },
  { name: "Facebook", color: "#1877F2", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { name: "X", color: "#f0f0f0", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.264 5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { name: "Threads", color: "#f0f0f0", path: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.028-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.3-.883-2.342-.886h-.028c-.8 0-1.799.208-2.763 1.275l-1.52-1.36C7.876 4.764 9.319 4.1 11.19 4.1h.045c1.6.003 2.873.476 3.785 1.404 1.011 1.03 1.503 2.563 1.509 4.558v.034a4.64 4.64 0 0 1 .13.069c1.219.691 2.064 1.737 2.448 3.021.352 1.187.308 2.67-.387 4.165-.849 1.849-2.33 3.119-4.303 3.67A10.57 10.57 0 0 1 12.186 24zm.166-9.562c-.08 0-.16.002-.24.007-1.006.057-1.8.37-2.262.876-.37.41-.527.916-.494 1.513.058 1.051 1.008 1.73 2.34 1.656 1.143-.062 1.977-.533 2.479-1.399.36-.624.523-1.443.483-2.44a11.698 11.698 0 0 0-2.306-.213z" },
  { name: "Playlists", color: "#9ca3af", path: "M4 6h16v1.5H4V6zm0 6h16v1.5H4V12zm0 6h10v1.5H4V18z" },
]

type Props = {
  url: string
  state: DownloaderState
  platform: Platform
  error: string | null
  onChange: (val: string) => void
  onSubmit: () => void
  className?: string
}

export function UrlInput({ url, state, platform, error, onChange, onSubmit, className }: Props) {
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
    <div className={cn("w-full max-w-3xl mx-auto space-y-3", className)}>
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

      {/* Hint — platform logos in brand colors */}
      {!hasUrl && state === "idle" && (
        <div className="flex items-center justify-start gap-3 px-2 flex-wrap min-h-[1.25rem]" aria-label="Supported: YouTube, TikTok, Instagram, Facebook, X, Threads, Playlists">
          {BRAND_LOGOS.map((logo) => (
            <span key={logo.name} className="flex items-center justify-center w-5 h-5 rounded shrink-0" title={logo.name}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 block shrink-0" style={{ fill: logo.color }} aria-hidden>
                <path d={logo.path} />
              </svg>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
