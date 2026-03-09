"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { PlaylistItem, VideoInfo } from "@/hooks/use-downloader"

type Props = {
  playlistInfo: VideoInfo
  items: PlaylistItem[]
}

const QUALITY_OPTIONS = [
  { id: "1080p", label: "1080p" },
  { id: "720p",  label: "720p" },
  { id: "480p",  label: "480p" },
  { id: "audio", label: "MP3 Only" },
]

export function PlaylistDownloader({ playlistInfo, items }: Props) {
  const [quality, setQuality] = useState("1080p")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(items.map((i) => i.id)))
  const [isDownloading, setIsDownloading] = useState(false)
  const [done, setDone] = useState(false)

  const allSelected = selectedIds.size === items.length
  const noneSelected = selectedIds.size === 0

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(items.map((i) => i.id)))
  }

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleDownload() {
    if (noneSelected) return
    setIsDownloading(true)
    await new Promise((r) => setTimeout(r, 2400))
    setIsDownloading(false)
    setDone(true)
  }

  return (
    <div className="slide-up w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground line-clamp-1">
            {playlistInfo.playlistTitle ?? playlistInfo.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {playlistInfo.author} · {playlistInfo.playlistCount} videos
          </p>
        </div>

        {/* Quality tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono shrink-0">Quality:</span>
          <div className="flex gap-1 flex-wrap">
            {QUALITY_OPTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => setQuality(q.id)}
                disabled={isDownloading || done}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold border transition-all"
                )}
                style={
                  quality === q.id
                    ? {
                        borderColor: "rgba(190,255,62,0.5)",
                        background: "rgba(190,255,62,0.08)",
                        color: "#BEFF3E",
                      }
                    : {
                        borderColor: "var(--border)",
                        background: "var(--surface-2)",
                        color: "var(--muted-foreground)",
                      }
                }
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Select-all bar */}
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-(--surface-2) border border-border">
        <button onClick={toggleAll} className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            className="w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0"
            style={
              allSelected
                ? { background: "#BEFF3E", borderColor: "#BEFF3E" }
                : { borderColor: "var(--border)", background: "transparent" }
            }
          >
            {allSelected && (
              <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5 text-[#080808]">
                <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
              </svg>
            )}
          </div>
          <span className="text-sm text-foreground">
            {allSelected ? "Everything selected (bold move)" : `${selectedIds.size} of ${items.length} picked`}
          </span>
        </button>

        {done ? (
          <span className="flex items-center gap-1.5 text-xs font-medium shrink-0" style={{ color: "#BEFF3E" }}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            All done!
          </span>
        ) : (
          <button
            onClick={handleDownload}
            disabled={isDownloading || noneSelected}
            className={cn(
              "btn-download px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0",
              (isDownloading || noneSelected) && "opacity-40 cursor-not-allowed transform-none! shadow-none!"
            )}
          >
            {isDownloading ? (
              <>
                <span className="w-3 h-3 spin-loader" style={{ borderTopColor: "#080808" }} />
                Working on it…
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M8 2a.75.75 0 01.75.75v6.19l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V2.75A.75.75 0 018 2zM2.75 13a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H2.75z" clipRule="evenodd" />
                </svg>
                {selectedIds.size > 0 ? `Grab ${selectedIds.size} Videos` : "Select some first"}
              </>
            )}
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="space-y-0.5 max-h-[380px] overflow-y-auto -mx-1 px-1">
        {items.map((item) => {
          const isChecked = selectedIds.has(item.id)
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="playlist-item flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 cursor-pointer"
            >
              {/* Checkbox */}
              <div
                className="w-4 h-4 rounded border flex-none flex items-center justify-center transition-all"
                style={
                  isChecked
                    ? { background: "#BEFF3E", borderColor: "#BEFF3E" }
                    : { borderColor: "var(--border)", background: "transparent" }
                }
              >
                {isChecked && (
                  <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5 text-[#080808]">
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                )}
              </div>

              {/* Index */}
              <span className="hidden sm:block w-5 text-center text-xs text-muted-foreground font-mono flex-none">
                {item.index}
              </span>

              {/* Thumbnail */}
              <div className="relative w-12 h-8 sm:w-14 sm:h-9 rounded overflow-hidden bg-(--surface-3) flex-none">
                <Image src={item.thumbnail} alt={item.title} fill className="object-cover" unoptimized />
              </div>

              {/* Title + duration */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground font-mono">{item.duration}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground font-mono">
        {selectedIds.size} video{selectedIds.size !== 1 ? "s" : ""} selected ·{" "}
        {QUALITY_OPTIONS.find((q) => q.id === quality)?.label}
        {noneSelected ? " · Pick something, anything." : ""}
      </p>
    </div>
  )
}
