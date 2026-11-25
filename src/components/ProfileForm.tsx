"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type P = {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  dob: string;
  city: string;
};

export function ProfileForm({ user, since }: { user: P; since: string }) {
  const router = useRouter();
  const [f, setF] = useState(user);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const set = (k: keyof P) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, t: d.error ?? "Could not save." });
    setMsg({ ok: true, t: "Profile saved. Your next application will be pre-filled." });
    router.refresh();
  }

  const initials = f.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-brand text-xl font-extrabold text-white">{initials}</div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{f.name}</h1>
          <p className="text-sm text-black/50">{user.email} · member since {since}</p>
        </div>
      </div>
      <form onSubmit={save} className="card mt-8 grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
        <h2 className="text-lg font-extrabold sm:col-span-2">Personal & passport details</h2>
        <div className="sm:col-span-2">
          <label className="label">Full name</label>
          <input className="input" value={f.name} onChange={set("name")} required />
        </div>
        <div>
          <label className="label">Email (login)</label>
          <input className="input bg-black/5" value={f.email} disabled />
        </div>
        <div>
          <label className="label">Phone / WhatsApp</label>
          <input className="input" type="tel" value={f.phone} onChange={set("phone")} />
        </div>
        <div>
          <label className="label">Nationality</label>
          <input className="input" value={f.nationality} onChange={set("nationality")} />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" value={f.city} onChange={set("city")} />
        </div>
        <div>
          <label className="label">Passport number</label>
          <input className="input uppercase" value={f.passportNumber} onChange={set("passportNumber")} />
        </div>
        <div>
          <label className="label">Passport expiry</label>
          <input className="input" type="date" value={f.passportExpiry} onChange={set("passportExpiry")} />
        </div>
        <div>
          <label className="label">Date of birth</label>
          <input className="input" type="date" value={f.dob} onChange={set("dob")} />
        </div>
        {msg && (
          <p className={`rounded-xl px-4 py-3 text-sm font-medium sm:col-span-2 ${msg.ok ? "bg-mint/10 text-mint" : "bg-red-50 text-red-600"}`}>{msg.t}</p>
        )}
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button className="btn btn-ink" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
          <button
            type="button"
            className="btn btn-ghost !text-red-600"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
              router.refresh();
            }}
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  );
}
