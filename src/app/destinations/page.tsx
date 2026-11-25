import { CountryExplorer } from "@/components/CountryExplorer";
import { DestinationProvider } from "@/components/DestinationProvider";
import { COUNTRIES } from "@/lib/countries";

export const metadata = { title: "All visa destinations — Nspace Visa Agency" };

export default function Destinations() {
  return (
    <DestinationProvider>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Destinations</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-6xl">Visas for every trip</h1>
        <p className="mt-3 max-w-xl text-black/60">
          {COUNTRIES.length} destinations for Bangladeshi passport holders — e-visas, on-arrival and embassy visas, with live
          fees in BDT.
        </p>
        <div className="mt-8">
          <CountryExplorer />
        </div>
      </div>
    </DestinationProvider>
  );
}
