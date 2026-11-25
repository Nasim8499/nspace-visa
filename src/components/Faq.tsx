export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-black/10 overflow-hidden rounded-3xl border border-black/10 bg-white">
      {items.map((f) => (
        <details key={f.q} className="group px-5 py-4 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold sm:text-lg">
            {f.q}
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/5 text-lg transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-black/65">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
