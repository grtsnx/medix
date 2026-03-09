"use client"

import { cn } from "@/lib/utils"
import { PlatformBadges } from "@/components/downloader/platform-badges"
import { UrlInput } from "@/components/downloader/url-input"

/**
 * Landing-only hero section. Do not use on other routes.
 * Contains: eyebrow, headline, subtitle, tab switcher, URL input.
 */
interface LandingHeroProps {
  url: string
  state: "idle" | "loading" | "ready" | "downloading" | "done" | "error"
  platform: string | null
  error: string | null
  activeTab: "single" | "playlist"
  showResult: boolean
  isPlaylist: boolean
  onUrlChange: (value: string) => void
  onFetchVideoInfo: () => void
  onTabChange: (tab: "single" | "playlist") => void
  onReset: () => void
}

export function LandingHero({
  url,
  state,
  platform,
  error,
  activeTab,
  showResult,
  isPlaylist,
  onUrlChange,
  onFetchVideoInfo,
  onTabChange,
  onReset,
}: LandingHeroProps) {
  return (
    <section className="px-8 pt-4 pb-8 md:px-16 md:pt-6 md:pb-12 lg:px-24">
      <div className="max-w-xl">

        {/* Eyebrow — platform names & logos */}
        <div className="stagger-1 mb-6">
          <PlatformBadges variant="lime" className="justify-start" />
        </div>

        {/* Heading — fixed sizes, no clamp */}
        <h1 className="stagger-2 font-extrabold leading-[1.06] tracking-tight mb-4">
          <span className="block text-[2.5rem] md:text-[3.5rem] text-muted-foreground/50">Paste a link,</span>
          <span
            className="block text-[2.5rem] md:text-[3.5rem] text-glow-lime"
            style={{ color: "#BEFF3E" }}
          >
            Download it.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="stagger-3 text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
          YouTube, TikTok, Instagram, Facebook, X, Threads — grab the video,
          pick the quality. No account. No drama. No ads.
        </p>

        {/* Tab switcher */}
        <div className="stagger-3 flex mb-5">
          <div className="flex gap-1 p-1 rounded-xl border border-border bg-(--surface-2)">
            <button
              onClick={() => { onTabChange("single"); if (showResult && isPlaylist) onReset() }}
              className={cn(
                "tab-btn px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                activeTab === "single"
                  ? "active bg-(--surface-3) text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Single Video
            </button>
            <button
              onClick={() => { onTabChange("playlist"); if (showResult && !isPlaylist) onReset() }}
              className={cn(
                "tab-btn px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5",
                activeTab === "playlist"
                  ? "active bg-(--surface-3) text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                <path d="M2.5 4h11a.5.5 0 010 1h-11a.5.5 0 010-1zM2.5 7.5h11a.5.5 0 010 1h-11a.5.5 0 010-1zM2.5 11h7a.5.5 0 010 1h-7a.5.5 0 010-1z" />
              </svg>
              Playlist
            </button>
          </div>
        </div>

        {/* URL Input */}
        <div className="stagger-4">
          <UrlInput
            url={url}
            state={state}
            platform={platform}
            error={error}
            onChange={onUrlChange}
            onSubmit={onFetchVideoInfo}
          />
        </div>

        {/* Playlist mode hint */}
        {activeTab === "playlist" && !showResult && (
          <div
            className="mt-4 slide-up flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-xs"
            style={{ background: "rgba(190,255,62,0.04)", borderColor: "rgba(190,255,62,0.14)" }}
          >
            <svg
              viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: "#BEFF3E", opacity: 0.65 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <span style={{ color: "rgba(190,255,62,0.75)" }}>
              Paste a YouTube playlist URL —{" "}
              <code
                className="font-mono text-xs px-1 py-0.5 rounded"
                style={{ background: "rgba(190,255,62,0.08)" }}
              >
                youtube.com/playlist?list=…
              </code>
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
