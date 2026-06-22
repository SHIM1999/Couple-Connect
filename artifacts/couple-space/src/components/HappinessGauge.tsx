interface Props {
  label: string;
  value: number;
  color: string;
  animate?: boolean;
}

export function HappinessGauge({ label, value, color, animate }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[8px] text-foreground">{label}</span>
        <span className="font-pixel text-[7px] text-muted-foreground">{clamped}%</span>
      </div>

      {/* Horizontal bar */}
      <div
        className="relative w-full rounded overflow-hidden pixel-border"
        style={{ height: 18, background: "hsl(var(--muted))", boxShadow: "inset 2px 2px 0 rgba(0,0,0,0.12)" }}
      >
        <div
          className="absolute top-0 left-0 h-full transition-all"
          style={{
            width: `${clamped}%`,
            background: color,
            transitionDuration: animate ? "500ms" : "800ms",
            transitionTimingFunction: "ease-out",
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 10px,
              rgba(0,0,0,0.1) 10px,
              rgba(0,0,0,0.1) 12px
            )`,
          }}
        />
      </div>
    </div>
  );
}
