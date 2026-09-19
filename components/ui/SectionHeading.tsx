import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  accent?: "amber" | "cyan" | "white";
  as?: "h1" | "h2";
  className?: string;
}

const accentColor = { amber: "text-amber", cyan: "text-cyan", white: "text-ink" };

export function SectionHeading({ eyebrow, title, lead, align = "left", accent = "amber", as = "h2", className }: Props) {
  const Tag = as;
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <div className={cn("eyebrow", accentColor[accent])}>{eyebrow}</div>}
      <Tag className="display-tight mt-4 text-balance text-4xl uppercase text-ink sm:text-5xl lg:text-6xl">{title}</Tag>
      {lead && <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{lead}</p>}
    </div>
  );
}
