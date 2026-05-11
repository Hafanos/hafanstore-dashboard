'use client';

import { useState } from 'react';

function ResultStat({ label, value, sub, valueClass = 'text-white', accent = 'from-slate-700/40' }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/80 p-4">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent} to-transparent`} />
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`text-2xl font-bold tabular-nums tracking-tight ${valueClass}`}>{value}</p>
      {sub && <p className="mt-1.5 text-xs text-slate-600">{sub}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function SetAnalyzer() {
  const [setNumber, setSetNumber] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [condition, setCondition] = useState('N');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!setNumber.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/price-guide?set=${encodeURIComponent(setNumber.trim())}&condition=${condition}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setResult(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const purchase = parseFloat(purchasePrice) || 0;
  const netAfterFees = result ? result.avgSoldPrice * 0.97 : 0;
  const roi = result && purchase > 0 ? ((netAfterFees - purchase) / purchase) * 100 : null;

  const roiCardBorder =
    roi === null ? 'border-slate-800/50'
    : roi >= 20  ? 'border-emerald-900/50'
    : roi >= 0   ? 'border-amber-900/50'
    :              'border-red-900/50';

  const roiCardBg =
    roi === null ? 'bg-slate-900/80'
    : roi >= 20  ? 'bg-emerald-950/40'
    : roi >= 0   ? 'bg-amber-950/30'
    :              'bg-red-950/30';

  const roiAccent =
    roi === null ? 'from-slate-700/40'
    : roi >= 20  ? 'from-emerald-500/50'
    : roi >= 0   ? 'from-amber-500/50'
    :              'from-red-500/50';

  const roiValueClass =
    roi === null ? 'text-slate-500'
    : roi >= 20  ? 'text-emerald-400'
    : roi >= 0   ? 'text-amber-400'
    :              'text-red-400';

  return (
    <section>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="h-4 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-violet-700" />
        <h2 className="text-sm font-semibold tracking-tight text-slate-100">Set Analyzer</h2>
        <span className="ml-auto text-xs text-slate-600">sold listings · last 6 months</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/40">

        {/* Form */}
        <div className="p-5 sm:p-6">
          <form onSubmit={handleAnalyze} className="flex flex-wrap items-end gap-3">

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Set Number
              </label>
              <input
                type="text"
                value={setNumber}
                onChange={e => setSetNumber(e.target.value)}
                placeholder="e.g. 75192"
                className="w-40 rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Condition
              </label>
              <div className="flex overflow-hidden rounded-xl border border-slate-700/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCondition('N')}
                  className={`px-4 py-2.5 transition-colors ${condition === 'N' ? 'bg-blue-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'}`}
                >
                  New
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('U')}
                  className={`px-4 py-2.5 transition-colors ${condition === 'U' ? 'bg-blue-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'}`}
                >
                  Used
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Purchase Price (Kč)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value)}
                placeholder="0"
                className="w-32 rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-2.5 text-sm tabular-nums text-slate-100 placeholder:text-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !setNumber.trim()}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading && <Spinner />}
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>

          </form>
        </div>

        {/* Content area */}
        <div className="border-t border-slate-800/40">

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
              <Spinner />
              <span className="text-sm text-slate-500">Fetching BrickLink price guide…</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-start gap-2.5 px-5 py-4 text-sm text-red-400 sm:px-6">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-4 p-5 sm:p-6">
              <p className="font-mono text-[11px] text-slate-600">
                Set {result.set} · {result.condition === 'N' ? 'New' : 'Used'} · {result.sampleSize} {result.sampleSize === 1 ? 'sale' : 'sales'} · {result.totalUnits} units in past 6 months
              </p>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <ResultStat
                  label="Avg Sold Price"
                  value={`${Math.round(result.avgSoldPrice).toLocaleString('cs-CZ')} Kč`}
                  sub="qty-weighted"
                  accent="from-blue-500/40"
                />
                <ResultStat
                  label="Sales / Month"
                  value={result.salesPerMonth.toFixed(1)}
                  sub={`${result.totalUnits} units over 6 mo`}
                  accent="from-violet-500/40"
                />
                <ResultStat
                  label="Net After 3% Fee"
                  value={`${Math.round(netAfterFees).toLocaleString('cs-CZ')} Kč`}
                  sub="BrickLink seller fee"
                  accent="from-slate-500/40"
                />

                {/* ROI — coloured card */}
                <div className={`relative overflow-hidden rounded-xl border p-4 ${roiCardBorder} ${roiCardBg}`}>
                  <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${roiAccent} to-transparent`} />
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">ROI</p>
                  <p className={`text-2xl font-bold tabular-nums tracking-tight ${roiValueClass}`}>
                    {roi !== null ? `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%` : '—'}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-600">
                    {purchase > 0 ? `vs ${purchase.toLocaleString('cs-CZ')} Kč paid` : 'enter purchase price'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hint */}
          {!result && !error && !loading && (
            <p className="px-5 py-4 text-sm text-slate-700 sm:px-6">
              Enter a BrickLink set number to analyse recent sold prices and estimate ROI.
            </p>
          )}

        </div>
      </div>
    </section>
  );
}
