import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Check, ChevronDown, Sparkles, Users, Target, Compass,
  Star, Quote, Menu, X, Mail, Send, HeartHandshake, Lightbulb,
  ChevronRight, Layers, MessageCircle, Building2, ChevronLeft
} from "lucide-react";

const navLinks = [
  { id: "hero", label: "Beranda" },
  { id: "fitur", label: "Fitur" },
  { id: "circle", label: "Circle" },
  { id: "peluang", label: "Peluang" },
  { id: "mentor", label: "Mentor" },
  { id: "faq", label: "FAQ" },
];

const fitur = [
  {
    icon: Target,
    title: "Goal Selection",
    desc: "Tentukan tujuan hidupmu — karir, pendidikan, atau skill — dan kami bantu buat peta jalannya.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Users,
    title: "Circle",
    desc: "Temukan dan bergabung dengan komunitas yang sefrekuensi dengan minat dan tujuanmu.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Layers,
    title: "Roadmap",
    desc: "Dapatkan panduan langkah demi langkah yang personal untuk mencapai setiap milestone.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Compass,
    title: "Opportunity Hub",
    desc: "Akses beasiswa, magang, kompetisi, dan workshop yang relevan dengan perjalananmu.",
    color: "bg-accent/10 text-accent",
  },
];

const circles = [
  {
    name: "Tech Founders",
    members: 340,
    desc: "Bagi kamu yang ingin membangun startup teknologi dari nol.",
    tag: "Kewirausahaan",
    color: "bg-blue-50 text-blue-600",
  },
  {
    name: "Creative Lab",
    members: 280,
    desc: "Ruang berkarya untuk desainer, penulis, content creator, dan seniman.",
    tag: "Kreatif",
    color: "bg-purple-50 text-purple-600",
  },
  {
    name: "Future Leaders",
    members: 510,
    desc: "Kaderisasi kepemimpinan muda untuk perubahan sosial yang berdampak.",
    tag: "Kepemimpinan",
    color: "bg-amber-50 text-amber-600",
  },
  {
    name: "Green Warriors",
    members: 195,
    desc: "Komunitas peduli lingkungan dengan aksi nyata dan edukasi berkelanjutan.",
    tag: "Lingkungan",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const opportunities = [
  {
    title: "Beasiswa Prestasi 2026",
    org: "Yayasan Nusantara Cerdas",
    type: "Beasiswa",
    deadline: "30 Jun 2026",
    icon: Sparkles,
  },
  {
    title: "Program Magang Frontend",
    org: "TechStart Indonesia",
    type: "Magang",
    deadline: "15 Jul 2026",
    icon: Building2,
  },
  {
    title: "Lomba Inovasi Sosial",
    org: "Kemenpora RI",
    type: "Kompetisi",
    deadline: "20 Agu 2026",
    icon: Lightbulb,
  },
  {
    title: "Workshop AI untuk Pemula",
    org: "AI Academy ID",
    type: "Workshop",
    deadline: "5 Sep 2026",
    icon: MessageCircle,
  },
];

const mentors = [
  {
    name: "Rina Amalia",
    role: "Tech Lead di Google",
    expertise: "Teknologi, Karir",
    avatar: "RA",
    color: "from-secondary to-primary",
  },
  {
    name: "Dimas Pratama",
    role: "Founder & CEO StartupEd",
    expertise: "Kewirausahaan, Bisnis",
    avatar: "DP",
    color: "from-secondary to-primary",
  },
  {
    name: "Sari Indahwati",
    role: "Psikolog Klinis",
    expertise: "Mental Health, Pengembangan Diri",
    avatar: "SI",
    color: "from-secondary to-primary",
  },
];

const faqs = [
  {
    q: "Apa itu Beautifio?",
    a: "Beautifio adalah platform pengembangan diri untuk anak muda Indonesia. Kami membantu kamu menemukan arah hidup, terhubung dengan komunitas yang tepat, mendapatkan mentor, dan mengakses peluang masa depan — semua dalam satu tempat.",
  },
  {
    q: "Apakah Beautifio gratis?",
    a: "Ya! Beautifio gratis untuk semua pengguna. Fitur dasar seperti bergabung dengan circle, mengakses roadmap, dan melihat peluang dapat digunakan tanpa biaya.",
  },
  {
    q: "Bagaimana cara bergabung dengan circle?",
    a: "Cukup daftar akun, lengkapi profil dan tujuanmu, lalu kamu akan dicocokkan dengan circle yang paling sesuai. Kamu juga bisa menjelajah dan bergabung dengan circle mana pun secara manual.",
  },
  {
    q: "Apakah mentor benar-benar aktif?",
    a: "Semua mentor di Beautifio adalah profesional yang telah melewati proses verifikasi. Mereka aktif memberikan bimbingan secara berkala, menjawab pertanyaan, dan mengadakan sesi mingguan.",
  },
  {
    q: "Kapan Beautifio resmi diluncurkan?",
    a: "Kami sedang dalam tahap pengembangan akhir. Daftarkan emailmu untuk mendapat notifikasi peluncuran dan akses early bird eksklusif!",
  },
];

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

function FadeIn({ children, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({ label, title, subtitle }) {
  return (
    <div className="text-center mb-10 md:mb-12 px-6">
      <span className="inline-block text-xs font-semibold tracking-[0.15em] text-secondary uppercase mb-3">
        {label}
      </span>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1E293B] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm md:text-base text-[#64748B] max-w-lg mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Navbar({ mobileOpen, setMobileOpen }) {
  const scrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => scrollTo("hero")} className="text-xl font-extrabold tracking-tight text-primary">
          Beautifio
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm font-medium text-[#64748B] hover:text-primary transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("waitlist")}
            className="text-sm font-semibold bg-accent text-primary px-6 py-2.5 rounded-xl hover:bg-accent/90 transition-all shadow-sm"
          >
            Gabung Waitlist
          </button>
        </div>

        <button
          className="md:hidden p-2 text-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="block w-full text-left text-sm font-medium text-[#64748B] hover:text-primary py-2 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("waitlist")}
            className="w-full text-sm font-semibold bg-accent text-primary px-5 py-3 rounded-xl hover:bg-accent/90 transition-all"
          >
            Gabung Waitlist
          </button>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center bg-gradient-to-br from-primary via-[#052e44] to-primary overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full px-6 pt-24 pb-20">
        <div className="max-w-xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-1.5 mb-6">
              <Sparkles size={14} className="text-accent" />
              <span className="text-xs font-medium text-white/80">
                Platform Pengembangan Diri untuk Anak Muda
              </span>
            </div>
          </FadeIn>

          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-4">
              Masa Depan <br />
              <span className="text-secondary">Dimulai Hari Ini</span>
            </h1>
          </FadeIn>

          <FadeIn>
            <p className="text-sm md:text-base text-white/70 max-w-md mx-auto leading-relaxed mb-8">
              Beautifio membantu anak muda menemukan arah hidup, peluang, mentor, dan
              komunitas yang tepat untuk masa depan yang lebih baik.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 bg-accent text-primary font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-accent/90 transition-all shadow-lg shadow-accent/25"
              >
                Gabung Waitlist <ArrowRight size={16} />
              </button>
              <button
                onClick={() => document.getElementById("fitur")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-medium px-8 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-all"
              >
                Lihat Fitur
              </button>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="flex items-center justify-center gap-4 mt-10">
              <div className="flex -space-x-2">
                {["RA", "DP", "SI"].map((init, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-secondary text-primary text-xs font-bold flex items-center justify-center border-2 border-primary"
                  >
                    {init}
                  </div>
                ))}
              </div>
              <div className="text-xs text-white/60">
                <span className="font-semibold text-white">1.200+</span> anggota telah bergabung
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function Fitur() {
  return (
    <section id="fitur" className="py-16 md:py-24 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          label="FITUR"
          title="Semua yang Kamu Butuhkan untuk Masa Depan"
          subtitle="Dari menentukan tujuan hingga menemukan peluang — Beautifio adalah panduan lengkap perjalananmu."
        />

        <div className="grid md:grid-cols-2 gap-4 px-6 max-w-3xl mx-auto">
          {fitur.map((f, i) => (
            <FadeIn key={i}>
              <div className="bg-surface rounded-2xl p-6 border border-gray-100 hover:border-secondary/30 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.08)] group cursor-pointer">
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-2">{f.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Circle() {
  return (
    <section id="circle" className="py-16 md:py-24 bg-surface">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          label="CIRCLE"
          title="Temukan Komunitas yang Tepat"
          subtitle="Bergabung dengan circle yang sesuai minat dan tujuanmu. Temukan teman seperjuangan!"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 max-w-4xl mx-auto">
          {circles.map((c, i) => (
            <FadeIn key={i}>
              <div className="bg-surface rounded-2xl p-6 border border-gray-100 hover:border-secondary/30 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.08)] group cursor-pointer">
                <span className={`inline-block text-xs font-semibold ${c.color} rounded-xl px-3 py-1 mb-4`}>
                  {c.tag}
                </span>
                <h3 className="text-base font-bold text-[#1E293B] mb-2">{c.name}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">{c.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B]">
                    <span className="font-semibold text-[#1E293B]">{c.members}</span> anggota
                  </span>
                  <span className="text-secondary group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Peluang() {
  return (
    <section id="peluang" className="py-16 md:py-24 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          label="OPPORTUNITY HUB"
          title="Akses Peluang Terbaru"
          subtitle="Temukan beasiswa, magang, kompetisi, dan workshop yang relevan dengan perjalananmu."
        />

        <div className="grid sm:grid-cols-2 gap-4 px-6 max-w-3xl mx-auto">
          {opportunities.map((opp, i) => {
            const Icon = opp.icon;
            return (
              <FadeIn key={i}>
                <div className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-surface hover:border-accent/50 hover:bg-accent/5 transition-all duration-300 cursor-pointer group shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-accent bg-accent/10 rounded-xl px-2 py-0.5 inline-block mb-1">
                      {opp.type}
                    </span>
                    <h3 className="text-sm font-bold text-[#1E293B] truncate">{opp.title}</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">{opp.org}</p>
                    <p className="text-xs text-[#64748B] mt-1">
                      Batas akhir: <span className="font-medium text-[#1E293B]">{opp.deadline}</span>
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Mentor() {
  return (
    <section id="mentor" className="py-16 md:py-24 bg-surface">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          label="MENTOR"
          title="Belajar dari yang Terbaik"
          subtitle="Dapatkan bimbingan langsung dari para profesional berpengalaman di bidangnya."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 px-6 max-w-4xl mx-auto">
          {mentors.map((m, i) => (
            <FadeIn key={i}>
              <div className="bg-surface rounded-2xl p-6 border border-gray-100 hover:border-secondary/30 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.08)] group text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white font-bold text-sm">{m.avatar}</span>
                </div>
                <h3 className="text-base font-bold text-[#1E293B]">{m.name}</h3>
                <p className="text-xs text-secondary font-medium mt-1">{m.role}</p>
                <div className="mt-3">
                  <span className="inline-block text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl px-3 py-1">
                    {m.expertise}
                  </span>
                </div>
                <button className="mt-5 text-xs font-semibold text-primary bg-accent/15 hover:bg-accent/25 transition-colors rounded-xl px-5 py-2">
                  Ajukan Mentoring
                </button>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <div className="mt-12 mx-6 bg-primary rounded-2xl p-8 md:p-10 text-center max-w-3xl mx-auto shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <Quote size={32} className="text-secondary/40 mx-auto mb-4" />
            <p className="text-white/90 text-sm md:text-base leading-relaxed italic max-w-lg mx-auto">
              "Beautifio membantuku menemukan mentor yang tepat. Sekarang aku lebih percaya
              diri mengejar karir di bidang teknologi."
            </p>
            <div className="mt-5 flex items-center justify-center gap-1.5">
              {[...Array(5)].map((_, j) => (
                <Star key={j} size={14} className="text-accent fill-accent" />
              ))}
            </div>
            <p className="text-xs text-white/50 mt-3">— Andini, Member Beautifio</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          label="FAQ"
          title="Pertanyaan Umum"
          subtitle="Temukan jawaban atas pertanyaan yang sering diajukan tentang Beautifio."
        />

        <div className="max-w-2xl mx-auto px-6 space-y-3">
          {faqs.map((item, i) => (
            <FadeIn key={i}>
              <div className="bg-surface border border-gray-100 rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-[#1E293B]">{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-[#64748B] transition-transform duration-300 flex-shrink-0 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    openIndex === i ? "max-h-60 pb-5" : "max-h-0"
                  }`}
                >
                  <p className="text-sm text-[#64748B] px-5 leading-relaxed">{item.a}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function JoinWaitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section id="waitlist" className="py-16 md:py-24 bg-gradient-to-br from-primary via-[#052e44] to-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-20 w-64 h-64 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="max-w-lg mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-1.5 mb-6">
              <Mail size={14} className="text-accent" />
              <span className="text-xs font-medium text-white/80">Daftar Early Bird</span>
            </div>
          </FadeIn>

          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Siap Memulai Perjalananmu?</h2>
          </FadeIn>

          <FadeIn>
            <p className="text-sm text-white/70 mb-8 max-w-sm mx-auto leading-relaxed">
              Daftar sekarang untuk mendapatkan akses early bird, undangan eksklusif, dan
              update terbaru dari Beautifio.
            </p>
          </FadeIn>

          <FadeIn>
            {submitted ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Check size={22} className="text-accent" />
                </div>
                <p className="text-white font-semibold text-lg">Kamu Terdaftar!</p>
                <p className="text-white/60 text-sm mt-2">Kami akan mengirimkan update ke emailmu. Nantikan kabar dari kami!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email kamu"
                  className="flex-1 px-5 py-3.5 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-accent/50 focus:bg-white/15 transition-all"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-accent text-primary font-bold px-6 py-3.5 rounded-xl text-sm hover:bg-accent/90 transition-all shadow-lg shadow-accent/25"
                >
                  Daftar <Send size={15} />
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#021d2e] text-white/50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 md:col-span-1">
            <span className="text-lg font-extrabold text-white tracking-tight">Beautifio</span>
            <p className="text-xs mt-3 leading-relaxed max-w-xs">
              Masa Depan Dimulai Hari Ini. Bersama Beautifio, temukan arah dan potensi terbaikmu.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white/60 tracking-widest uppercase mb-4">Navigasi</h4>
            <ul className="space-y-2">
              {["Tentang", "Blog", "Karir", "Kontak"].map((item) => (
                <li key={item}>
                  <button className="text-xs hover:text-white transition-colors">{item}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white/60 tracking-widest uppercase mb-4">Dukungan</h4>
            <ul className="space-y-2">
              {["Pusat Bantuan", "Privasi", "Syarat & Ketentuan", "FAQ"].map((item) => (
                <li key={item}>
                  <button className="text-xs hover:text-white transition-colors">{item}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white/60 tracking-widest uppercase mb-4">Ikuti Kami</h4>
            <div className="flex flex-wrap gap-2">
              {["Instagram", "Twitter", "TikTok", "LinkedIn"].map((soc) => (
                <button key={soc} className="text-xs px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/30 hover:text-white transition-all">
                  {soc}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">&copy; {new Date().getFullYear()} Beautifio. All rights reserved.</p>
          <p className="text-xs flex items-center gap-1">
            Made with <span className="text-accent">❤</span> for Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Beautifio() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface font-sans text-[#1E293B] antialiased">
      <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Hero />
      <Fitur />
      <Circle />
      <Peluang />
      <Mentor />
      <FAQ />
      <JoinWaitlist />
      <Footer />
    </div>
  );
}
