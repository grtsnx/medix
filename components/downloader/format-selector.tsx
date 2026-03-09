"use client"

import { cn } from "@/lib/utils"
import type { FormatOption, DownloaderState } from "@/hooks/use-downloader"

type Props = {
  formats: FormatOption[]
  selected: string | null
  state: DownloaderState
  downloadProgress: number
  onSelect: (id: string) => void
  onDownload: () => void
}

const QUALITY_CONFIG: Record<string, { label: string; color: string }> = {
  "4K":    { label: "BEST",  color: "#BEFF3E" },
  "1080p": { label: "HD",    color: "rgba(190,255,62,0.8)" },
  "720p":  { label: "HD",    color: "rgba(190,255,62,0.65)" },
  "480p":  { label: "SD",    color: "rgba(190,255,62,0.5)" },
  "360p":  { label: "LOW",   color: "rgba(190,255,62,0.38)" },
  audio:   { label: "MP3",   color: "rgba(190,255,62,0.6)" },
}

function FilmIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path fillRule="evenodd" d="M1 4.75C1 3.784 1.784 3 2.75 3h14.5c.966 0 1.75.784 1.75 1.75v10.515a1.75 1.75 0 01-1.75 1.75h-14.5A1.75 1.75 0 011 15.265V4.75zm8.5 5.5a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5zm.5-2.5a.5.5 0 000 1h1a.5.5 0 000-1h-1zm-.5 5a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5z" clipRule="evenodd" />
    </svg>
  )
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v7.44l1.97-1.97a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L6.22 10.28a.75.75 0 111.06-1.06l1.97 1.97V3.75A.75.75 0 0110 3zm-6.5 12.25a.75.75 0 000 1.5h13a.75.75 0 000-1.5h-13z" clipRule="evenodd" />
    </svg>
  )
}

export function FormatSelector({ formats, selected, state, downloadProgress, onSelect, onDownload }: Props) {
  const isDownloading = state === "downloading"
  const isDone = state === "done"
  const selectedFmt = formats.find((f) => f.id === selected)

  return (
    <div className="slide-up w-full space-y-3 stagger-2 no-word-break">
      <h2 className="text-[9px] font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "#BEFF3E", opacity: 0.7 }}>
        Pick Your Quality
      </h2>

      {/* Format grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {formats.map((fmt) => {
          const cfg = QUALITY_CONFIG[fmt.quality] ?? { label: fmt.quality, color: "rgba(190,255,62,0.5)" }
          const isSelected = fmt.id === selected

          return (
            <button
              key={fmt.id}
              onClick={() => onSelect(fmt.id)}
              disabled={isDownloading || isDone}
              className={cn(
                "format-card text-left p-2 rounded-lg border transition-all min-w-0",
                "bg-(--surface-2)",
                isSelected && "selected",
                (isDownloading || isDone) && "opacity-50 cursor-not-allowed"
              )}
              style={{
                borderColor: isSelected ? "rgba(190,255,62,0.5)" : "var(--border)",
              }}
            >
              <div className="flex items-start justify-between mb-1 gap-0.5">
                <span
                  className="flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded border shrink-0 whitespace-nowrap"
                  style={{
                    color: cfg.color,
                    background: "rgba(190,255,62,0.05)",
                    borderColor: "rgba(190,255,62,0.12)",
                  }}
                >
                  {fmt.hasVideo ? <FilmIcon /> : <MusicIcon />}
                  {cfg.label}
                </span>
                {isSelected && (
                  <span
                    className="w-1 h-1 rounded-full mt-0.5 shrink-0"
                    style={{ background: "#BEFF3E" }}
                  />
                )}
              </div>

              <p className="text-[10px] font-bold text-foreground truncate">
                {fmt.hasVideo ? fmt.quality : "MP3"}
              </p>
              <p className="text-[9px] text-muted-foreground font-mono mt-0.5 truncate">
                {fmt.ext.toUpperCase()}{fmt.fps ? ` · ${fmt.fps}fps` : ""}
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{fmt.size}</p>
            </button>
          )
        })}
      </div>

      {/* Download area */}
      <div className="pt-0.5">
        {isDownloading ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground gap-2 min-w-0">
              <span className="truncate">Grabbing {selectedFmt?.label}…</span>
              <span className="shrink-0" style={{ color: "#BEFF3E" }}>{downloadProgress}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-(--surface-3) overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${downloadProgress}%`,
                  background: "#BEFF3E",
                  boxShadow: "0 0 10px rgba(190,255,62,0.5)",
                }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground font-mono text-center animate-pulse">
              Hang tight. This is the exciting part.
            </p>
          </div>
        ) : isDone ? (
          <div
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-semibold text-[10px] whitespace-nowrap"
            style={{
              background: "rgba(190,255,62,0.08)",
              border: "1px solid rgba(190,255,62,0.3)",
              color: "#BEFF3E",
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Done. It&apos;s yours now.
          </div>
        ) : (
          <button
            onClick={onDownload}
            disabled={!selected}
            className={cn(
              "btn-download w-full py-2.5 rounded-lg text-[10px] font-bold tracking-wide",
              "flex items-center justify-center gap-1.5 min-w-0",
              !selected && "opacity-40 cursor-not-allowed transform-none! shadow-none!"
            )}
          >
            <DownloadIcon />
            <span className="truncate">
              Download
              {selectedFmt && (
                <span className="font-normal opacity-70 ml-1.5">
                  {selectedFmt.hasVideo ? selectedFmt.quality : "MP3"} · {selectedFmt.size}
                </span>
              )}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
