import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { EventEstimator3D } from "./EventEstimator3D";

export function EstimatorSection() {
  return (
    <section id="estimate" aria-labelledby="estimate-title" className="py-28 sm:py-36">
      <Container>
        <Reveal>
          <SectionHeading
            titleId="estimate-title"
            title="Build your stage. Watch the rig respond. Send it in one tap."
            lead="Pick the event, the crowd and the venue. The rig, the budget and the nearest package update live, and the exact rig goes to WhatsApp as your quote."
          />
          <Link href="/estimate" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-gold transition hover:text-gold-soft">
            Open the full-page 3D event estimate <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Reveal>
        <Reveal delay={0.1} className="mt-14">
          <EventEstimator3D />
        </Reveal>
      </Container>
    </section>
  );
}
