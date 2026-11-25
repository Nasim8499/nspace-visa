"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { COUNTRIES, STAGES, flagUrl, formatBdt, getCountry } from "@/lib/countries";
import type { AppView } from "@/lib/applications";

type Hist = {
  id: number;
  destination: string;
  visaType: string;
  issuedOn: string;
  expiresOn: string;
  outcome: string;
  notes: string;
};

const ago = (iso: string, nowMs: number) => {
  const s = Math.max(0, Math.round((nowMs - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export function Dashboard({
  name,
  initial,
  completeness,
}: {
  name: string;
  initial: AppView[];
  completeness: number;
}) {
  const [apps, setApps] = useState<AppView[]>(initial);
  const [hist, setHist] = useState<Hist[]>([]);
  const [open, setOpen] = useState<string | null>(initial[0]?.id ?? null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [tab, setTab] = useState<"apps" | "history">("apps");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ destination: "australia", visaType: "", issuedOn: "", expiresOn: "", outcome: "approved", notes: "" });
  const [msg, setMsg] = useState("");

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/applications", { cache: "no-store" });
      if (r.ok) setApps((await r.json()).applications);
    } catch {
      /* offline */
    }
  }, []);
  const loadHist = useCallback(async () => {
    const r = await fetch("/api/history", { cache: "no-store" });
    if (r.ok) setHist((await r.json()).history);
  }, []);

  useEffect(() => {
    loadHist();
    const poll = setInterval(refresh, 4000);
    const tick = setInterval(() => setNowMs(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [refresh, loadHist]);

  const active = apps.filter((a) => a.status !== "approved").length;
  const approved = apps.filter((a) => a.status === "approved");
  const visited = useMemo(() => {
    const set = new Set<string>();
    hist.filter((h) => h.outcome === "approved" || h.outcome === "expired").forEach((h) => set.add(h.destination));
    approved.forEach((a) => set.add(a.destination));
    return [...set];
  }, [hist, approved]);
  const spent = apps.reduce((s, a) => s + a.amountBdt, 0);

  const feed = apps
    .flatMap((a) => a.events.map((e) => ({ ...e, app: a })))
    .sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt))
    .slice(0, 8);

  async function addHist(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const r = await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, visaType: form.visaType || getCountry(form.destination)?.visaType }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setMsg(d.error ?? "Could not save.");
    setAdding(false);
    setForm({ ...form, issuedOn: "", expiresOn: "", notes: "", visaType: "" });
    loadHist();
  }
  async function del(id: number) {
    await fetch(`/api/history?id=${id}`, { method: "DELETE" });
    loadHist();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-black/50">Dashboard</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Hi {name.split(" ")[0]} 👋</h1>
        </div>
        <Link href="/destinations" className="btn btn-brand">+ New application</Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Active applications", String(active), "🛫"],
          ["Visas approved", String(approved.length), "✅"],
          ["Countries on record", String(visited.length), "🌍"],
          ["Total paid", formatBdt(spent), "💳"],
        ].map(([k, v, i]) => (
          <div key={k} className="card p-4 sm:p-5">
            <div className="text-2xl">{i}</div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{v}</p>
            <p className="text-xs text-black/50 sm:text-sm">{k}</p>
          </div>
        ))}
      </div>

      {completeness < 100 && (
        <Link href="/profile" className="card mt-4 flex items-center gap-4 p-4 hover:bg-white/60">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sun/30 text-sm font-extrabold">{completeness}%</div>
          <div className="flex-1">
            <p className="font-bold">Complete your travel profile</p>
            <p className="text-sm text-black/55">Add passport details once and every application is pre-filled.</p>
          </div>
          <span className="text-xl">→</span>
        </Link>
      )}

      <div className="mt-8 flex gap-2">
        {([["apps", "Applications"], ["history", "Visa history"]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${tab === k ? "bg-ink text-white" : "border border-black/10 bg-white"}`}
          >
            {l}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-2 text-xs font-semibold text-black/50">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
          </span>
          Live
        </span>
      </div>

      {tab === "apps" ? (
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {!apps.length && (
              <div className="card p-10 text-center">
                <p className="text-5xl">🛂</p>
                <h3 className="mt-3 text-xl font-bold">No applications yet</h3>
                <p className="mt-1 text-black/55">Pick a destination and your first visa is minutes away.</p>
                <Link href="/destinations" className="btn btn-ink mt-5">Browse destinations</Link>
              </div>
            )}
            {apps.map((a) => {
              const isOpen = open === a.id;
              const done = a.status === "approved";
              return (
                <div key={a.id} className="card overflow-hidden">
                  <button onClick={() => setOpen(isOpen ? null : a.id)} className="flex w-full items-center gap-4 p-4 text-left sm:p-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flagUrl(a.iso, 80)} alt="" className="h-10 w-14 rounded-lg object-cover shadow" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{a.destinationName} · {a.visaType}</p>
                      <p className="text-xs text-black/50">{a.ref} · {a.travelers} traveler{a.travelers > 1 ? "s" : ""} · travel {a.travelDate}</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                        <div className={`h-full rounded-full transition-all duration-1000 ${done ? "bg-mint" : "bg-brand"}`} style={{ width: `${a.progress}%` }} />
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${done ? "bg-mint/15 text-mint" : "bg-brand/10 text-brand"}`}>
                      {STAGES[a.stageIndex]?.label ?? a.status}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="animate-fade-up border-t border-black/5 bg-cream/60 p-4 sm:p-6">
                      <ol className="space-y-4">
                        {STAGES.map((s, i) => {
                          const ev = a.events.find((e) => e.status === s.key);
                          const reached = i <= a.stageIndex;
                          const current = i === a.stageIndex && !done;
                          return (
                            <li key={s.key} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                                    reached ? "bg-mint text-white" : "bg-black/10 text-black/40"
                                  } ${current ? "ring-4 ring-mint/25" : ""}`}
                                >
                                  {reached ? "✓" : i + 1}
                                </span>
                                {i < STAGES.length - 1 && <span className={`mt-1 w-0.5 flex-1 ${i < a.stageIndex ? "bg-mint" : "bg-black/10"}`} />}
                              </div>
                              <div className="pb-1">
                                <p className={`font-semibold ${reached ? "" : "text-black/40"}`}>{s.label}</p>
                                <p className="text-sm text-black/55">{reached ? s.note : "Pending"}</p>
                                {ev && <p className="text-xs text-black/40">{ago(ev.createdAt, nowMs)}</p>}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-white p-4 text-sm">
                        <span><b>{formatBdt(a.amountBdt)}</b> paid via {a.paymentMethod}</span>
                        <span className="text-black/50">Applicant: {a.fullName}</span>
                        <Link href={`/visa/${a.destination}`} className="ml-auto font-semibold text-brand">View visa page →</Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <aside className="card h-fit p-5">
            <h3 className="font-extrabold">Live activity</h3>
            <ul className="mt-4 space-y-4">
              {feed.map((f) => (
                <li key={f.id} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flagUrl(f.app.iso, 40)} alt="" className="mt-1 h-3.5 w-5 rounded-sm object-cover" />
                  <div>
                    <p className="text-sm font-semibold leading-tight">{STAGES.find((s) => s.key === f.status)?.label}</p>
                    <p className="text-xs text-black/50">{f.app.destinationName} · {ago(f.createdAt, nowMs)}</p>
                  </div>
                </li>
              ))}
              {!feed.length && <li className="text-sm text-black/50">Updates will appear here in real time.</li>}
            </ul>
          </aside>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold">Countries on record</h3>
                <p className="text-sm text-black/50">{visited.length} of {COUNTRIES.length} destinations</p>
              </div>
              <button className="btn btn-ink !px-4 !py-2 text-sm" onClick={() => setAdding(!adding)}>
                {adding ? "Close" : "+ Add past visa"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {visited.map((s) => {
                const c = getCountry(s)!;
                return (
                  <Link key={s} href={`/visa/${s}`} className="flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-sm font-semibold">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flagUrl(c.iso, 40)} alt="" className="h-3.5 w-5 rounded-sm" />
                    {c.name}
                  </Link>
                );
              })}
              {!visited.length && <p className="text-sm text-black/50">Add visas you already hold to build your travel history.</p>}
            </div>
            {adding && (
              <form onSubmit={addHist} className="mt-5 grid gap-3 border-t border-black/5 pt-5 sm:grid-cols-2">
                <div>
                  <label className="label">Country</label>
                  <select className="input" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}>
                    {COUNTRIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Visa type (optional)</label>
                  <input className="input" value={form.visaType} onChange={(e) => setForm({ ...form, visaType: e.target.value })} placeholder={getCountry(form.destination)?.visaType} />
                </div>
                <div>
                  <label className="label">Issued on</label>
                  <input className="input" type="date" required value={form.issuedOn} onChange={(e) => setForm({ ...form, issuedOn: e.target.value })} />
                </div>
                <div>
                  <label className="label">Expires on</label>
                  <input className="input" type="date" value={form.expiresOn} onChange={(e) => setForm({ ...form, expiresOn: e.target.value })} />
                </div>
                <div>
                  <label className="label">Outcome</label>
                  <select className="input" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })}>
                    <option value="approved">Approved</option>
                    <option value="expired">Expired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                {msg && <p className="text-sm font-medium text-red-600 sm:col-span-2">{msg}</p>}
                <button className="btn btn-brand sm:col-span-2">Save to history</button>
              </form>
            )}
          </div>

          <div className="space-y-3">
            {hist.map((h) => {
              const c = getCountry(h.destination);
              return (
                <div key={h.id} className="card flex items-center gap-4 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flagUrl(c?.iso ?? "un", 80)} alt="" className="h-10 w-14 rounded-lg object-cover shadow" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{c?.name} · {h.visaType}</p>
                    <p className="text-xs text-black/50">Issued {h.issuedOn}{h.expiresOn && ` · expires ${h.expiresOn}`}{h.notes && ` · ${h.notes}`}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${h.outcome === "approved" ? "bg-mint/15 text-mint" : h.outcome === "rejected" ? "bg-red-50 text-red-600" : "bg-black/5 text-black/50"}`}>
                    {h.outcome}
                  </span>
                  <button onClick={() => del(h.id)} aria-label="Delete" className="text-black/30 hover:text-red-600">✕</button>
                </div>
              );
            })}
            {approved.map((a) => (
              <div key={a.id} className="card flex items-center gap-4 border-mint/30 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagUrl(a.iso, 80)} alt="" className="h-10 w-14 rounded-lg object-cover shadow" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{a.destinationName} · {a.visaType}</p>
                  <p className="text-xs text-black/50">Nspace application {a.ref}</p>
                </div>
                <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-bold text-mint">Approved</span>
              </div>
            ))}
            {!hist.length && !approved.length && <p className="py-8 text-center text-black/50">No visa history yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
