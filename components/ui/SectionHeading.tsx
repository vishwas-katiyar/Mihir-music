import { cn } from "@/lib/utils";

interface Props {
  title: string;
  lead?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  /** Set when the surrounding section points at this heading with aria-labelledby. */
  titleId?: string;
  className?: string;
}

/** Section or page heading in the display voice, with an optional muted lead. The heading stands alone: no kicker above it. */
export function SectionHeading({ title, lead, align = "left", as = "h2", titleId, className }: Props) {
  const Tag = as;
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Tag id={titleId} className="display-tight text-balance text-4xl uppercase text-ink sm:text-5xl lg:text-6xl">{title}</Tag>
      {lead && <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{lead}</p>}
    </div>
  );
}
