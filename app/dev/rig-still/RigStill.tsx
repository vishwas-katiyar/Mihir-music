"use client";

import { useMemo } from "react";
import { EstimatorScene } from "@/components/3d/EstimatorScene";
import { estimate, crowdSizes, type CrowdId, type EventTypeId, type VenueId } from "@/lib/estimator";

/**
 * One representative estimator input per show format (lib/formats.ts). These are the rigs
 * the renders depict, so they must stay in step with the audience figures on the cards.
 */
export const stillInputs: Record<string, { eventType: EventTypeId; crowd: CrowdId; venue: VenueId }> = {
  wedding: { eventType: "wedding", crowd: "m", venue: "lawn" },
  concert: { eventType: "concert", crowd: "xl", venue: "ground" },
  corporate: { eventType: "corporate", crowd: "s", venue: "banquet" },
  club: { eventType: "club", crowd: "xs", venue: "club" },
};

export function RigStill({ format, azimuth, polar, zoom }: { format: string; azimuth: number; polar: number; zoom: number }) {
  const input = stillInputs[format] ?? stillInputs.wedding;
  const result = useMemo(() => estimate(input), [input]);
  const people = crowdSizes.find((c) => c.id === input.crowd)?.people ?? 350;
  return (
    <div className="fixed inset-0 bg-[#07090d]">
      {/* The Next.js dev indicator would otherwise land in the screenshot. */}
      <style>{`nextjs-portal{display:none!important}`}</style>
      <EstimatorScene rig={result.rig} people={people} quality="high" active still={{ azimuth, polar, zoom }} />
    </div>
  );
}
