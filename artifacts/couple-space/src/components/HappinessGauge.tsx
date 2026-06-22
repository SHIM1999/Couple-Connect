import { useEffect, useRef } from "react";

interface Props {
  label: string;
  value: number;
  color: string;
  animate?: boolean;
}

export function HappinessGauge({ label, value, color, animate }: Props) {
  const fillRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const segments = 10;
  const filledSegments = Math.round((clamped / 100) * segments);

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className="font-pixel text-[8px] text-foreground tracking-tight">{label}</span>

      {/* Vertical pixel bar */}
      <div
        className="relative w-9 rounded pixel-border overflow-hidden"
        style={{ height: 80, background: "hsl(var(--muted))", boxShadow: "inset 2px 2px 0 rgba(0,0,0,0.15)" }}
      >
        <div
          ref={fillRef}
          className="absolute bottom-0 left-0 right-0 transition-all"
          style={{
            height: `${clamped}%`,
            background: color,
            transitionDuration: animate ? "600ms" : "800ms",
            transitionTimingFunction: "ease-out",
            backgroundImage: `repeating-linear-gradient(
              180deg,
              transparent 0px,
              transparent 6px,
              rgba(0,0,0,0.12) 6px,
              rgba(0,0,0,0.12) 8px
            )`,
          }}
        />
        {/* Pixel tick marks */}
        {Array.from({ length: segments - 1 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              bottom: `${((i + 1) / segments) * 100}%`,
              height: 1,
              background: "rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>

      {/* Heart fill indicator */}
      <div className="flex flex-col items-center gap-0.5">
        <span
          className="text-base transition-transform duration-300"
          style={{
            transform: animate ? "scale(1.4)" : "scale(1)",
            filter: clamped > 60 ? "drop-shadow(0 0 4px #FF6B81)" : "none",
          }}
        >
          {clamped > 60 ? "❤" : clamped > 30 ? "🧡" : "🤍"}
        </span>
        <span className="font-pixel text-[7px] text-muted-foreground">{clamped}%</span>
      </div>
    </div>
  );
}
