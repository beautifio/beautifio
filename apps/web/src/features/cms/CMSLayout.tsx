"use client"

import { ReactNode } from "react"
import { TopHeader } from "./TopHeader"
import { Sidebar } from "./Sidebar"
import { SEOPanel } from "./SEOPanel"
import { CMSProvider } from "./CMSContext"

type Props = { children: ReactNode; title?: string }

export function CMSLayout({ children, title = "Untitled" }: Props) {
  return (
    <CMSProvider>
      <div className="h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
        <TopHeader />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex min-w-0">
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
            <SEOPanel />
          </main>
        </div>
      </div>
    </CMSProvider>
  )
}
