import { MainTopBar } from "@/components/layout/MainTopBar"

export default function TesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainTopBar />
      {children}
    </>
  )
}
