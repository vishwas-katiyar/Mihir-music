import { AudioMeshCanvas } from "@/components/3d/AudioMeshCanvas";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { getService } from "@/lib/services";

/**
 * Sound engineering section: WebGL frequency mesh on the left, hard specs on the right.
 * Specs are a real <table> so search engines and LLMs can lift the numbers directly.
 */
export function AudioShowcase() {
  const audio = getService("arena-audio")!;
  return (
    <section id="audio" className="relative py-28 sm:py-36">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <Reveal className="relative order-2 min-h-[380px] overflow-hidden rounded-[2rem] border border-white/8 bg-stage-2 lg:order-1 lg:min-h-[520px]">
            <AudioMeshCanvas className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
              <span className="eyebrow rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1.5 text-cyan">Live spectrum, 128 BPM</span>
              <span className="eyebrow text-muted">20 Hz to 20 kHz</span>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <SectionHeading
                title="Phase-aligned. Room-tuned. Felt in the chest."
                lead={audio.definition}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <caption className="sr-only">Arena audio system specifications</caption>
                  <tbody className="divide-y divide-white/8">
                    {audio.specs.map((s) => (
                      <tr key={s.label} className="grid grid-cols-[120px_1fr] sm:table-row">
                        <th scope="row" className="eyebrow px-4 py-3 text-left font-normal text-muted sm:w-40">
                          {s.label}
                        </th>
                        <td className="px-4 py-3 text-ink">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8">
                <Button href="/services/arena-audio">Arena audio details</Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
