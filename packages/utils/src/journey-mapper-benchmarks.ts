import type { JmBenchmark } from "./journey-mapper-types";

export const JM_BENCHMARKS: JmBenchmark[] = [
  // Fotografer olahraga
  { professionCode: "P010", name: "Robertus Pudyanto", context: "Fotografer Getty Images Indonesia spesialis olahraga", platform: "Instagram: @robertuspudyanto" },
  { professionCode: "P010", name: "Bob Martin", context: "Fotografer Sports Illustrated — action photography terbaik dunia", platform: "Website: bobmartinsports.com" },
  { professionCode: "P010", name: "Yudha Foto", context: "Fotografer sepakbola Indonesia aktif", platform: "Instagram: @yudhafoto" },

  // Videografer konten olahraga
  { professionCode: "P011", name: "Tifo Football", context: "Kanal YouTube analisis taktik sepakbola visual terbaik", platform: "YouTube: Tifo Football" },
  { professionCode: "P011", name: "Bung Towel", context: "Komentator & kreator konten olahraga Indonesia", platform: "YouTube: Bung Towel" },
  { professionCode: "P011", name: "Andi Hasrun", context: "Kreator konten sepakbola Indonesia", platform: "Instagram/YouTube: Andi Hasrun" },

  // Jurnalis olahraga
  { professionCode: "P012", name: "Harun Soharno", context: "Jurnalis olahraga senior Kompas", platform: "Kompas.com/sport" },
  { professionCode: "P012", name: "Iqbal Fadli", context: "Reporter Bolasport, liputan pertandingan langsung", platform: "Bolasport.com" },
  { professionCode: "P012", name: "Jonathan Wilson", context: "Penulis analisis sepakbola — Inverting the Pyramid", platform: "The Guardian" },

  // Komentator
  { professionCode: "P013", name: "Valentino Simanjuntak", context: "Komentator sepakbola senior Indonesia", platform: "Indosiar/Vidio" },
  { professionCode: "P013", name: "Bung Kusnaeni", context: "Pundit analisis taktis sepakbola", platform: "TVRI/Indosiar" },
  { professionCode: "P013", name: "Gary Neville", context: "Mantan pemain Man United jadi pundit Sky Sports terbaik", platform: "YouTube: Sky Sports" },

  // Analis data olahraga
  { professionCode: "P004", name: "Ted Knutson", context: "Founder StatsBomb, pioneer analitik sepakbola", platform: "X: @mixedknuts" },
  { professionCode: "P004", name: "Javier Fernández", context: "Data scientist FC Barcelona", platform: "statsbomb.com" },
  { professionCode: "P004", name: "Omar Chaudhuri", context: "Chief Intelligence Officer Eleven Sports", platform: "X: @11tegen11" },

  // Agen pemain
  { professionCode: "P009", name: "Jorge Mendes", context: "Agen terbesar dunia (Ronaldo, Mourinho)", platform: "YouTube dokumenter" },
  { professionCode: "P009", name: "Tara Derifatoni", context: "Vice GM PSS Sleman — jalur komunitas ke manajemen", platform: "@taradfs" },

  // Health content creator
  { professionCode: "P026", name: "dr. Tirta", context: "Dokter yang jadi influencer kesehatan terbesar Indonesia", platform: "@drtirta" },
  { professionCode: "P026", name: "Tan Shot Yen", context: "Dokter gizi, penulis, pembicara", platform: "@tanshotyen" },
  { professionCode: "P026", name: "dr. Zaidul Akbar", context: "Konten islami + kesehatan + gizi", platform: "YouTube dr. Zaidul Akbar" },

  // Founder edtech
  { professionCode: "P036", name: "Ivan Cahyadi", context: "Founder Zenius — edtech Indonesia", platform: "@ivancahyadi" },
  { professionCode: "P036", name: "Nadiem Makarim", context: "Founder Gojek yang masuk ke ekosistem edukasi", platform: "konteks publik" },
  { professionCode: "P036", name: "Sal Khan", context: "Founder Khan Academy — inspirasi global konten edukasi gratis", platform: "YouTube Khan Academy" },

  // Konten kreator
  { professionCode: "P056", name: "Raditya Dika", context: "Pioneer kreator konten komedi Indonesia", platform: "YouTube: Raditya Dika" },
  { professionCode: "P056", name: "Rachel Vennya", context: "Kreator konten gaya hidup miliaran", platform: "@rachelvennya" },

  // Brand strategist
  { professionCode: "P062", name: "Yoris Sebastian", context: "Creative director & brand strategist Indonesia", platform: "@yorissebastian" },
  { professionCode: "P062", name: "Mark Ritson", context: "Brand strategist global", platform: "marketingweek.com" },
  { professionCode: "P062", name: "Hermawan Kartajaya", context: "Bapak marketing Indonesia — Marketing 3.0", platform: "buku & seminar" },

  // Food content creator
  { professionCode: "P087", name: "Nex Carlos", context: "Kreator konten kuliner Indonesia — jutaan subscriber", platform: "YouTube: Nex Carlos" },
  { professionCode: "P087", name: "Devina Hermawan", context: "Chef rumahan jadi kreator masak terbesar Indonesia", platform: "YouTube: Devina Hermawan" },
  { professionCode: "P087", name: "Joshua Weissman", context: "Kreator kuliner internasional", platform: "YouTube: Joshua Weissman" },

  // UI/UX designer
  { professionCode: "P075", name: "Irene Au", context: "Design lead Google & Yahoo — standar UX global", platform: "Medium: Irene Au" },
  { professionCode: "P075", name: "Kevin Gim", context: "UI/UX designer Indonesia aktif berbagi ilmu", platform: "@kevingim_" },

  // Product manager
  { professionCode: "P072", name: "Gojek Product Team", context: "Benchmark PM di ekosistem startup Asia Tenggara", platform: "Medium Gojek" },
  { professionCode: "P072", name: "Lenny Rachitsky", context: "Newsletter product management terbaik dunia", platform: "lennysnewsletter.com" },
  { professionCode: "P072", name: "Marty Cagan", context: "Penulis 'Inspired' — bible-nya product management", platform: "svpg.com" },
];

export function getJmBenchmarks(professionCode: string): JmBenchmark[] {
  return JM_BENCHMARKS.filter((b) => b.professionCode === professionCode);
}
