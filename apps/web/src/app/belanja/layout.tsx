import { MainTopBar } from "@/components/layout/MainTopBar"

export default function BelanjaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainTopBar />
      {children}
    </>
  )
}
