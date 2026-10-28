import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NavWrapper } from "@/components/NavWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";


// Vendored locally (next/font/local) so builds don't fetch Google Fonts — the VPS
// build network times out on fonts.gstatic.com, which made every build ~10min.
const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "./fonts/Poppins-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Poppins-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Poppins-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Poppins-800.woff2", weight: "800", style: "normal" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [{ path: "./fonts/Inter.woff2", weight: "100 900", style: "normal" }],
});

export const metadata: Metadata = {
  title: "Beautifio — Masa Depan Dimulai Hari Ini",
  description:
    "Beautifio membantu anak muda menemukan arah hidup, peluang, mentor, dan komunitas yang tepat untuk masa depan yang lebih baik.",
  icons: {
    icon: [{ url: "/api/site/favicon", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/api/site/favicon", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#084463" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Beautifio" />
        <link rel="apple-touch-icon" href="/api/site/favicon" />
        <Script id="sw-register" strategy="afterInteractive">
          {`/* SW disabled */`}
        </Script>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-ELGS89K881" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-ELGS89K881');`}
        </Script>
      </head>
      <body className={`${poppins.variable} ${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <Providers>
            <NavWrapper>{children}</NavWrapper>
          </Providers>
        </ErrorBoundary>
        <SpeedInsights />
      </body>
    </html>
  );
}
