import { create } from "zustand";

type Tab = "home" | "cerita" | "circle" | "roadmap" | "opportunity" | "profile";

interface AppState {
  activeTab: Tab;
  isOnboardingComplete: boolean;
  selectedGoalId: string | null;
  setActiveTab: (tab: Tab) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setSelectedGoal: (goalId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "home",
  isOnboardingComplete: false,
  selectedGoalId: null,
  setActiveTab: (activeTab) => set({ activeTab }),
  setOnboardingComplete: (isOnboardingComplete) => set({ isOnboardingComplete }),
  setSelectedGoal: (selectedGoalId) => set({ selectedGoalId }),
}));
