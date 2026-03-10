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

type QualityConfig = {
  label: string
  color: string
  bg: string
  border: string
}

const QUALITY_CONFIG: Record<string, QualityConfig> = {
  "4K":    { label: "4K",    color: "#4169E0", bg: "rgba(65,105,224,0.10)", border: "rgba(65,105,224,0.25)" },
  "1080p": { label: "1080p", color: "#4169E0", bg: "rgba(65,105,224,0.08)", border: "rgba(65,105,224,0.20)" },
  "720p":  { label: "720p",  color: "#6B87E8", bg: "rgba(107,135,232,0.07)", border: "rgba(107,135,232,0.18)" },
  "480p":  { label: "480p",  color: "#9A9285", bg: "rgba(154,146,133,0.07)", border: "rgba(154,146,133,0.2)" },
  "360p":  { label: "360p",  color: "#B8B0A5", bg: "transparent",            border: "var(--border)" },
  audio:   { label: "MP3",   color: "#C27A3A", bg: "rgba(194,122,58,0.08)", border: "rgba(194,122,58,0.22)" },
}

function FilmIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path
        fillRule="evenodd"
        d="M1 4.75C1 3.784 1.784 3 2.75 3h14.5c.966 0 1.75.784 1.75 1.75v10.515a1.75 1.75 0 01-1.75 1.75h-14.5A1.75 1.75 0 011 15.265V4.75zm8.5 5.5a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5zm.5-2.5a.5.5 0 000 1h1a.5.5 0 000-1h-1zm-.5 5a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5z"
        clipRule="evenodd"
      />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function FormatSelector({ formats, selected, state, downloadProgress, onSelect, onDownload }: Props) {
  const isDownloading = state === "downloading"
  const isDone        = state === "done"
  const selectedFmt   = formats.find((f) => f.id === selected)

  return (
    <div className="animate-fade-up w-full space-y-4 no-word-break">

      {/* ── Section label ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Pick your flavor
        </h2>
        {selectedFmt && (
          <span className="text-xs text-muted-foreground font-mono">
            {selectedFmt.hasVideo ? selectedFmt.quality : "MP3"} · {selectedFmt.size}
          </span>
        )}
      </div>

      {/* ── Format grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {formats.map((fmt) => {
          const cfg = QUALITY_CONFIG[fmt.quality] ?? {
            label: fmt.quality,
            color: "var(--muted-foreground)",
            bg: "transparent",
            border: "var(--border)",
          }
          const isSelected = fmt.id === selected

          return (
            <button
              key={fmt.id}
              onClick={() => onSelect(fmt.id)}
              disabled={isDownloading || isDone}
              className={cn(
                "format-card text-left p-3 rounded-xl border transition-all min-w-0",
                isSelected && "selected",
                (isDownloading || isDone) && "opacity-50 cursor-not-allowed",
              )}
              style={{
                background: isSelected ? undefined : "var(--card)",
                borderColor: isSelected ? undefined : "var(--border)",
              }}
            >
              {/* Quality badge row */}
              <div className="flex items-center justify-between mb-2 gap-1">
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border"
                  style={{
                    color:            isSelected ? "var(--cobalt)" : cfg.color,
                    background:       isSelected ? "var(--cobalt-dim)" : cfg.bg,
                    borderColor:      isSelected ? "var(--cobalt-border)" : cfg.border,
                  }}
                >
                  {fmt.hasVideo ? <FilmIcon /> : <MusicIcon />}
                  {cfg.label}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--cobalt)" }} />
                )}
              </div>

              <p className="text-xs font-semibold text-foreground truncate">
                {fmt.hasVideo ? fmt.quality : "Audio Only"}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                {fmt.ext.toUpperCase()}{fmt.fps ? ` · ${fmt.fps}fps` : ""}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{fmt.size}</p>
            </button>
          )
        })}
      </div>

      {/* ── Download area ── */}
      <div className="pt-1">
        {isDownloading ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono gap-2 min-w-0">
              <span className="text-muted-foreground truncate">
                Grabbing {selectedFmt?.hasVideo ? selectedFmt?.quality : "MP3"}…
              </span>
              <span className="shrink-0 font-semibold" style={{ color: "var(--cobalt)" }}>
                {downloadProgress}%
              </span>
            </div>
            <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${downloadProgress}%`,
                  background: "var(--cobalt)",
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground font-mono text-center animate-pulse">
              Hang tight. This is the exciting part.
            </p>
          </div>
        ) : isDone ? (
          <div
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm animate-scale-up"
            style={{
              background: "rgba(76,175,114,0.09)",
              border: "1px solid rgba(76,175,114,0.3)",
              color: "#3A8C5C",
            }}
          >
            <CheckIcon />
            Filed under: definitely research.
          </div>
        ) : (
          <button
            onClick={onDownload}
            disabled={!selected}
            className={cn(
              "btn-primary w-full py-3 rounded-xl text-sm",
              "flex items-center justify-center gap-2 min-w-0",
            )}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-none">
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            <span className="truncate">
              Download
              {selectedFmt && (
                <span className="font-normal opacity-60 ml-1.5">
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
