import { Bricolage_Grotesque, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400", "600", "700", "800"],
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
})

export const metadata = {
  title: "Medixoad — Download Anything",
  description: "Paste a link. Get the file. Tell everyone it's research.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        bricolage.variable,
        plusJakarta.variable,
        jetbrainsMono.variable,
      )}
    >
      <body>{children}</body>
    </html>
  )
}
