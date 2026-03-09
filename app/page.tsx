"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useDownloader } from "@/hooks/use-downloader"
import { PlatformBadges } from "@/components/downloader/platform-badges"
import { UrlInput } from "@/components/downloader/url-input"
import { VideoResult } from "@/components/downloader/video-result"
import { FormatSelector } from "@/components/downloader/format-selector"
import { PlaylistDownloader } from "@/components/downloader/playlist-downloader"

const FEATURES = [
  {
    num: "01",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Blink and it's done",
    desc: "Video info in under 2 seconds. Your patience is a resource we respect.",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "We forget everything",
    desc: "No account. No history. We process your link and immediately pretend it never happened.",
  },
  {
    num: "03",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5A1.125 1.125 0 0018 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v1.5m1.5-3.75C19.496 5.004 19 5.625 18 5.625m1.5-.75v5.25m-1.5-5.25v5.25m0 0c0 .621-.504 1.125-1.125 1.125H7.125A1.125 1.125 0 016 10.875m12 0v1.5c0 .621-.504 1.125-1.125 1.125" />
      </svg>
    ),
    title: "Pixels to spare",
    desc: "Up to 4K 60fps. Because 360p is a choice, and frankly, a bad one.",
  },
  {
    num: "04",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h8.25a1.875 1.875 0 010 3.75h-8.25a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    title: "The whole playlist",
    desc: "Download all 47 videos of that lo-fi playlist. We won't judge the 3am session.",
  },
  {
    num: "05",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
      </svg>
    ),
    title: "Just the vibes",
    desc: "Strip the video. Keep the audio. Pure MP3 for when you need the music without the face.",
  },
  {
    num: "06",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
      </svg>
    ),
    title: "Six platforms, zero excuses",
    desc: "YouTube, TikTok, Instagram, Facebook, X, Threads. Yes, even Threads.",
  },
]

const PLATFORM_QUIPS: Record<string, string> = {
  youtube:   "The original rabbit hole.",
  tiktok:    "15 seconds of your life. Saved forever.",
  instagram: "Reels disappear. Yours won't.",
  facebook:  "For your uncle's viral compilations.",
  twitter:   "Grab it before the ratio hits.",
  threads:   "We don't question your choices.",
}

const MARQUEE_ITEMS = [
  "YouTube ·", "TikTok ·", "Instagram ·", "Facebook ·", "X (Twitter) ·", "Threads ·",
  "Playlists ·", "4K Quality ·", "Audio Only ·", "No Limits ·", "Free Forever ·",
  "YouTube ·", "TikTok ·", "Instagram ·", "Facebook ·", "X (Twitter) ·", "Threads ·",
  "Playlists ·", "4K Quality ·", "Audio Only ·", "No Limits ·", "Free Forever ·",
]

