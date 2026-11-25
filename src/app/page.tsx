import Link from "next/link";
import { DestinationProvider } from "@/components/DestinationProvider";
import { HeroSearch } from "@/components/HeroSearch";
import { FlightJourney } from "@/components/FlightJourney";
import { CountryExplorer } from "@/components/CountryExplorer";
import { Reveal, Rise, Stagger } from "@/components/Reveal";
import { Faq } from "@/components/Faq";
import { COUNTRIES, flagUrl } from "@/lib/countries";

const stats = [
  ["98.9%", "visas approved"],
  ["On time", "or fee refunded"],
  ["45+", "destinations"],
  ["24 × 7", "human support"],
  ["ISO 27001", "grade data security"],
];

const steps = [
  ["01", "Tell us where you’re flying", "Pick passport and destination. See the exact visa, fee and date."],
  ["02", "Upload once", "Passport and photo. We fill the government forms and check every document."],
  ["03", "Track live, arrive on time", "Every step in real time. Late? Our service fee comes back."],
];

const perks = [
  ["⏱", "On time, or refunded", "Miss the promised date and our fee comes back."],
  ["🛡", "Free re-application", "Denied before? We rebuild the case at no cost."],
  ["📡", "Live tracking", "Real-time status, real humans on chat and call."],
  ["💸", "One flat fee", "Government fee plus a single service fee. Nothing hidden."],
];

const faqs = [
  { q: "Do I need a visa for my destination?", a: "Choose your passport and destination above — we’ll instantly show whether you need a visa, an eTA, or visa on arrival, plus the fee and processing time." },
  { q: "What happens if my visa is late?", a: "Every visa shows a delivery date before you pay. If your visa arrives after that date, Nspace refunds our service fee in full." },
  { q: "How long does it take to get my visa?", a: "From minutes for an arrival card to a few days for most e-visas, and a few weeks for embassy visas. The exact date is shown on each visa before you start." },
  { q: "What happens if my visa is denied?", a: "We build a free re-application strategy with you. If it is denied again, you get our service fee back." },
  { q: "Can I apply for my whole family in one go?", a: "Yes. Add every traveler to a single application — one upload, one payment, and one delivery date for the whole group." },
  { q: "Which documents do I need?", a: "For most e-visas, just your passport and a photo. Anything extra is listed on the visa page before you pay, and we check every document before it is submitted." },
];

export default function Home() {
  const flags = COUNTRIES.slice(0, 24);
  return (
    <DestinationProvider>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
          <Stagger className="mx-auto max-w-3xl text-center">
            <Rise>
              <p className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold sm:text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl("bd", 40)} alt="" className="h-3 w-4 rounded-[2px]" />
                Bangladeshi passport · {COUNTRIES.length}+ destinations
              </p>
            </Rise>
            <Rise>
              <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
                Your visa.
                <br />
                <span className="bg-gradient-to-r from-brand to-[#7a5cff] bg-clip-text text-transparent">On time. Always.</span>
              </h1>
            </Rise>
            <Rise>
              <p className="mx-auto mt-5 max-w-md text-base text-black/55 sm:text-lg">
                Exact visa, fee and delivery date before you pay. We handle the paperwork.
              </p>
            </Rise>
          </Stagger>
          <Stagger className="mx-auto mt-9 max-w-4xl">
            <Rise>
              <HeroSearch />
            </Rise>
          </Stagger>

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-x-4 gap-y-6 text-center sm:grid-cols-5">
            {stats.map(([a, b]) => (
              <div key={b}>
                <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">{a}</p>
                <p className="text-xs text-black/50 sm:text-sm">{b}</p>
              </div>
            ))}
          </div>
        </div>
        {/* flag marquee */}
        <div className="overflow-hidden border-y border-black/5 bg-white py-4">
          <div className="flex w-max animate-marquee gap-10">
            {[...flags, ...flags].map((c, i) => (
              <Link key={i} href={`/visa/${c.slug}`} className="flex items-center gap-2.5 whitespace-nowrap text-sm font-semibold text-black/70 hover:text-brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl(c.iso, 40)} alt="" className="h-4 w-6 rounded-sm object-cover" />
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FLIGHT PREVIEW */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Journey preview</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">Scroll to fly from Dhaka to your destination</h2>
          <p className="mt-3 text-black/60">
            A real-time flight with live distance, altitude, local time and cabin sound. Pick any country and watch the plane
            land there.
          </p>
        </Reveal>
      </section>
      <div className="mt-8">
        <FlightJourney />
      </div>

      {/* POPULAR */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Popular from Bangladesh</h2>
            <p className="mt-2 text-black/60">Live delivery dates and fees in BDT. No hidden charges.</p>
          </div>
          <Link href="/destinations" className="btn btn-ghost">
            View all {COUNTRIES.length} destinations →
          </Link>
        </Reveal>
        <div className="mt-8">
          <CountryExplorer limit={12} preview />
        </div>
      </section>

      {/* STEPS */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Your visa in three steps</h2>
          <p className="mt-3 text-black/55">No queues, no confusing forms. You just travel.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map(([n, t, b], i) => (
            <Reveal key={n} delay={i * 100}>
              <div className="card h-full p-7">
                <span className="text-5xl font-extrabold text-brand/20">{n}</span>
                <h3 className="mt-3 text-xl font-bold">{t}</h3>
                <p className="mt-2 leading-relaxed text-black/60">{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PERKS */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="glass overflow-hidden rounded-[2rem] p-6 sm:p-12">
          <Reveal>
            <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-5xl">Your visa comes with more</h2>
            <p className="mt-3 max-w-md text-black/55">
              On-time delivery, live tracking and human support, on every application.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map(([i, t, b], k) => (
              <Reveal key={t} delay={k * 80}>
                <div className="sheen h-full rounded-3xl border border-white/70 bg-white/70 p-6 transition hover:border-brand/25 hover:bg-white">
                  <div className="text-3xl">{i}</div>
                  <h3 className="mt-4 text-lg font-bold">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/55">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-20 grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Questions, answered</h2>
          <p className="mt-3 text-black/60">Still unsure? Talk to a visa expert on live chat — free, any time.</p>
          <a href="mailto:support@nspacevisa.com" className="btn btn-ink mt-6">
            Talk to an expert
          </a>
        </Reveal>
        <Reveal delay={100}>
          <Faq items={faqs} />
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <div className="rounded-[2rem] bg-gradient-to-br from-brand to-[#6a4dff] p-8 text-center text-white shadow-[0_40px_90px_-50px_rgba(47,91,255,0.9)] sm:p-14">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Ready for take-off?</h2>
          <p className="mx-auto mt-3 max-w-sm text-white/80">Save your passport once. Apply to any country in minutes.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="btn sheen bg-white text-ink">Create free account</Link>
            <Link href="/destinations" className="btn sheen border border-white/40 text-white">Browse destinations</Link>
          </div>
        </div>
      </section>
    </DestinationProvider>
  );
}
