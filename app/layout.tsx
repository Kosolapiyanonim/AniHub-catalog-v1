import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "AniHub - Смотреть аниме онлайн",
  description: "Лучший сайт для просмотра аниме онлайн. Большая коллекция аниме с русской озвучкой и субтитрами.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T9PCT7WV');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3DCGBWLNEZ"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3DCGBWLNEZ');
            `,
          }}
        />

        {/* Critical CSS для быстрого рендера */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body { 
              background-color: #0f172a; 
              color: white; 
              font-family: ${inter.style.fontFamily}; 
            }
            .container { max-width: 1200px; margin: 0 auto; }
            .aspect-\\[2\\/3\\] { aspect-ratio: 2/3; }
            .line-clamp-2 { 
              display: -webkit-box; 
              -webkit-line-clamp: 2; 
              -webkit-box-orient: vertical; 
              overflow: hidden; 
            }
          `,
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T9PCT7WV"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <div className="min-h-screen bg-slate-950 text-white">
              <Header />
              <main>{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
