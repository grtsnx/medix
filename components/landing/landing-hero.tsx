"use client"

import { UrlInput } from "@/components/downloader/url-input"

/**
 * Landing-only hero section. Do not use on other routes.
 * Contains: eyebrow, headline, subtitle, URL input.
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

        {/* Eyebrow — brand */}
        <div className="stagger-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-6 lime-badge w-fit">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 pulse-ring" style={{ background: "#BEFF3E" }} />
          vidload
        </div>

        {/* Heading — larger, fits without wrapping */}
        <h1 className="stagger-2 font-extrabold leading-[1.1] tracking-tight mb-4 text-4xl sm:text-5xl md:text-[3rem] lg:text-[3.75rem] xl:text-[4rem]">
          <span className="block text-muted-foreground/50 whitespace-nowrap">Paste a link,</span>
          <span
            className="block text-glow-lime whitespace-nowrap"
            style={{ color: "#BEFF3E" }}
          >
            Download it.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="stagger-3 text-xs sm:text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed no-word-break">
          YouTube, TikTok, Instagram, Facebook, X, Threads — grab the video,
          pick the quality. No account. No drama. No ads.
        </p>

        {/* URL Input — width aligned with heading "Download it." */}
        <div className="stagger-4 w-full max-w-[18rem]">
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
            className="mt-4 slide-up flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-[11px] no-word-break"
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
