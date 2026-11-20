/** Marks which part of the hero promise a chapter answers. */
export function ChapterLabel({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p
      className={`inline-flex items-center gap-2 text-sm font-semibold ${tone === "dark" ? "text-fajar-glow" : "text-[#9A6300]"}`}
    >
      <span
        aria-hidden
        className="h-2 w-2 rounded-full bg-fajar shadow-[0_0_0_4px_rgba(255,190,77,0.2),0_0_12px_rgba(255,190,77,0.8)]"
      />
      {children}
    </p>
  )
}
