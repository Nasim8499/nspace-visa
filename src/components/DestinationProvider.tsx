"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { FlightCinema } from "./FlightCinema";

type Ctx = {
  slug: string;
  setSlug: (s: string) => void;
  /** open the cinematic take-off for a destination */
  openCinema: (s?: string) => void;
  cinema: string | null;
  closeCinema: () => void;
};

const C = createContext<Ctx>({
  slug: "australia",
  setSlug: () => {},
  openCinema: () => {},
  cinema: null,
  closeCinema: () => {},
});

export function DestinationProvider({ children, initialSlug = "australia" }: { children: ReactNode; initialSlug?: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const [cinema, setCinema] = useState<string | null>(null);

  const openCinema = useCallback((next?: string) => {
    if (next) setSlug(next);
    setCinema(next ?? slug);
  }, [slug]);

  const closeCinema = useCallback(() => setCinema(null), []);

  const value = useMemo(
    () => ({ slug, setSlug, openCinema, cinema, closeCinema }),
    [slug, openCinema, cinema, closeCinema],
  );

  return (
    <C.Provider value={value}>
      {children}
      <FlightCinema slug={cinema} onClose={closeCinema} />
    </C.Provider>
  );
}

export const useDestination = () => useContext(C);
