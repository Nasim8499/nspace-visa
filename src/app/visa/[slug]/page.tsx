import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Faq } from "@/components/Faq";
import { CountryCard } from "@/components/CountryCard";
import { FlightPreviewButton } from "@/components/FlightPreviewButton";
import {
  COUNTRIES,
  SERVICE_FEE_BDT,
  documentsFor,
  faqsFor,
  flagUrl,
  flightHours,
  formatBdt,
  getCountry,
  govFeeBdt,
  haversineKm,
  highlightsFor,
  modeLabel,
  ORIGIN,
  stepsFor,
  totalFeeBdt,
} from "@/lib/countries";

const HERO: Record<string, string> = {
  australia:
    "https://images.pexels.com/photos/26834716/pexels-photo-26834716.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1800",
};

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const c = getCountry(slug);
  if (!c) return {};
  return {
    title: `${c.name} Visa for Bangladeshi Citizens: Fees, Documents & Process — Nspace`,
    description: `Apply for the ${c.visaType} online. Fee ${formatBdt(totalFeeBdt(c))}, delivered in ${c.days} days.`,
  };
}

export default async function VisaPage({ params }: P) {
  const { slug } = await params;
  const c = getCountry(slug);
  if (!c) notFound();

  const delivery = new Date(Date.now() + c.days * 86400000).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const docs = documentsFor(c);
  const steps = stepsFor(c);
  const faqs = faqsFor(c);
  const related = COUNTRIES.filter((x) => x.continent === c.continent && x.slug !== c.slug).slice(0, 4);
  const facts: [string, string][] = [
    ["Visa type", c.visaType],
    ["Category", modeLabel(c.mode)],
    ["Processing time", `${c.days} ${c.days === 1 ? "day" : "days"}`],
    ["Stay per visit", `${c.stay} days`],
    ["Validity", c.validity],
    ["Entry", c.entry],
  ];
  const hero = HERO[c.slug];

  return (
    <div>
      {/* banner */}
      <section className="relative overflow-hidden border-b border-black/5">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero} alt={`${c.name} landmarks`} className="absolute inset-0 h-full w-full object-cover opacity-25" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flagUrl(c.iso, 640)} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-20 blur-2xl" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-[#faf8f4]/85 to-[#faf8f4]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14">
          <nav className="text-sm text-black/45">
            <Link href="/" className="hover:text-ink">Home</Link> / <Link href="/destinations" className="hover:text-ink">Visas</Link> / <span className="text-ink">{c.name}</span>
          </nav>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flagUrl(c.iso, 160)} alt={`${c.name} flag`} className="h-11 w-16 rounded-xl object-cover shadow-[0_10px_24px_-14px_rgba(15,23,42,0.6)] ring-1 ring-black/5" />
            <h1 className="text-[2rem] font-extrabold leading-none tracking-tight sm:text-5xl">{c.name} visa</h1>
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black/55">
            <span className="rounded-full border border-black/5 bg-white px-3 py-1 font-semibold text-ink">{c.visaType}</span>
            <span>Ready in ~{c.days} {c.days === 1 ? "day" : "days"}</span>
            <span className="text-black/25">·</span>
            <span>{haversineKm(ORIGIN, c).toFixed(0)} km from Dhaka</span>
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-12">
          {/* facts */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k} className="card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-black/45">{k}</p>
                <p className="mt-1 font-bold leading-snug">{v}</p>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">About the {c.name} visa</h2>
            <p className="mt-3 leading-relaxed text-black/65">
              Bangladeshi passport holders travelling to {c.name} for tourism, family visits or short business trips need a{" "}
              <strong>{c.visaType}</strong>. It allows a stay of up to {c.stay} days per visit and is valid for{" "}
              {c.validity.toLowerCase()} ({c.entry.toLowerCase()} entry). Nspace prepares your forms, checks every document
              and submits your application so approval comes sooner and with fewer surprises.
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {highlightsFor(c).map((h) => (
                <li key={h} className="glass-soft flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-mint/15 text-mint">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </section>

          {c.slug === "australia" && (
            <section className="card bg-gradient-to-br from-white to-brand/5 p-6">
              <h2 className="text-xl font-extrabold">Multiple-entry Australia visa, explained</h2>
              <p className="mt-2 leading-relaxed text-black/65">
                A multiple-entry visa allows you to enter Australia more than once within the visa&apos;s validity period. With a
                12-month visa allowing 3 months per visit, you could stay from month 1 to month 3, leave, and return from month 7
                to month 9. Just never exceed the permitted stay on each visit. Some visitor visas also carry condition 8558 —
                no more than 12 months in any 18-month period.
              </p>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Documents required</h2>
            <ul className="glass mt-4 divide-y divide-black/5 overflow-hidden rounded-3xl">
              {docs.map((d, i) => (
                <li key={d} className="flex items-start gap-4 px-5 py-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span>
                  <span className="pt-0.5">{d}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">How it works</h2>
            <ol className="mt-5 space-y-4 border-l-2 border-dashed border-brand/30 pl-6">
              {steps.map((s, i) => (
                <li key={s.title} className="relative">
                  <span className="absolute -left-[2.2rem] grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-black/60">{s.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Fee breakdown</h2>
            <div className="card mt-4 divide-y divide-black/5">
              <Row k="Government / embassy fee" v={formatBdt(govFeeBdt(c))} />
              <Row k="Nspace service fee" v={formatBdt(SERVICE_FEE_BDT)} />
              <Row k="Total per traveler" v={formatBdt(totalFeeBdt(c))} bold />
            </div>
            <p className="mt-2 text-xs text-black/45">Indicative fees. Government fees can change; the final amount is confirmed before payment.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{c.name} visa FAQs</h2>
            <div className="mt-4">
              <Faq items={faqs} />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">More visas in {c.continent}</h2>
            <div className="mt-4 grid gap-4 min-[480px]:grid-cols-2">
              {related.map((r) => (
                <CountryCard key={r.slug} c={r} />
              ))}
            </div>
          </section>
        </div>

        {/* sticky apply card */}
        <aside className="hidden lg:block">
          <ApplyCard slug={c.slug} price={totalFeeBdt(c)} delivery={delivery} days={c.days} />
        </aside>
      </div>

      {/* mobile CTA */}
      <div className="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-40 border-t border-white/60 bg-white/75 p-3 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_-10px_30px_-26px_rgba(15,23,42,0.5)] lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase text-black/45">Total from</p>
            <p className="text-lg font-extrabold leading-none">{formatBdt(totalFeeBdt(c))}</p>
          </div>
          <Link href={`/apply-visa?destination=${c.slug}`} className="btn btn-brand flex-1 !py-3">
            Apply now
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${bold ? "text-lg font-extrabold" : ""}`}>
      <span className={bold ? "" : "text-black/65"}>{k}</span>
      <span>{v}</span>
    </div>
  );
}

function ApplyCard({ slug, price, delivery, days }: { slug: string; price: number; delivery: string; days: number }) {
  return (
    <div className="card sticky top-24 p-6 shadow-[0_30px_70px_-35px_rgba(11,15,26,0.4)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-black/45">Total per traveler</p>
      <p className="mt-1 text-4xl font-extrabold tracking-tight">{formatBdt(price)}</p>
      <div className="mt-5 rounded-2xl bg-gradient-to-br from-brand to-[#7a5cff] p-4 text-white shadow-[0_18px_40px_-24px_rgba(47,91,255,0.9)]">
        <p className="text-xs uppercase tracking-wide text-white/70">Get your visa by</p>
        <p className="text-lg font-bold text-sun">{delivery}</p>
        <p className="text-xs text-white/70">Processing ~{days} {days === 1 ? "day" : "days"}</p>
      </div>
      <ul className="mt-5 space-y-2.5 text-sm">
        {["On-time or service fee refunded", "Free re-application if denied", "Live tracking in your dashboard", "24×7 human support"].map((t) => (
          <li key={t} className="flex gap-2.5">
            <span className="text-mint">✓</span>
            {t}
          </li>
        ))}
      </ul>
      <Link href={`/apply-visa?destination=${slug}`} className="btn btn-brand mt-6 w-full !py-3.5 text-base">
        Apply now →
      </Link>
      <FlightPreviewButton slug={slug} />
    </div>
  );
}
