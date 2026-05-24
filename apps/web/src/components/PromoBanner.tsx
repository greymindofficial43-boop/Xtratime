export function PromoBanner() {
  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-2">
      <div className="flex min-h-[100px] items-center justify-between overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-violet-700 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
            Featured
          </p>
          <p className="mt-1 text-lg font-bold text-white">IPL 2026 Match Center</p>
          <p className="mt-1 text-sm text-indigo-100">Live scores, points table &amp; schedule</p>
        </div>
        <span className="text-4xl">🏏</span>
      </div>
      <div className="flex min-h-[100px] items-center justify-between overflow-hidden rounded-lg bg-gradient-to-r from-slate-700 to-slate-900 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Expert&apos;s Corner
          </p>
          <p className="mt-1 text-lg font-bold text-white">WWE WrestleMania 42</p>
          <p className="mt-1 text-sm text-slate-300">Live results &amp; full coverage</p>
        </div>
        <span className="text-4xl">🤼</span>
      </div>
    </section>
  );
}
