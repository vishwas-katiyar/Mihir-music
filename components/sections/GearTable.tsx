import { gear } from "@/lib/gear";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const accentText = { gold: "text-gold", cyan: "text-cyan", white: "text-ink" };

export function GearTable({ heading = true }: { heading?: boolean }) {
  return (
    <section id="gear" className="py-28 sm:py-36">
      <Container>
        {heading && (
          <Reveal>
            <SectionHeading
              title="The inventory behind the impact."
              lead="Owned, maintained and transported by us. No last-minute sub-hire surprises on show day."
            />
          </Reveal>
        )}

        <Reveal delay={0.1} className={cn(heading && "mt-14")}>
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-panel/40">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <caption className="sr-only">Sound, lighting and rigging equipment inventory</caption>
                <thead className="hidden bg-panel-soft/80 sm:table-header-group">
                  <tr className="eyebrow text-gold">
                    <th className="px-5 py-4 font-normal">Category</th>
                    <th className="px-5 py-4 font-normal">Equipment</th>
                    <th className="px-5 py-4 font-normal">Brand / Model</th>
                    <th className="px-5 py-4 font-normal">Qty</th>
                    <th className="px-5 py-4 font-normal">Spec</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {gear.map((group) => (
                    <GroupRows key={group.title} group={group} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function GroupRows({ group }: { group: (typeof gear)[number] }) {
  return (
    <>
      <tr className="bg-panel/60">
        <th colSpan={5} scope="colgroup" className={cn("eyebrow px-5 py-3 text-left font-normal", accentText[group.accent])}>
          {group.title}
        </th>
      </tr>
      {group.items.map((it) => (
        <tr key={it.equipment} className="grid grid-cols-2 gap-x-4 gap-y-1 px-5 py-4 sm:table-row sm:p-0">
          <td className="eyebrow text-muted sm:px-5 sm:py-4" data-label="Category">
            {it.category}
          </td>
          <td className="col-span-2 text-ink sm:px-5 sm:py-4">{it.equipment}</td>
          <td className="text-ink/90 sm:px-5 sm:py-4">{it.model}</td>
          <td className="font-mono text-ink sm:px-5 sm:py-4">{it.qty}</td>
          <td className="col-span-2 text-muted sm:px-5 sm:py-4">{it.spec}</td>
        </tr>
      ))}
    </>
  );
}
