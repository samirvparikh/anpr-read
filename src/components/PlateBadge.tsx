interface PlateBadgeProps {
  plate: string;
  size?: "sm" | "md" | "lg";
}

export function PlateBadge({ plate, size = "md" }: PlateBadgeProps) {
  const sizes = {
    sm: "text-sm px-2 py-0.5",
    md: "text-base px-3 py-1",
    lg: "text-2xl px-5 py-2",
  };
  return (
    <span
      className={`inline-flex items-center font-mono font-bold tracking-widest rounded-md border-2 border-foreground/80 bg-warning/90 text-foreground shadow-sm ${sizes[size]}`}
    >
      {plate}
    </span>
  );
}
