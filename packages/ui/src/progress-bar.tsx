interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md";
  showLabel?: boolean;
  variant?: "default" | "accent";
  className?: string;
}

const sizeStyles = {
  sm: "h-2",
  md: "h-3",
};

const variantStyles = {
  default: "bg-laut-700",
  accent: "bg-fajar",
};

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  showLabel = false,
  variant = "default",
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex-1 bg-laut-100 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(3,24,42,0.08)] ${sizeStyles[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${variantStyles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-kabut tabular-nums">
          {percentage}%
        </span>
      )}
    </div>
  );
}

export function MilestoneCheck({
  completed = false,
  locked = false,
  size = "md",
}: {
  completed?: boolean;
  locked?: boolean;
  size?: "sm" | "md";
}) {
  const s = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";

  if (completed) {
    return (
      <div
        className={`${s} rounded-full bg-success text-white flex items-center justify-center font-bold`}
      >
        ✓
      </div>
    );
  }

  if (locked) {
    return (
      <div
        className={`${s} rounded-full bg-muted text-muted-foreground flex items-center justify-center`}
      >
        🔒
      </div>
    );
  }

  return (
    <div
      className={`${s} rounded-full border-2 border-primary/30 text-text-secondary flex items-center justify-center font-medium`}
    >
      ○
    </div>
  );
}
