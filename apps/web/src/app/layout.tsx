import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Beautifio — Masa Depan Dimulai Hari Ini",
  description:
    "Beautifio membantu anak muda menemukan arah hidup, peluang, mentor, dan komunitas yang tepat untuk masa depan yang lebih baik.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
