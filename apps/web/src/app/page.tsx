"use client";

import {
  Target,
  Trophy,
  MessageCircle,
  Briefcase,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Zap,
  Home,
  Users,
  MapPin,
  Compass,
  User,
  Clock,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
  AvatarGroup,
  ProgressBar,
  BottomNavigation,
} from "@beautifio/ui";
import { useMemo, useState } from "react";

const tabs = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "cerita", label: "Cerita", icon: BookOpen },
  { id: "circle", label: "Circle", icon: Users },
  { id: "roadmap", label: "Roadmap", icon: MapPin },
  { id: "profile", label: "Profil", icon: User },
];

const goals = [
  {
    id: "1",
    name: "Jadi Frontend Developer",
    category: "Karir",
    progress: 62,
    milestones: { done: 5, total: 8 },
  },
  {
    id: "2",
    name: "Toefl 600+",
    category: "Skill",
    progress: 30,
    milestones: { done: 2, total: 6 },
  },
];

const actions = [
  {
    id: "1",
    title: "Selesaikan Modul JavaScript Dasar",
    due: "Besok",
    done: false,
  },
  {
    id: "2",
    title: "Ikuti Mentor Session Circle Tech",
    due: "Jumat, 14 Jun",
    done: true,
  },
  {
    id: "3",
    title: "Submit Portofolio ke Opportunity Hub",
    due: "Minggu, 16 Jun",
    done: false,
  },
];

const activities = [
  {
    id: "1",
    name: "Rina Amalia",
    initials: "RA",
    role: "Mentor",
    message: "Jangan lupa selesaikan milestone React minggu ini ya!",
    time: "2 jam lalu",
    circle: "Tech Founders",
  },
  {
    id: "2",
    name: "Dimas Pratama",
    initials: "DP",
    role: "Anggota",
    message: "Ada yang udah coba challenge algoritma kemarin?",
    time: "5 jam lalu",
    circle: "Tech Founders",
  },
  {
    id: "3",
    name: "Sari Indah",
    initials: "SI",
    role: "Anggota",
    message: "Gua nemu beasiswa menarik nih, cek opportunity hub!",
    time: "1 hari lalu",
    circle: "Creative Lab",
  },
];

const opportunities = [
  {
    id: "1",
    title: "Beasiswa Prestasi 2026",
    org: "Yayasan Nusantara Cerdas",
    type: "Beasiswa",
    deadline: "30 Jun 2026",
  },
  {
    id: "2",
    title: "Program Magang Frontend",
    org: "TechStart Indonesia",
    type: "Magang",
    deadline: "15 Jul 2026",
  },
];

function GreetingHeader() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";

  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-3">
        <Avatar initials="AN" size="lg" />
        <div>
          <h1 className="text-lg font-bold text-text-primary leading-tight">
            Hai, Andini!
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">{greeting}</p>
        </div>
      </div>
      <button className="relative p-2 text-text-secondary hover:text-primary transition-colors cursor-pointer">
        <Sparkles size={20} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
      </button>
    </div>
  );
}

function GoalProgressCard() {
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-primary" />
            <CardTitle>Goal Aktif</CardTitle>
          </div>
          <button className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {goals.map((goal) => (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {goal.name}
                  </span>
                </div>
                <Badge variant="secondary" className="flex-shrink-0 ml-2">
                  {goal.category}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar
                    value={goal.progress}
                    size="sm"
                    variant="accent"
                  />
                </div>
                <span className="text-xs font-medium text-text-secondary tabular-nums flex-shrink-0">
                  {goal.milestones.done}/{goal.milestones.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyActionCard() {
  const doneCount = actions.filter((a) => a.done).length;

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-accent" />
            <CardTitle>Aksi Minggu Ini</CardTitle>
          </div>
          <span className="text-xs font-medium text-text-secondary">
            {doneCount}/{actions.length} selesai
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, i) => (
            <div
              key={action.id}
              className={`flex items-start gap-3 p-3 rounded-sm transition-colors ${
                i < actions.length - 1 ? "border-b border-border" : ""
              }`}
            >
              {action.done ? (
                <CheckCircle2 size={20} className="text-success flex-shrink-0 mt-0.5" />
              ) : (
                <Circle size={20} className="text-border flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium leading-snug ${
                    action.done
                      ? "line-through text-text-secondary"
                      : "text-text-primary"
                  }`}
                >
                  {action.title}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {action.due}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CircleActivity() {
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-secondary" />
            <CardTitle>Aktivitas Circle</CardTitle>
          </div>
          <button className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <Avatar initials={item.initials} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {item.name}
                  </span>
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">
                    {item.role}
                  </Badge>
                  <span className="text-xs text-text-secondary ml-auto flex-shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-0.5 line-clamp-2 leading-snug">
                  {item.message}
                </p>
                <span className="text-xs text-secondary font-medium mt-1 inline-block">
                  #{item.circle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OpportunityPreview() {
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-accent" />
            <CardTitle>Peluang Menarik</CardTitle>
          </div>
          <button className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="flex items-center gap-4 p-4 rounded-sm border border-border hover:border-secondary/30 hover:bg-muted/30 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-sm bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Briefcase size={18} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <Badge variant="accent" className="mb-1">
                  {opp.type}
                </Badge>
                <h4 className="text-sm font-semibold text-text-primary truncate">
                  {opp.title}
                </h4>
                <p className="text-xs text-text-secondary mt-0.5">{opp.org}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <ArrowRight
                  size={16}
                  className="text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all"
                />
                <span className="text-[10px] text-text-secondary">
                  {opp.deadline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStats() {
  const stats = [
    { icon: Trophy, label: "Milestone", value: "7 selesai", color: "text-accent" },
    { icon: BookOpen, label: "Circle", value: "3 aktif", color: "text-secondary" },
    { icon: Clock, label: "Streak", value: "5 hari", color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 p-4 bg-surface rounded-sm border border-border shadow-card"
          >
            <Icon size={18} className={stat.color} />
            <span className="text-xs text-text-secondary">{stat.label}</span>
            <span className="text-sm font-bold text-text-primary">
              {stat.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[390px] mx-auto px-6 pt-6 pb-24 space-y-8">
        <GreetingHeader />
        <QuickStats />
        <GoalProgressCard />
        <WeeklyActionCard />
        <CircleActivity />
        <OpportunityPreview />
      </div>

      <BottomNavigation
        items={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
