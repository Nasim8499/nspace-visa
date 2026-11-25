"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { flagUrl, formatBdt, modeLabel, totalFeeBdt, type Country } from "@/lib/countries";

export function CountryCard({ c, onPreview }: { c: Country; onPreview?: (slug: string) => void }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="group card sheen relative overflow-hidden"
      whileHover={reduce ? undefined : { y: -6, scale: 1.012 }}
      whileTap={reduce ? undefined : { scale: 0.995 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, mass: 0.7 }}
      style={{ willChange: "transform" }}
    >
      <Link href={`/visa/${c.slug}`} className="block">
        <div className="relative h-32 overflow-hidden bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flagUrl(c.iso, 320)}
            alt={`${c.name} flag`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold">
            {modeLabel(c.mode)}
          </span>
          {c.days <= 3 && (
            <span className="absolute right-3 top-3 rounded-full bg-sun px-2.5 py-1 text-[11px] font-bold">⚡ Fast</span>
          )}
          <h3 className="absolute bottom-3 left-4 text-xl font-bold text-white drop-shadow">{c.name}</h3>
        </div>
        <div className="space-y-1 p-4">
          <p className="truncate text-sm text-black/60">{c.visaType}</p>
          <div className="flex items-end justify-between pt-1">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-black/40">Starting at</p>
              <p className="text-lg font-bold">{formatBdt(totalFeeBdt(c))}</p>
            </div>
            <p className="rounded-full bg-[#12b886]/12 px-3 py-1 text-xs font-semibold text-[#0a7a5a]">
              {c.days} {c.days === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      </Link>
      {onPreview && (
        <button
          onClick={() => onPreview(c.slug)}
          className="absolute bottom-[4.4rem] right-4 hidden rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 md:block"
        >
          ✈ Preview
        </button>
      )}
    </motion.div>
  );
}