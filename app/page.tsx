"use client"

import { useState } from "react"
import { useDownloader } from "@/hooks/use-downloader"
import { VideoResult } from "@/components/downloader/video-result"
import { FormatSelector } from "@/components/downloader/format-selector"
import { PlaylistDownloader } from "@/components/downloader/playlist-downloader"
import { LandingHero } from "@/components/landing/landing-hero"

function Navbar() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 animate-fade-in">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "var(--foreground)", boxShadow: "var(--shadow-sm)" }}
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path
              d="M8 2v9M5 8l3 3 3-3M3 14h10"
              stroke="#F4F1EA"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight">medixoad</span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className="hidden sm:flex items-center gap-2 text-xs font-medium border rounded-full px-3.5 py-1.5"
          style={{
            borderColor: "var(--border)",
            background: "var(--card)",
            color: "var(--muted-foreground)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full pulse-dot"
            style={{ background: "#4CAF72" }}
          />
          Always free
        </span>
      </div>
    </header>
  )
}

function Footer({ hidden }: { hidden?: boolean }) {
  if (hidden) return null
  const platforms = ["YouTube", "TikTok", "Instagram", "Facebook", "X", "Threads"]
  return (
    <footer className="relative z-10 mt-16 pb-12 animate-fade-in delay-560">
      <div className="divider mx-6 md:mx-12 mb-8" />
      <div className="px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground font-mono">
          {platforms.join(" · ")}
        </p>
        <p className="text-xs text-muted-foreground">
          Made with caffeine and poor decisions. © {new Date().getFullYear()} Medixoad.
        </p>
      </div>
    </footer>
  )
}

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 relative z-10">
        <div
          className={
            showResult && videoInfo
              ? "min-h-full lg:grid lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12"
              : "flex flex-col"
          }
        >
          {/* ── Hero / Input column ── */}
          <div
            className={
              showResult && videoInfo
                ? "flex flex-col justify-center lg:min-h-[calc(100vh-80px)]"
                : "flex-1 flex flex-col justify-center"
            }
          >
            <LandingHero
              url={url}
              state={state}
              platform={platform}
              error={error}
              activeTab={activeTab}
              showResult={showResult}
              isPlaylist={!!isPlaylist}
              onUrlChange={handleUrlChange}
              onFetchVideoInfo={fetchVideoInfo}
              onTabChange={setActiveTab}
              onReset={reset}
            />
          </div>

          {/* ── Result column ── */}
          {showResult && videoInfo && (
            <section className="px-6 pb-12 md:px-12 lg:flex lg:flex-col lg:justify-center lg:px-8 xl:px-12 min-w-0 animate-slide-right">
              <div className="max-w-lg space-y-4 lg:max-w-md min-w-0">
                <VideoResult info={videoInfo} url={url} />

                {isPlaylist && playlistItems.length > 0 ? (
                  <div
                    className="rounded-2xl border p-5 animate-fade-up delay-160"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
                    <PlaylistDownloader playlistInfo={videoInfo} items={playlistItems} />
                  </div>
                ) : (
                  <div
                    className="rounded-2xl border p-5 animate-fade-up delay-160"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
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
                  <div className="flex justify-center animate-fade-up">
                    <button
                      onClick={reset}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors hover-underline"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path
                          fillRule="evenodd"
                          d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Run it back (no judgment)
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer hidden={showResult && !!videoInfo} />
    </div>
  )
}
