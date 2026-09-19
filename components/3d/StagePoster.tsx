import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { cn } from "@/lib/utils";

/**
 * Static CSS stand-in for the WebGL stage: reduced-motion users, devices without WebGL,
 * and the pre-hydration / chunk-loading placeholder. `loading` adds a shimmer label so
 * the wait reads as progress, not a broken canvas.
 */
export function StagePoster({ className, accent = "amber", loading = false }: { className?: string; accent?: "amber" | "cyan"; loading?: boolean }) {
  const a = accent === "amber" ? "255 159 28" : "77 229 255";
  const b = accent === "amber" ? "77 229 255" : "255 159 28";
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{
        background: [
          `linear-gradient(112deg, transparent 38%, rgb(${a} / 0.16) 40%, transparent 44%)`,
          `linear-gradient(68deg, transparent 56%, rgb(${b} / 0.14) 58%, transparent 62%)`,
          `linear-gradient(95deg, transparent 20%, rgb(${a} / 0.10) 21%, transparent 24%)`,
          `radial-gradient(ellipse at 50% 110%, rgb(${a} / 0.22), transparent 55%)`,
          `linear-gradient(180deg, #07090d 0%, #0b0f16 60%, #07090d 100%)`,
        ].join(","),
      }}
    >
      <div className="grid-bg absolute inset-0 opacity-60" />
      {loading && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <TextShimmer as="span" className="font-mono text-[10px] uppercase tracking-[0.22em] [--base-color:#6b7280] [--base-gradient-color:#ffd166]" duration={1.6}>
            Rigging the stage
          </TextShimmer>
        </div>
      )}
    </div>
  );
}
