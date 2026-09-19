import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[80dvh] items-center py-32">
      <Container>
        <div className="eyebrow text-amber">Signal lost · 404</div>
        <h1 className="display-tight mt-5 max-w-3xl text-5xl uppercase text-ink sm:text-7xl">This cue isn’t in the run sheet.</h1>
        <p className="mt-6 max-w-xl text-muted">The page moved or never existed. Head back to the stage or jump straight to the estimator.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/">Back to home</Button>
          <Button href="/estimate" variant="ghost">
            Build an estimate
          </Button>
        </div>
      </Container>
    </section>
  );
}
