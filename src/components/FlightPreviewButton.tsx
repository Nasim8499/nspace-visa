"use client";

import { DestinationProvider, useDestination } from "./DestinationProvider";

function Inner({ label, className }: { label: string; className?: string }) {
  const { openCinema } = useDestination();
  return (
    <button type="button" onClick={() => openCinema()} className={className}>
      {label}
    </button>
  );
}

export function FlightPreviewButton({
  slug,
  label = "✈ Preview the flight",
  className = "btn btn-ghost mt-2 w-full",
}: {
  slug: string;
  label?: string;
  className?: string;
}) {
  return (
    <DestinationProvider initialSlug={slug}>
      <Inner label={label} className={className} />
    </DestinationProvider>
  );
}
