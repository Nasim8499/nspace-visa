"use client";

import { useMemo, useState } from "react";
import { CONTINENTS, COUNTRIES } from "@/lib/countries";
import { CountryCard } from "./CountryCard";
import { useDestination } from "./DestinationProvider";

export function CountryExplorer({ limit, preview = false }: { limit?: number; preview?: boolean }) {
  const [q, setQ] = useState("");
  const [cont, setCont] = useState("All");
  const [mode, setMode] = useState("all");
  const [sort, setSort] = useState("popular");
  const { setSlug, openCinema } = useDestination();

  const list = useMemo(() => {
    let l = COUNTRIES.filter(
      (c) =>
        (cont === "All" || c.continent === cont) &&
        (mode === "all" || c.mode === mode) &&
        (c.name + c.visaType).toLowerCase().includes(q.toLowerCase()),
    );
    if (sort === "price") l = [...l].sort((a, b) => a.govUsd - b.govUsd);
    else if (sort === "fast") l = [...l].sort((a, b) => a.days - b.days);
    else if (sort === "name") l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    else l = [...l].sort((a, b) => Number(b.popular) - Number(a.popular));
    return limit ? l.slice(0, limit) : l;
  }, [q, cont, mode, sort, limit]);

  function onPreview(slug: string) {
    setSlug(slug);
    openCinema(slug);
  }

  return (
    <div>
      {!limit && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search country or visa type…"
              className="input flex-1"
            />
            <div className="flex gap-2">
              <select value={mode} onChange={(e) => setMode(e.target.value)} className="input !w-auto">
                <option value="all">All visa types</option>
                <option value="evisa">e-Visa</option>
                <option value="arrival">On arrival</option>
                <option value="embassy">Embassy visa</option>
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto">
                <option value="popular">Popular</option>
                <option value="fast">Fastest</option>
                <option value="price">Lowest fee</option>
                <option value="name">A–Z</option>
              </select>
            </div>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {CONTINENTS.map((c) => (
              <button
                key={c}
                onClick={() => setCont(c)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  cont === c ? "border-ink bg-ink text-white" : "border-black/10 bg-white hover:bg-black/5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((c) => (
          <CountryCard key={c.slug} c={c} onPreview={preview ? onPreview : undefined} />
        ))}
      </div>
      {!list.length && <p className="py-16 text-center text-black/50">No destinations match your search.</p>}
    </div>
  );
}
