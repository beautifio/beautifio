"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { AuthModal } from "@/components/AuthModal";

interface ProtectedActionProps {
  children: React.ReactNode;
  label?: string;
  onAction?: () => void;
  className?: string;
}

export function ProtectedAction({
  children,
  onAction,
  className = "",
}: ProtectedActionProps) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (isLoading) return;
    if (user) {
      onAction?.();
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <div onClick={handleClick} className={`${className} cursor-pointer`}>
        {children}
      </div>
      <AuthModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={onAction}
      />
    </>
  );
}
