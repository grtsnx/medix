import { Syne, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["300", "400", "500", "600"],
})

export const metadata = {
  title: "Medixoad — Download Anything",
  description: "Download videos from YouTube, TikTok, Instagram, X, Facebook, Threads. Fast, free, no limits.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(syne.variable, jetbrainsMono.variable)}
    >
      <body className="grain">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
