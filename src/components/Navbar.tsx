"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

type U = { name: string; email: string } | null;

const links = [
  { href: "/destinations", label: "Destinations" },
  { href: "/#journey", label: "Flight preview" },
  { href: "/dashboard", label: "Track visa" },
  { href: "/careers", label: "Careers" },
];

export function Navbar({ user }: { user: U }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [lifted, setLifted] = useState(false);

  /* the bar only turns into glass once you leave the top of the page */
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const router = useRouter();
  const path = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenu(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const initials = user?.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
        lifted
          ? "border-white/60 bg-white/70 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)] backdrop-blur-2xl backdrop-saturate-150"
          : "border-transparent bg-cream/60 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Nspace Visa Agency home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition hover:bg-black/5 ${
                path === l.href ? "bg-black/5" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold sm:flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://flagcdn.com/w40/bd.png" alt="" className="h-3 w-4 rounded-[2px] object-cover" />
            BD · ৳ BDT
          </span>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-bold text-white"
                aria-label="Account menu"
              >
                {initials}
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white p-1.5 shadow-xl">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-black/50">{user.email}</p>
                  </div>
                  {[
                    ["/dashboard", "Dashboard"],
                    ["/profile", "My profile"],
                    ["/destinations", "Apply for a visa"],
                  ].map(([h, l]) => (
                    <Link key={h} href={h} onClick={() => setMenu(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-black/5">
                      {l}
                    </Link>
                  ))}
                  <button onClick={logout} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden px-3 text-sm font-semibold sm:block">
                Log in
              </Link>
              <Link href="/register" className="btn btn-ink !px-4 !py-2 text-sm">
                Get started
              </Link>
            </>
          )}
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="animate-fade-up border-t border-black/5 bg-cream px-4 pb-4 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block border-b border-black/5 py-3.5 text-lg font-semibold">
              {l.label}
            </Link>
          ))}
          {!user && (
            <Link href="/login" onClick={() => setOpen(false)} className="block py-3.5 text-lg font-semibold">
              Log in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
