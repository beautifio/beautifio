"use client";

import type { ReactNode, ElementType } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: ElementType;
}

interface BottomNavigationProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function BottomNavigation({
  items,
  activeTab,
  onTabChange,
  className = "",
}: BottomNavigationProps) {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-around px-2 z-50 ${className}`}
    >
      {items.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer transition-all ${
              isActive ? "text-primary" : "text-text-secondary"
            }`}
          >
            <Icon
              size={20}
              className={isActive ? "text-primary" : "text-text-secondary"}
            />
            <span
              className={`text-[10px] font-medium ${
                isActive ? "text-primary font-semibold" : "text-text-secondary"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
