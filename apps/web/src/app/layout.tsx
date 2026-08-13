import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NavWrapper } from "@/components/NavWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
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
