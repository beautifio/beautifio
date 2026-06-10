"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Compass,
  BookOpen,
  Users,
  MapPin,
  User,
  Target,
  Trophy,
  ChevronRight,
  Circle,
  Bookmark,
  Briefcase,
  GraduationCap,
  Settings,
  LogOut,
  Heart,
  Star,
  LogIn,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
  ProgressBar,
  BottomNavigation,
  Button,
} from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";

const tabs = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "discover", label: "Temukan", icon: Compass },
  { id: "cerita", label: "Cerita", icon: BookOpen },
  { id: "circle", label: "Circle", icon: Users },
  { id: "roadmap", label: "Roadmap", icon: MapPin },
  { id: "profil", label: "Profil", icon: User },
];

const MOCK_USER = {
  name: "Andini Putri",
  initials: "AP",
  email: "andini.putri@email.com",
  city: "Sleman, Yogyakarta",
  bio: "Frontend Developer | UI/UX Enthusiast | Lifelong Learner",
  goals: ["Jadi Frontend Developer", "Toefl 600+"],
  roadmap: {
    title: "Programmer",
    progress: 62,
    milestones: { done: 5, total: 8 },
  },
  circles: [
    { name: "Tech Founders", members: 8, role: "Anggota" },
    { name: "Creative Lab", members: 6, role: "Anggota" },
    { name: "Data Science ID", members: 9, role: "Anggota" },
  ],
  savedStories: [
    { title: "Cara Belajar Efektif di Era Digital", slug: "cara-belajar-efektif-di-era-digital" },
    { title: "Panduan Membangun Karir di Industri Teknologi", slug: "panduan-membangun-karir-di-teknologi" },
  ],
  savedOpportunities: [
    { title: "Beasiswa Prestasi 2026", org: "Yayasan Nusantara Cerdas", type: "Beasiswa" },
    { title: "Program Magang Frontend", org: "TechStart Indonesia", type: "Magang" },
  ],
  mentors: [
    { name: "Pak Rudi", initials: "RR", expertise: "Tech Entrepreneur" },
    { name: "Bu Sari", initials: "SS", expertise: "Leadership Coach" },
  ],
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ProfileHeader({ name, initials, bio, city }: { name: string; initials: string; bio?: string; city?: string }) {
  return (
    <div className="flex flex-col items-center pt-4 pb-6">
      <Avatar initials={initials} size="xl" />
      <h1 className="text-xl font-bold text-text-primary mt-4">
        {name}
      </h1>
      {bio && (
        <p className="text-sm text-text-secondary mt-1 text-center px-4">
          {bio}
        </p>
      )}
      {city && (
        <div className="flex items-center gap-2 mt-2">
          <MapPin size={14} className="text-text-secondary/50" />
          <span className="text-xs text-text-secondary">{city}</span>
        </div>
      )}
      <div className="flex items-center gap-3 mt-4">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-text-primary">12</span>
          <span className="text-[10px] text-text-secondary">Circle</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-text-primary">7</span>
          <span className="text-[10px] text-text-secondary">Cerita</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-text-primary">5</span>
          <span className="text-[10px] text-text-secondary">Peluang</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-text-primary">3</span>
          <span className="text-[10px] text-text-secondary">Mentor</span>
        </div>
      </div>
    </div>
  );
}

function GoalSection({ goals }: { goals: string[] }) {
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target size={18} className="text-primary" />
          <CardTitle>Goal Saya</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.map((goal, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-sm border border-border hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-sm bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Star size={14} className="text-accent" />
            </div>
            <span className="text-sm font-medium text-text-primary flex-1">{goal}</span>
            <ChevronRight size={16} className="text-text-secondary/30" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RoadmapSection({ roadmap }: { roadmap: typeof MOCK_USER.roadmap }) {
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap size={18} className="text-secondary" />
          <CardTitle>Roadmap Utama</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-text-primary">
            {roadmap.title}
          </span>
          <Badge variant="secondary">Aktif</Badge>
        </div>
        <ProgressBar
          value={roadmap.progress}
          showLabel
          variant="accent"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-text-secondary">
            {roadmap.milestones.done} dari {roadmap.milestones.total} milestone
          </span>
          <div className="flex items-center gap-1">
            <Trophy size={14} className="text-accent" />
            <span className="text-xs font-semibold text-accent">
              {roadmap.progress}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CircleListSection({ circles }: { circles: typeof MOCK_USER.circles }) {
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-secondary" />
            <CardTitle>Circle Saya</CardTitle>
          </div>
          <button className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {circles.map((circle, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-sm hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-sm bg-primary/5 flex items-center justify-center flex-shrink-0">
              <Circle size={16} className="text-primary/40" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text-primary block truncate">
                {circle.name}
              </span>
              <span className="text-xs text-text-secondary">
                {circle.members} anggota
              </span>
            </div>
            <Badge variant="default">{circle.role}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SavedStoriesSection({ stories }: { stories: typeof MOCK_USER.savedStories }) {
  const router = useRouter();
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bookmark size={18} className="text-primary" />
          <CardTitle>Cerita Tersimpan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {stories.map((story, i) => (
          <div
            key={i}
            onClick={() => router.push(`/cerita/${story.slug}`)}
            className="flex items-center gap-3 p-3 rounded-sm hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-sm bg-accent/10 flex items-center justify-center flex-shrink-0">
              <BookOpen size={16} className="text-accent" />
            </div>
            <span className="text-sm font-medium text-text-primary flex-1 truncate">
              {story.title}
            </span>
            <ChevronRight size={16} className="text-text-secondary/30 flex-shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SavedOpportunitiesSection({ opportunities }: { opportunities: typeof MOCK_USER.savedOpportunities }) {
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Briefcase size={18} className="text-accent" />
          <CardTitle>Peluang Tersimpan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {opportunities.map((opp, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-sm hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-sm bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Briefcase size={16} className="text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text-primary block truncate">
                {opp.title}
              </span>
              <span className="text-xs text-text-secondary">{opp.org}</span>
            </div>
            <Badge variant="accent">{opp.type}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MentorFollowingSection({ mentors }: { mentors: typeof MOCK_USER.mentors }) {
  const router = useRouter();
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-destructive" />
            <CardTitle>Mentor Diikuti</CardTitle>
          </div>
          <button
            onClick={() => router.push("/mentors")}
            className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer"
          >
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {mentors.map((mentor, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-sm hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <Avatar initials={mentor.initials} size="sm" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text-primary block">
                {mentor.name}
              </span>
              <span className="text-xs text-text-secondary">{mentor.expertise}</span>
            </div>
            <Badge variant="secondary">Mentor</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SettingsSection() {
  const { signOut } = useAuth();
  const menuItems = [
    { icon: User, label: "Edit Profil" },
    { icon: Settings, label: "Pengaturan Akun" },
    { icon: Circle, label: "Notifikasi" },
    { icon: BookOpen, label: "Kebijakan Privasi" },
    { icon: LogOut, label: "Keluar", danger: true, action: signOut },
  ];

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-text-secondary" />
          <CardTitle>Pengaturan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              onClick={item.action}
              className={`flex items-center gap-3 p-3 rounded-sm hover:bg-muted/30 transition-colors cursor-pointer ${
                i < menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <Icon
                size={16}
                className={item.danger ? "text-destructive" : "text-text-secondary"}
              />
              <span
                className={`text-sm flex-1 ${
                  item.danger ? "text-destructive font-medium" : "text-text-primary"
                }`}
              >
                {item.label}
              </span>
              <ChevronRight size={16} className="text-text-secondary/30" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-8 px-6">
      <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
        <User size={36} className="text-primary/40" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2 text-center">
        Masuk untuk Melihat Profil
      </h2>
      <p className="text-sm text-text-secondary text-center mb-8 max-w-xs">
        Simpan progress, cerita, dan peluang favoritmu dengan masuk ke akun Beautifio.
      </p>
      <Link href="/login" className="w-full max-w-xs">
        <Button variant="primary" size="lg" className="w-full">
          <LogIn size={16} /> Masuk
        </Button>
      </Link>
      <p className="text-xs text-text-secondary mt-4">
        Belum punya akun?{" "}
        <Link href="/register" className="text-secondary font-semibold hover:underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("profil");
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Memuat profil...</p>
        </div>
      </div>
    );
  }

  const isLoggedIn = !!user;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Pengguna";
  const displayInitials = user?.user_metadata?.full_name
    ? getInitials(user.user_metadata.full_name)
    : user?.email
    ? user.email[0].toUpperCase()
    : "U";
  const displayEmail = user?.email || "";

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24 space-y-6">
        {isLoggedIn ? (
          <>
            <ProfileHeader
              name={displayName}
              initials={displayInitials}
              bio={displayEmail}
              city=""
            />
            <GoalSection goals={MOCK_USER.goals} />
            <RoadmapSection roadmap={MOCK_USER.roadmap} />
            <CircleListSection circles={MOCK_USER.circles} />
            <SavedStoriesSection stories={MOCK_USER.savedStories} />
            <SavedOpportunitiesSection opportunities={MOCK_USER.savedOpportunities} />
            <MentorFollowingSection mentors={MOCK_USER.mentors} />
            <SettingsSection />
          </>
        ) : (
          <LoginPrompt />
        )}
      </div>

      <BottomNavigation
        items={tabs}
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id);
          if (id === "home") router.push("/");
          else router.push(`/${id}`);
        }}
      />
    </div>
  );
}
