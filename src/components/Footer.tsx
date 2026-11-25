import Link from "next/link";
import { COUNTRIES } from "@/lib/countries";
import { Logo } from "./Logo";

export function Footer() {
  const top = COUNTRIES.filter((c) => c.popular).slice(0, 8);
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Nspace Visa Agency helps Bangladeshi travellers get visas on time — live tracking, expert document checks and
            human support 24×7.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white/90">Popular visas</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            {top.map((c) => (
              <li key={c.slug}>
                <Link className="hover:text-white" href={`/visa/${c.slug}`}>
                  {c.name} visa
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white/90">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            <li><Link className="hover:text-white" href="/careers">Careers</Link></li>
            <li><Link className="hover:text-white" href="/destinations">All destinations</Link></li>
            <li><Link className="hover:text-white" href="/dashboard">Track application</Link></li>
            <li><Link className="hover:text-white" href="/register">Create account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white/90">Support</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            <li>Chat & call · 24 × 7</li>
            <li>support@nspacevisa.com</li>
            <li>Dhaka, Bangladesh</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © 2026 Nspace Visa Agency. Fees shown are indicative; final amounts confirmed before payment.
      </div>
    </footer>
  );
}
