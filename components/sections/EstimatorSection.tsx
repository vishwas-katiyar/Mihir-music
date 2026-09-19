import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { EventEstimator3D } from "./EventEstimator3D";

export function EstimatorSection() {
  return (
    <section id="estimate" className="py-28 sm:py-36">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Instant 3D estimator"
            title="Build your stage. Watch the rig respond. Send it in one tap."
            lead="Pick the event, the crowd and the venue. Beam count, array height and truss span update live, and the exact rig you see goes to WhatsApp as your quote request."
          />
        </Reveal>
        <Reveal delay={0.1} className="mt-14">
          <EventEstimator3D />
        </Reveal>
      </Container>
    </section>
  );
}
