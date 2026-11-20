import styles from "./landing.module.css"

/** Night turns to morning as you scroll past: the sun crests a lit ridge. */
export function SunriseSeam() {
  return (
    <div
      id="sunrise-seam"
      aria-hidden
      className="relative z-0 h-[300px] md:h-[400px]"
      style={{
        background:
          "linear-gradient(180deg, #052338 0%, #0A4D70 26%, #3F7E9E 46%, #C9A58E 64%, #F6D9B8 76%, #F7EBDD 88%, #F2F6F9 100%)",
      }}
    >
      <div className={`${styles.seamSun} absolute bottom-[30px] left-1/2 -ml-[110px] h-[220px] w-[220px] md:bottom-[50px] md:-ml-[160px] md:h-[320px] md:w-[320px]`}>
        <div className="absolute -inset-[90%] rounded-full bg-[radial-gradient(circle,rgba(255,227,163,0.6)_0%,rgba(255,190,77,0.28)_22%,rgba(245,156,122,0.1)_42%,transparent_62%)]" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#FFFDF6_0%,#FFEFC7_26%,#FFD27A_44%,rgba(255,190,77,0.55)_56%,rgba(255,190,77,0)_70%)]" />
      </div>
      <svg aria-hidden viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[110px] w-full md:h-[150px]">
        <path d="M0 96 C 200 60, 420 52, 640 78 C 860 104, 1080 54, 1260 62 C 1350 66, 1410 76, 1440 82 L1440 200 L0 200 Z" fill="#EAD7C6" opacity="0.7" />
        <path d="M0 132 C 240 100, 480 110, 720 128 C 960 146, 1200 104, 1440 116 L1440 200 L0 200 Z" fill="#EFE7E0" />
        <path d="M0 168 C 300 146, 620 152, 900 164 C 1140 174, 1320 160, 1440 156 L1440 200 L0 200 Z" fill="#F2F6F9" />
      </svg>
    </div>
  )
}
