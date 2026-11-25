"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, flagUrl, formatBdt, getCountry, modeLabel, totalFeeBdt } from "@/lib/countries";
import { useDestination } from "./DestinationProvider";

export function HeroSearch() {
  const { slug, setSlug, openCinema } = useDestination();
  const dest = getCountry(slug)!;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [today, setToday] = useState<Date | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setToday(new Date()), []);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const list = useMemo(
    () => COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 40),
    [q],
  );

  const delivery = today
    ? new Date(today.getTime() + dest.days * 86400000).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "…";

  return (
    <div className="card relative z-20 p-3 shadow-[0_30px_80px_-30px_rgba(11,15,26,0.35)] sm:p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
        <div className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl("bd", 80)} alt="" className="h-5 w-7 rounded object-cover" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-black/45">My passport</p>
            <p className="font-semibold">Bangladesh</p>
          </div>
        </div>
        <div ref={box} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flagUrl(dest.iso, 80)} alt="" className="h-5 w-7 rounded object-cover" />
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-black/45">Going to</p>
              <p className="font-semibold">{dest.name}</p>
            </div>
            <span className="text-black/40">▾</span>
          </button>
          {open && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search destination…"
                className="w-full border-b border-black/10 px-4 py-3 text-base outline-none"
              />
              <ul className="max-h-64 overflow-y-auto">
                {list.map((c) => (
                  <li key={c.slug}>
                    <button
                      onClick={() => {
                        setSlug(c.slug);
                        setOpen(false);
                        setQ("");
                        openCinema(c.slug);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-black/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={flagUrl(c.iso, 40)} alt="" className="h-4 w-6 rounded-sm object-cover" />
                      <span className="flex-1 font-medium">{c.name}</span>
                      <span className="text-xs text-black/40">{modeLabel(c.mode)}</span>
                    </button>
                  </li>
                ))}
                {!list.length && <li className="px-4 py-4 text-sm text-black/50">No matches</li>}
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={() => openCinema(dest.slug)}
          className="btn btn-ink md:px-8"
        >
          ✈ Preview flight
        </button>
      </div>

      <div className="glass mt-3 grid grid-cols-2 gap-2 rounded-[1.4rem] p-4 sm:grid-cols-4 sm:gap-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="text-[11px] uppercase tracking-wide text-black/40">Visa you need</p>
          <p className="font-semibold leading-tight">{dest.visaType}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-black/40">Total fee</p>
          <p className="text-lg font-bold">{formatBdt(totalFeeBdt(dest))}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-black/40">Get it by</p>
          <p className="text-lg font-bold text-brand">{delivery}</p>
        </div>
        <div className="col-span-2 flex items-center sm:col-span-1">
          <Link href={`/apply-visa?destination=${dest.slug}`} className="btn btn-brand w-full !py-2.5">
            Apply now →
          </Link>
        </div>
      </div>
    </div>
  );
}