export default function Page() {
  const {
    url, state, platform, videoInfo, playlistItems,
    selectedFormat, error, downloadProgress,
    handleUrlChange, fetchVideoInfo, setSelectedFormat, triggerDownload, reset,
  } = useDownloader()

  const [activeTab, setActiveTab] = useState<"single" | "playlist">("single")
  const showResult = state === "ready" || state === "downloading" || state === "done"
  const isPlaylist = videoInfo?.isPlaylist && platform === "youtube-playlist"

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Grid bg */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Ambient lime orbs */}
      <div
        className="orb-1 fixed top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(190,255,62,0.04) 0%, rgba(190,255,62,0.01) 40%, transparent 70%)" }}
      />
      <div
        className="orb-2 fixed bottom-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(190,255,62,0.03) 0%, rgba(190,255,62,0.01) 40%, transparent 70%)" }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── Navbar ── */}
        <nav className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 md:px-12">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "#BEFF3E", boxShadow: "0 0 16px rgba(190,255,62,0.35)" }}
            >
              <svg viewBox="0 0 20 20" fill="#080808" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v7.44l1.97-1.97a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L6.22 10.28a.75.75 0 111.06-1.06l1.97 1.97V3.75A.75.75 0 0110 3zm-6.5 12.25a.75.75 0 000 1.5h13a.75.75 0 000-1.5h-13z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight">medixoad</span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="underline-lime hover:text-foreground transition-colors">Features</a>
            <a href="#platforms" className="underline-lime hover:text-foreground transition-colors">Platforms</a>
          </div>

          <div
            className="text-xs font-mono px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border text-muted-foreground"
            style={{ borderColor: "rgba(190,255,62,0.2)", background: "rgba(190,255,62,0.04)", color: "#BEFF3E" }}
          >
            Free · No limits
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 pt-6 pb-16 sm:pt-8">

          {/* Eyebrow */}
          <div className="stagger-1 flex items-center gap-2 mb-5 sm:mb-6">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ borderColor: "rgba(190,255,62,0.3)", background: "rgba(190,255,62,0.06)", color: "#BEFF3E" }}
            >
              <span className="w-1.5 h-1.5 rounded-full pulse-ring shrink-0" style={{ background: "#BEFF3E" }} />
              6 Platforms · Completely Free
            </span>
          </div>

          {/* Heading */}
          <h1
            className="stagger-2 text-center font-extrabold leading-[1.05] tracking-tight mb-4 px-2"
            style={{ fontSize: "clamp(2rem, 6vw, 4.8rem)" }}
          >
            Paste a link.
            <br />
            <span className="text-glow-lime" style={{ color: "#BEFF3E" }}>Download it.</span>
            <br />
            <span className="text-foreground/70">That&apos;s literally it.</span>
          </h1>

          {/* Subtitle */}
          <p className="stagger-3 text-center text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mb-8 sm:mb-10 leading-relaxed px-4">
            YouTube, TikTok, Instagram, Facebook, X, Threads — we grab the video,
            you pick the quality. No account. No drama. No ads.
          </p>

          {/* Tab switcher */}
          <div className="stagger-3 w-full max-w-sm sm:max-w-none sm:w-auto flex items-center mb-6 sm:mb-8">
            <div className="flex w-full sm:w-auto gap-1 p-1 rounded-xl border border-border bg-(--surface-2)">
              <button
                onClick={() => { setActiveTab("single"); if (showResult && isPlaylist) reset() }}
                className={cn(
                  "tab-btn flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                  activeTab === "single"
                    ? "active bg-(--surface-3) text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Single Video
              </button>
              <button
                onClick={() => { setActiveTab("playlist"); if (showResult && !isPlaylist) reset() }}
                className={cn(
                  "tab-btn flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
                  activeTab === "playlist"
                    ? "active bg-(--surface-3) text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                  <path d="M2.5 4h11a.5.5 0 010 1h-11a.5.5 0 010-1zM2.5 7.5h11a.5.5 0 010 1h-11a.5.5 0 010-1zM2.5 11h7a.5.5 0 010 1h-7a.5.5 0 010-1z" />
                </svg>
                <span className="hidden xs:inline sm:inline">YouTube </span>Playlist
              </button>
            </div>
          </div>

          {/* URL Input */}
          <div className="stagger-4 w-full max-w-3xl">
            <UrlInput
              url={url}
              state={state}
              platform={platform}
              error={error}
              onChange={handleUrlChange}
              onSubmit={fetchVideoInfo}
            />
          </div>

          {/* Platform badges */}
          <div className="stagger-5 mt-5 sm:mt-6 px-2">
            <PlatformBadges activePlatform={showResult ? platform : undefined} />
          </div>

          {/* Result area */}
          {showResult && videoInfo && (
            <div className="mt-8 sm:mt-12 w-full max-w-3xl space-y-4 sm:space-y-6">
              <VideoResult info={videoInfo} />

              {isPlaylist && playlistItems.length > 0 ? (
                <div className="slide-up stagger-2 rounded-xl border border-border bg-(--surface) p-4 sm:p-5">
                  <PlaylistDownloader playlistInfo={videoInfo} items={playlistItems} />
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-(--surface) p-4 sm:p-5">
                  <FormatSelector
                    formats={videoInfo.formats}
                    selected={selectedFormat}
                    state={state}
                    downloadProgress={downloadProgress}
                    onSelect={setSelectedFormat}
                    onDownload={triggerDownload}
                  />
                </div>
              )}

              {state === "done" && (
                <div className="flex justify-center slide-up pb-2">
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors underline-lime"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
                    </svg>
                    Download something else (we won&apos;t judge)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Playlist mode hint */}
          {activeTab === "playlist" && !showResult && (
            <div className="mt-5 slide-up flex items-start gap-3 px-4 py-3.5 rounded-xl border w-full max-w-lg text-sm"
              style={{ background: "rgba(190,255,62,0.04)", borderColor: "rgba(190,255,62,0.15)", color: "#BEFF3E" }}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-none mt-0.5 shrink-0 opacity-70">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <span className="text-xs sm:text-sm opacity-80">
                Paste a YouTube playlist URL —{" "}
                <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: "rgba(190,255,62,0.1)" }}>
                  youtube.com/playlist?list=…
                </code>
                {" "}and we&apos;ll pull up all the videos so you can pick what you want.
              </span>
            </div>
          )}
        </section>

        {/* ── Marquee ticker ── */}
        <div className="overflow-hidden border-y border-border py-3 mb-2" style={{ borderColor: "#1e1e1e" }}>
          <div className="marquee-track gap-6 text-xs font-mono text-muted-foreground uppercase tracking-widest select-none">
            {MARQUEE_ITEMS.map((item, i) => (
              <span key={i} className="px-3 shrink-0">{item}</span>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <section id="features" className="px-4 py-20 sm:px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center mb-12 sm:mb-14">
              <p className="text-xs font-mono tracking-[0.3em] uppercase mb-3" style={{ color: "#BEFF3E", opacity: 0.6 }}>
                Why medixoad
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center">
                Everything you need.
                <br />
                <span className="text-muted-foreground">Nothing you didn&apos;t ask for.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {FEATURES.map((feat, i) => (
                <div
                  key={feat.title}
                  className={cn(
                    "scanline-hover group p-5 sm:p-6 rounded-xl border border-border bg-(--surface)",
                    "transition-all duration-300 hover:border-[rgba(190,255,62,0.2)]",
                    `stagger-${Math.min(i + 1, 6)}`
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                      style={{
                        color: "#BEFF3E",
                        background: "rgba(190,255,62,0.06)",
                        border: "1px solid rgba(190,255,62,0.15)",
                      }}
                    >
                      {feat.icon}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/50">{feat.num}</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-1.5">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Platforms ── */}
        <section id="platforms" className="px-4 pb-20 sm:px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center mb-10 sm:mb-12">
              <p className="text-xs font-mono tracking-[0.3em] uppercase mb-3" style={{ color: "#BEFF3E", opacity: 0.6 }}>
                Supported Platforms
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
                Works wherever the content lives.
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(["youtube", "tiktok", "instagram", "facebook", "twitter", "threads"] as const).map((id) => {
                const labels: Record<string, string> = {
                  youtube: "YouTube", tiktok: "TikTok", instagram: "Instagram",
                  facebook: "Facebook", twitter: "X (Twitter)", threads: "Threads",
                }
                return (
                  <div
                    key={id}
                    className="platform-badge rounded-xl border border-border bg-(--surface) p-4 sm:p-5 hover:border-[rgba(190,255,62,0.2)] transition-all duration-300 cursor-default"
                  >
                    <p className="font-bold text-sm mb-1">{labels[id]}</p>
                    <p className="text-xs text-muted-foreground">{PLATFORM_QUIPS[id]}</p>
                  </div>
                )
              })}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              More platforms soon — Vimeo, Reddit, Dailymotion &amp; more. Good things take time.
            </p>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="px-4 pb-20 sm:px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center mb-10">
              <p className="text-xs font-mono tracking-[0.3em] uppercase mb-3" style={{ color: "#BEFF3E", opacity: 0.6 }}>
                Embarrassingly simple
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
                Three steps. You can do this.
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Paste the link",
                  desc: "Copy any video URL from YouTube, TikTok, Instagram, Facebook, X, or Threads. The whole URL. All of it.",
                },
                {
                  step: "02",
                  title: "Pick your quality",
                  desc: "4K, 1080p, 720p, audio only — we show you what's available. You decide. No judgment from us.",
                },
                {
                  step: "03",
                  title: "Hit download",
                  desc: "Click the big lime button. The file shows up. You win. That's the whole thing.",
                },
              ].map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="flex items-start gap-4 p-5 rounded-xl border border-border bg-(--surface) transition-all hover:border-[rgba(190,255,62,0.2)]"
                >
                  <div className="step-badge">{step}</div>
                  <div>
                    <h3 className="font-bold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-border px-4 py-6 sm:px-6 sm:py-8 md:px-12">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "#BEFF3E", boxShadow: "0 0 10px rgba(190,255,62,0.3)" }}
              >
                <svg viewBox="0 0 20 20" fill="#080808" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v7.44l1.97-1.97a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L6.22 10.28a.75.75 0 111.06-1.06l1.97 1.97V3.75A.75.75 0 0110 3zm-6.5 12.25a.75.75 0 000 1.5h13a.75.75 0 000-1.5h-13z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-bold">medixoad</span>
            </div>

            <p className="text-xs text-muted-foreground font-mono text-center">
              For personal use only · Respect creators &amp; platform ToS · We definitely read them
            </p>

            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} medixoad
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
