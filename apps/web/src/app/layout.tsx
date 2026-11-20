import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NavWrapper } from "@/components/NavWrapper";


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

const fredoka = localFont({
  variable: "--font-fredoka",
  display: "swap",
  src: [{ path: "./fonts/Fredoka-Variable.woff2", weight: "500 700", style: "normal" }],
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
      <body className={`${poppins.variable} ${inter.variable} ${fredoka.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <Providers>
            <NavWrapper>{children}</NavWrapper>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
