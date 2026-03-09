"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import type { VideoInfo } from "@/hooks/use-downloader"

type Props = {
  info: VideoInfo
  className?: string
}

const PLATFORM_LABEL: Record<string, string> = {
  youtube: "YouTube",
  "youtube-playlist": "YouTube Playlist",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X (Twitter)",
  threads: "Threads",
}

function StatPill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
      {icon}
      {value}
    </span>
  )
}

const EyeIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
  </svg>
)

const LikeIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
  </svg>
)

const PlaylistIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.493 2.493 0 00-.25-.032L5.25 4.5A2.5 2.5 0 002.75 7H2.5V3.34a.75.75 0 01.628-.74zM17.25 6.5a2 2 0 00-2-2H4.75a2 2 0 00-2 2v6a2 2 0 002 2h10.5a2 2 0 002-2v-6z" clipRule="evenodd" />
  </svg>
)

export function VideoResult({ info, className }: Props) {
  const platformLabel = PLATFORM_LABEL[info.platform] ?? info.platform

  return (
    <div className={cn("slide-up w-full", className)}>
      <div
        className="scanline-hover rounded-xl border overflow-hidden"
        style={{
          background: "var(--surface)",
          borderColor: "rgba(190,255,62,0.15)",
          boxShadow: "0 4px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(190,255,62,0.05)",
        }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="relative sm:w-56 md:w-64 flex-none aspect-video sm:aspect-auto overflow-hidden bg-(--surface-2)">
            <Image
              src={info.thumbnail}
              alt={info.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent sm:bg-linear-to-r" />

            {info.duration !== "—" && (
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-mono px-1.5 py-0.5 rounded">
                {info.duration}
              </span>
            )}
            <span
              className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded backdrop-blur-sm"
              style={{
                background: "rgba(190,255,62,0.15)",
                color: "#BEFF3E",
                border: "1px solid rgba(190,255,62,0.3)",
              }}
            >
              {platformLabel}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3 min-w-0">
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-snug line-clamp-2 text-foreground">
                {info.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{info.author}</p>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {info.views !== "—" && <StatPill icon={<EyeIcon />} value={info.views} />}
              {info.likes !== "—" && <StatPill icon={<LikeIcon />} value={info.likes} />}
              {info.isPlaylist && info.playlistCount && (
                <StatPill icon={<PlaylistIcon />} value={`${info.playlistCount} videos`} />
              )}
            </div>

            {info.isPlaylist && (
              <div
                className="flex items-start gap-2 px-3 py-2 rounded-lg"
                style={{ background: "rgba(190,255,62,0.05)", border: "1px solid rgba(190,255,62,0.15)" }}
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-none mt-0.5" style={{ color: "#BEFF3E", opacity: 0.7 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h8.25a1.875 1.875 0 010 3.75h-8.25a1.875 1.875 0 010-3.75z" />
                </svg>
                <p className="text-xs text-muted-foreground">
                  Playlist —{" "}
                  <span className="font-medium" style={{ color: "#BEFF3E" }}>select videos to download below</span>
                </p>
              </div>
            )}

            <div className="mt-auto flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full pulse-ring shrink-0" style={{ background: "#BEFF3E" }} />
              <span className="text-xs font-mono" style={{ color: "#BEFF3E", opacity: 0.7 }}>Ready to download</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
