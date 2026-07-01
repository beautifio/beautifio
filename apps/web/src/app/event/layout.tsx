import { MainTopBar } from "@/components/layout/MainTopBar"

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainTopBar />
      {children}
    </>
  )
}
