import { cn } from "@/lib/utils";

export const ITEM_COLORS = [
  "#FFF8F0",
  "#FFD6A5",
  "#FDFFB6",
  "#CAFFBF",
  "#BDE0FE",
  "#CDB4DB",
  "#FFC8DD",
  "#D8E2DC",
] as const;

export const DEFAULT_ITEM_COLOR: string = ITEM_COLORS[0];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <p className="font-pixel text-[7px] text-muted-foreground">{label}</p>
      <div className="grid grid-cols-8 gap-2">
        {ITEM_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            onClick={() => onChange(color)}
            className={cn(
              "aspect-square rounded pixel-border transition-transform",
              value === color && "translate-x-[2px] translate-y-[2px] shadow-none",
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
