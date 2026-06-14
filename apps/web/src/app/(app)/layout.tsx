import { NavWrapper } from "@/components/NavWrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <NavWrapper>{children}</NavWrapper>;
}
