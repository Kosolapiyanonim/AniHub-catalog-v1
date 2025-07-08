import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ApiStatus } from "@/components/api-status"
import { Header } from "@/components/header"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "AniHub - Смотреть аниме онлайн",
  description: "Лучшая коллекция аниме в высоком качестве. Смотрите любимые аниме бесплатно.",
  keywords: "аниме, смотреть онлайн, бесплатно, HD качество",
  verification: {
    google: "XkUCPjQmoapTDDjIMH0zRCUkEE_Cr2bgltjo-ZlnDDs",
  },
  generator: "v0.dev",
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

        <Suspense fallback={null}>
          <div className="min-h-screen bg-slate-950">
            <Header />
            {children}
            <ApiStatus />
          </div>
        </Suspense>
        <SpeedInsights />
        <Analytics />

        {/* v0 – built-with badge */}
        <div
          dangerouslySetInnerHTML={{
            __html: `<div id="v0-built-with-button-a956b96c-742a-4553-b661-76b33978cea4" style="
border: 1px solid hsl(0deg 0% 100% / 12%);
position: fixed;
bottom: 24px;
right: 24px;
z-index: 1000;
background: #121212;
color: white;
padding: 8px 12px;
border-radius: 8px;
font-weight: 400;
font-size: 14px;
box-shadow: 0 2px 8px rgba(0,0,0,0.12);
letter-spacing: 0.02em;
transition: all 0.2s;
display: flex;
align-items: center;
gap: 4px;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
">
<a
 href="https://v0.dev/chat/api/open/built-with-v0/b_gOWtPcZkXrL"
 target="_blank"
 rel="noopener noreferrer"
 style="
   color: inherit;
   text-decoration: none;
   display: flex;
   align-items: center;
   gap: 4px;
 "
>
 Built with
 <svg
   fill="currentColor"
   viewBox="0 0 40 20"
   xmlns="http://www.w3.org/2000/svg"
   style="width: 20px; height: 20px;"
 >
   <path d="M23.3919 0H32.9188C36.7819 0 39.9136 3.13165 39.9136 6.99475V16.0805H36.0006V6.99475C36.0006 6.90167 35.9969 6.80925 35.9898 6.71766L26.4628 16.079C26.4949 16.08 26.5272 16.0805 26.5595 16.0805H36.0006V19.7762H26.5595C22.6964 19.7762 19.4788 16.6139 19.4788 12.7508V3.68923H23.3919V12.7508C23.3919 12.9253 23.4054 13.0977 23.4316 13.2668L33.1682 3.6995C33.0861 3.6927 33.003 3.68923 32.9188 3.68923H23.3919V0Z" />
   <path d="M13.7688 19.0956L0 3.68759H5.53933L13.6231 12.7337V3.68759H17.7535V17.5746C17.7535 19.6705 15.1654 20.6584 13.7688 19.0956Z" />
 </svg>
</a>

<button
 onclick="document.getElementById('v0-built-with-button-a956b96c-742a-4553-b661-76b33978cea4').style.display='none'"
 onmouseenter="this.style.opacity='1'"
 onmouseleave="this.style.opacity='0.7'"
 style="
   background: none;
   border: none;
   color: white;
   cursor: pointer;
   padding: 2px;
   margin-left: 4px;
   border-radius: 2px;
   display: flex;
   align-items: center;
   opacity: 0.7;
   transition: opacity 0.2s;
   transform: translateZ(0);
 "
 aria-label="Close"
>
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
   <path d="M18 6L6 18M6 6l12 12"/>
 </svg>
</button>

<span style="
 position: absolute;
 width: 1px;
 height: 1px;
 padding: 0;
 margin: -1px;
 overflow: hidden;
 clip: rect(0, 0, 0, 0);
 white-space: nowrap;
">
 v0
</span>
</div>`,
          }}
        />
      </body>
    </html>
  )
}
