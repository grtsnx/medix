"use client"

import { useState } from "react"
import { useDownloader } from "@/hooks/use-downloader"
import { VideoResult } from "@/components/downloader/video-result"
import { FormatSelector } from "@/components/downloader/format-selector"
import { PlaylistDownloader } from "@/components/downloader/playlist-downloader"
import { LandingHero } from "@/components/landing/landing-hero"

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
    <div className="min-h-screen bg-background">
      {/* Grid bg */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      <div
        className={
          showResult && videoInfo
            ? "relative z-10 grain min-h-screen lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16"
            : "relative z-10 grain min-h-screen flex flex-col"
        }
      >
        {/* ── Hero column ── */}
        <div
          className={
            showResult && videoInfo
              ? "flex flex-col justify-center"
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
            isPlaylist={isPlaylist}
            onUrlChange={handleUrlChange}
            onFetchVideoInfo={fetchVideoInfo}
            onTabChange={setActiveTab}
            onReset={reset}
          />
        </div>

        {/* ── Result column (desktop: side-by-side; mobile: below) ── */}
        {showResult && videoInfo && (
          <section className="px-8 pb-10 md:px-16 lg:flex lg:flex-col lg:justify-center lg:px-12 xl:px-16 min-w-0">
            <div className="max-w-xl space-y-3 lg:max-w-sm min-w-0">
              <VideoResult info={videoInfo} />

              {isPlaylist && playlistItems.length > 0 ? (
                <div className="slide-up stagger-2 rounded-xl border border-border bg-(--surface) p-4">
                  <PlaylistDownloader playlistInfo={videoInfo} items={playlistItems} />
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-(--surface) p-4">
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
                <div className="flex justify-center slide-up">
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors underline-lime"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
                    </svg>
                    Download something else
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
