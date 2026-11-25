"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  COUNTRIES,
  SERVICE_FEE_BDT,
  documentsFor,
  flagUrl,
  formatBdt,
  getCountry,
  govFeeBdt,
  modeLabel,
  totalFeeBdt,
} from "@/lib/countries";

type U = { name: string; email: string; phone: string; passportNumber: string; passportExpiry: string; dob: string };

const PAY = [
  ["bKash", "📱"],
  ["Nagad", "📲"],
  ["Card", "💳"],
  ["Bank transfer", "🏦"],
] as const;

export function ApplyWizard({ user, initial }: { user: U; initial: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [slug, setSlug] = useState(getCountry(initial)?.slug ?? "australia");
  const [purpose, setPurpose] = useState("Tourism");
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [t, setT] = useState({
    fullName: user.name,
    passportNumber: user.passportNumber,
    passportExpiry: user.passportExpiry,
    dob: user.dob,
    email: user.email,
    phone: user.phone,
  });
  const [pay, setPay] = useState("bKash");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ ref: string } | null>(null);

  const c = getCountry(slug)!;
  const total = totalFeeBdt(c, travelers);
  const today = new Date().toISOString().slice(0, 10);
  const docs = useMemo(() => documentsFor(c), [c]);
  const setField = (k: keyof typeof t) => (e: React.ChangeEvent<HTMLInputElement>) => setT({ ...t, [k]: e.target.value });

  function next() {
    setErr("");
    if (step === 0) {
      if (!travelDate) return setErr("Please choose your travel date.");
      if (travelDate < today) return setErr("Travel date cannot be in the past.");
    }
    if (step === 1) {
      for (const [k, v] of Object.entries(t)) if (!v.trim()) return setErr(`Please fill in: ${k.replace(/([A-Z])/g, " $1").toLowerCase()}.`);
      if (!/^[A-Za-z0-9]{6,12}$/.test(t.passportNumber)) return setErr("Passport number should be 6–12 letters/digits.");
      const minExpiry = new Date(travelDate);
      minExpiry.setMonth(minExpiry.getMonth() + 6);
      if (new Date(t.passportExpiry) < minExpiry) return setErr("Your passport must be valid for at least 6 months after your travel date.");
    }
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (!agree) return setErr("Please accept the terms to continue.");
    setBusy(true);
    setErr("");
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination: slug, purpose, travelDate, travelers, paymentMethod: pay, ...t }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error ?? "Could not submit your application.");
    setDone({ ref: data.ref });
    router.refresh();
  }

  if (done) {
    return (
      <div className="card animate-fade-up mx-auto max-w-xl p-8 text-center shadow-xl">
        <div className="mx-auto grid h-20 w-20 animate-float place-items-center rounded-full bg-mint/15 text-4xl">🎉</div>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight">Application submitted!</h1>
        <p className="mt-2 text-black/60">
          Your {c.name} visa application <strong className="text-ink">{done.ref}</strong> is now being processed. Watch each step
          live in your dashboard.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="btn btn-brand">Track live status</Link>
          <Link href="/destinations" className="btn btn-ghost">Apply for another visa</Link>
        </div>
      </div>
    );
  }

  const steps = ["Trip", "Traveler", "Review & pay"];

  return (
    <div className="mx-auto max-w-6xl">
      <ol className="mb-8 flex items-center gap-2 sm:gap-4">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2 sm:gap-3">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition ${
                i <= step ? "bg-brand text-white" : "bg-black/10 text-black/50"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className={`hidden text-sm font-semibold sm:block ${i <= step ? "" : "text-black/40"}`}>{s}</span>
            {i < steps.length - 1 && <span className={`h-0.5 flex-1 rounded ${i < step ? "bg-brand" : "bg-black/10"}`} />}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card animate-fade-up p-5 sm:p-8" key={step}>
          {step === 0 && (
            <div className="space-y-5">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Where are you travelling?</h1>
              <div>
                <label className="label">Destination</label>
                <select className="input" value={slug} onChange={(e) => setSlug(e.target.value)}>
                  {COUNTRIES.map((x) => (
                    <option key={x.slug} value={x.slug}>
                      {x.name} — {x.visaType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Purpose of visit</label>
                  <select className="input" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                    {["Tourism", "Business", "Family visit", "Transit", "Medical"].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Planned travel date</label>
                  <input className="input" type="date" min={today} value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Number of travelers</label>
                <div className="inline-flex items-center gap-4 rounded-full border border-black/10 bg-white p-1.5">
                  <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-black/5 text-xl" onClick={() => setTravelers(Math.max(1, travelers - 1))}>−</button>
                  <span className="w-6 text-center text-lg font-bold">{travelers}</span>
                  <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-black/5 text-xl" onClick={() => setTravelers(Math.min(10, travelers + 1))}>+</button>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Lead traveler details</h1>
              <p className="-mt-3 text-sm text-black/55">Exactly as printed on the passport. {travelers > 1 && `We’ll collect the other ${travelers - 1} traveler(s) on WhatsApp.`}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Full name</label>
                  <input className="input" value={t.fullName} onChange={setField("fullName")} autoComplete="name" />
                </div>
                <div>
                  <label className="label">Passport number</label>
                  <input className="input uppercase" value={t.passportNumber} onChange={setField("passportNumber")} />
                </div>
                <div>
                  <label className="label">Passport expiry</label>
                  <input className="input" type="date" value={t.passportExpiry} onChange={setField("passportExpiry")} />
                </div>
                <div>
                  <label className="label">Date of birth</label>
                  <input className="input" type="date" max={today} value={t.dob} onChange={setField("dob")} />
                </div>
                <div>
                  <label className="label">Phone / WhatsApp</label>
                  <input className="input" type="tel" value={t.phone} onChange={setField("phone")} autoComplete="tel" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Email for visa delivery</label>
                  <input className="input" type="email" value={t.email} onChange={setField("email")} autoComplete="email" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Review & pay</h1>
              <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-cream p-4 text-sm">
                {[
                  ["Destination", c.name],
                  ["Visa", c.visaType],
                  ["Travel date", travelDate],
                  ["Travelers", String(travelers)],
                  ["Traveler", t.fullName],
                  ["Passport", t.passportNumber.toUpperCase()],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-black/45">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <p className="label">Documents you’ll upload next (checklist)</p>
                <ul className="space-y-1.5 text-sm text-black/65">
                  {docs.slice(0, 4).map((d) => (
                    <li key={d}>▫ {d}</li>
                  ))}
                  {docs.length > 4 && <li className="text-black/40">+ {docs.length - 4} more on the visa page</li>}
                </ul>
              </div>
              <div>
                <p className="label">Payment method</p>
                <div className="grid grid-cols-2 gap-3">
                  {PAY.map(([name, icon]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setPay(name)}
                      className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition ${
                        pay === name ? "border-brand bg-brand/5" : "border-black/10 bg-white"
                      }`}
                    >
                      <span className="text-xl">{icon}</span>
                      {name}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-black/45">Demo checkout — no real payment is taken.</p>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1 h-5 w-5 accent-[#2f5bff]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span className="text-black/65">I confirm the details are correct and agree to Nspace’s terms and the on-time refund policy.</span>
              </label>
            </div>
          )}

          {err && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{err}</p>}
          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <button className="btn btn-ink" onClick={next}>Continue →</button>
            ) : (
              <button className="btn btn-brand" onClick={submit} disabled={busy}>
                {busy ? "Submitting…" : `Pay ${formatBdt(total)} & submit`}
              </button>
            )}
          </div>
        </div>

        {/* summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <div className="relative h-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl(c.iso, 640)} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <p className="text-xs font-semibold opacity-80">{modeLabel(c.mode)}</p>
                <p className="text-xl font-extrabold">{c.name}</p>
              </div>
            </div>
            <div className="space-y-2.5 p-5 text-sm">
              <p className="font-semibold">{c.visaType}</p>
              <div className="flex justify-between text-black/65"><span>Government fee × {travelers}</span><span>{formatBdt(govFeeBdt(c) * travelers)}</span></div>
              <div className="flex justify-between text-black/65"><span>Service fee × {travelers}</span><span>{formatBdt(SERVICE_FEE_BDT * travelers)}</span></div>
              <div className="flex justify-between border-t border-black/10 pt-3 text-lg font-extrabold"><span>Total</span><span>{formatBdt(total)}</span></div>
              <p className="text-xs text-black/45">Processing ~{c.days} {c.days === 1 ? "day" : "days"} · On-time or fee refunded</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
