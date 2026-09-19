import { cn } from "@/lib/utils";

/** Double-bezel glass panel: outer hairline tray + inner glass core with concentric radius. */
export function GlassCard({ className, inner, children }: { className?: string; inner?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-[1.75rem] border border-white/6 bg-white/[0.03] p-1.5", className)}>
      <div className={cn("glass h-full rounded-[calc(1.75rem-0.375rem)] p-6", inner)}>{children}</div>
    </div>
  );
}
