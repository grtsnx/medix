"use client"

import { UrlInput } from "@/components/downloader/url-input"
import type { DownloaderState, Platform } from "@/hooks/use-downloader"

interface LandingHeroProps {
  url: string
  state: DownloaderState
  platform: Platform
  error: string | null
  activeTab: "single" | "playlist"
  showResult: boolean
  isPlaylist: boolean
  onUrlChange: (value: string) => void
  onFetchVideoInfo: () => void
  onTabChange: (tab: "single" | "playlist") => void
  onReset: () => void
}

const PLATFORMS = ["YouTube", "TikTok", "Instagram", "Facebook", "X", "Threads"]

export function LandingHero({
  url,
  state,
  platform,
  error,
  showResult,
  isPlaylist,
  onUrlChange,
  onFetchVideoInfo,
}: LandingHeroProps) {
  return (
    <section className="relative z-10 flex flex-1 flex-col justify-center px-6 pt-6 pb-12 md:px-12 lg:px-16 xl:px-24">
      <div className={showResult ? "max-w-xl" : "max-w-2xl"}>

        {/* ── Eyebrow badge ── */}
        {!showResult && (
          <div className="animate-fade-up delay-0 mb-6 inline-flex items-center gap-2">
            <span
              className="inline-flex items-center gap-2 text-xs font-medium border rounded-full px-3.5 py-1.5"
              style={{
                borderColor: "var(--cobalt-border)",
                background: "var(--cobalt-dim)",
                color: "var(--cobalt)",
              }}
            >
              <span className="text-[10px]">✦</span>
              Free forever · No account needed · No drama
            </span>
          </div>
        )}

        {/* ── Display headline ── */}
        <h1
          className={[
            "font-(family-name:--font-instrument) leading-[1.05] tracking-tight mb-5 no-word-break",
            showResult
              ? "text-4xl md:text-5xl lg:text-[3.25rem] animate-fade-up delay-0"
              : "text-5xl sm:text-6xl md:text-7xl animate-fade-up delay-80",
          ].join(" ")}
        >
          <span className="block text-muted-foreground" style={{ opacity: 0.55 }}>
            paste it,
          </span>
          <span className="block" style={{ color: "var(--cobalt)", fontWeight: 800 }}>
            download it.
          </span>
        </h1>

        {/* ── Subtitle ── */}
        {!showResult && (
          <p className="animate-fade-up delay-160 text-base text-muted-foreground mb-8 max-w-md leading-relaxed no-word-break">
            <span className="text-foreground/70">
              your screen recorder can finally retire
            </span>
          </p>
        )}

        {/* ── URL Input ── */}
        <div className={[
          showResult ? "animate-fade-up delay-0" : "animate-fade-up delay-240",
          "w-full",
          showResult ? "max-w-lg" : "max-w-md",
        ].join(" ")}>
          <UrlInput
            url={url}
            state={state}
            platform={platform}
            error={error}
            onChange={onUrlChange}
            onSubmit={onFetchVideoInfo}
          />
        </div>

        {/* ── Platform hint ── */}
        {!showResult && (
          <p className="animate-fade-up delay-320 mt-5 text-xs text-muted-foreground font-mono">
            {PLATFORMS.join(" · ")}
          </p>
        )}

        {/* ── Playlist hint ── */}
        {isPlaylist && !showResult && (
          <div
            className="mt-4 animate-fade-in flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-xs no-word-break"
            style={{
              background: "var(--cobalt-dim)",
              borderColor: "var(--cobalt-border)",
              color: "var(--cobalt)",
            }}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4 h-4 shrink-0 mt-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <span>
              Paste a YouTube playlist URL —{" "}
              <code className="font-mono bg-white/40 px-1 py-0.5 rounded text-[11px]">
                youtube.com/playlist?list=…
              </code>
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
