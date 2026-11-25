"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const isReg = mode === "register";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error ?? "Something went wrong.");
    router.push(next);
    router.refresh();
  }

  const q = next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form onSubmit={submit} className="card w-full max-w-md space-y-4 p-6 shadow-xl sm:p-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{isReg ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-black/55">
          {isReg ? "Save your details once and apply to any country in minutes." : "Log in to track your visa applications live."}
        </p>
      </div>
      {isReg && (
        <div>
          <label className="label">Full name (as on passport)</label>
          <input className="input" required value={f.name} onChange={set("name")} autoComplete="name" />
        </div>
      )}
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" required value={f.email} onChange={set("email")} autoComplete="email" />
      </div>
      {isReg && (
        <div>
          <label className="label">Phone / WhatsApp</label>
          <input className="input" type="tel" placeholder="+8801…" value={f.phone} onChange={set("phone")} autoComplete="tel" />
        </div>
      )}
      <div>
        <label className="label">Password</label>
        <div className="relative">
          <input
            className="input pr-16"
            type={show ? "text" : "password"}
            required
            minLength={6}
            value={f.password}
            onChange={set("password")}
            autoComplete={isReg ? "new-password" : "current-password"}
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-brand">
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{err}</p>}
      <button className="btn btn-ink w-full !py-3.5" disabled={busy}>
        {busy ? "Please wait…" : isReg ? "Create account" : "Log in"}
      </button>
      <p className="text-center text-sm text-black/55">
        {isReg ? "Already have an account?" : "New to Nspace?"}{" "}
        <Link href={(isReg ? "/login" : "/register") + q} className="font-semibold text-brand">
          {isReg ? "Log in" : "Create account"}
        </Link>
      </p>
    </form>
  );
}
