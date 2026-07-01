import { MainTopBar } from "@/components/layout/MainTopBar"

export default function VoucherLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainTopBar />
      {children}
    </>
  )
}
