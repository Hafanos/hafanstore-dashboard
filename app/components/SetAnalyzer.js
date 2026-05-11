'use client';

import { useState, useEffect } from 'react';

/* ── Spinner ── */
function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin text-blue-500 ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ── Skeleton card (loading placeholder) ── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="skeleton mb-3 h-2.5 w-20 rounded-full" />
      <div className="skeleton mb-2 h-7 w-28 rounded-lg" />
      <div className="skeleton h-2 w-24 rounded-full" />
    </div>
  );
}

/* ── Metric card ── */
function MetricCard({ label, value, sub, accent, style }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-xl"
      style={style}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent} to-transparent`} />
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">{label}</p>
      <p className="text-2xl font-bold tabular-nums tracking-tight text-white">{value}</p>
      {sub && <p className="mt-1.5 text-[11px] text-slate-600">{sub}</p>}
    </div>
  );
}

/* ── ROI hero card ── */
function RoiCard({ roi, netAfterFees, purchase, style }) {
  const positive = roi >= 0;
  const great    = roi >= 25;

  const border  = great ? 'border-emerald-900/50' : positive ? 'border-amber-900/40' : 'border-red-900/50';
  const bg      = great ? 'bg-emerald-950/30'     : positive ? 'bg-amber-950/20'     : 'bg-red-950/25';
  const accent  = great ? 'from-emerald-500/60'   : positive ? 'from-amber-500/50'   : 'from-red-500/60';
  const numCol  = great ? 'text-emerald-400'       : positive ? 'text-amber-400'      : 'text-red-400';
  const profCol = great ? 'text-emerald-400'       : positive ? 'text-amber-400'      : 'text-red-400';

  const profit = Math.round(netAfterFees - purchase);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl sm:p-6 ${border} ${bg}`}
      style={style}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent} to-transparent`} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* ROI number */}
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Return on Investment
          </p>
          <p className={`text-5xl font-bold tabular-nums tracking-tight leading-none ${numCol}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}
            <span className="text-3xl">%</span>
          </p>
        </div>

        {/* Breakdown */}
        {purchase > 0 && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-right text-[13px] sm:grid-cols-1">
            <div className="flex items-center justify-between gap-6 sm:gap-12">
              <span className="text-slate-600">Avg sold</span>
              <span className="font-medium text-slate-300">
                {Math.round(netAfterFees / 0.97).toLocaleString('cs-CZ')} Kč
              </span>
            </div>
            <div className="flex items-center justify-between gap-6 sm:gap-12">
              <span className="text-slate-600">Net after fee</span>
              <span className="font-medium text-slate-300">
                {Math.round(netAfterFees).toLocaleString('cs-CZ')} Kč
              </span>
            </div>
            <div className="flex items-center justify-between gap-6 sm:gap-12">
              <span className="text-slate-600">Purchase</span>
              <span className="font-medium text-slate-300">
                {purchase.toLocaleString('cs-CZ')} Kč
              </span>
            </div>
            <div className="flex items-center justify-between gap-6 sm:gap-12">
              <span className="text-slate-600">Profit / unit</span>
              <span className={`font-semibold ${profCol}`}>
                {profit >= 0 ? '+' : ''}{profit.toLocaleString('cs-CZ')} Kč
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Input ── */
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'rounded-xl border border-white/[0.09] bg-white/[0.05] px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-700 transition-all outline-none focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-blue-500/25';

/* ── Main component ── */
export default function SetAnalyzer() {
  const [setNumber,    setSetNumber]    = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [condition,    setCondition]    = useState('N');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [result,       setResult]       = useState(null);
  const [revealed,     setRevealed]     = useState(false);

  useEffect(() => {
    if (result) {
      setRevealed(false);
      const t = setTimeout(() => setRevealed(true), 20);
      return () => clearTimeout(t);
    }
  }, [result]);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!setNumber.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setRevealed(false);

    try {
      const res  = await fetch(`/api/price-guide?set=${encodeURIComponent(setNumber.trim())}&condition=${condition}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setResult(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const purchase     = parseFloat(purchasePrice) || 0;
  const netAfterFees = result ? result.avgSoldPrice * 0.97 : 0;
  const roi          = result && purchase > 0 ? ((netAfterFees - purchase) / purchase) * 100 : null;

  /* Per-card slide-in style */
  const cardStyle = (i) => ({
    opacity:   revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms`,
  });

  return (
    <section>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <h2 className="text-[13px] font-semibold tracking-tight text-white">Set Analyzer</h2>
        <span className="rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-500">
          sold · 6 months
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.07] to-transparent" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl">

        {/* Form */}
        <div className="p-5 sm:p-6">
          <form onSubmit={handleAnalyze} className="flex flex-wrap items-end gap-3">

            <Field label="Set Number">
              <input
                type="text"
                value={setNumber}
                onChange={e => setSetNumber(e.target.value)}
                placeholder="e.g. 75192"
                className={`${inputCls} w-40`}
              />
            </Field>

            <Field label="Condition">
              <div className="flex overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.04] p-0.5">
                {['N', 'U'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150 ${
                      condition === c
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {c === 'N' ? 'New' : 'Used'}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Purchase Price (Kč)">
              <input
                type="number"
                min="0"
                step="1"
                value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value)}
                placeholder="0"
                className={`${inputCls} w-36 tabular-nums`}
              />
            </Field>

            <button
              type="submit"
              disabled={loading || !setNumber.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? <Spinner /> : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>

          </form>
        </div>

        {/* Content below form */}
        <div className="border-t border-white/[0.05]">

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3 sm:p-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-start gap-2.5 p-5 text-sm text-red-400 sm:p-6">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-3 p-5 sm:p-6">

              {/* Meta row */}
              <p
                className="font-mono text-[11px] text-slate-700"
                style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.3s ease' }}
              >
                Set {result.set} · {result.condition === 'N' ? 'New' : 'Used'} · {result.sampleSize} {result.sampleSize === 1 ? 'sale' : 'sales'} · {result.totalUnits} units in past 6 months
              </p>

              {/* 3 metric cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MetricCard
                  label="Avg Sold Price"
                  value={`${Math.round(result.avgSoldPrice).toLocaleString('cs-CZ')} Kč`}
                  sub="qty-weighted average"
                  accent="from-blue-500/50"
                  style={cardStyle(0)}
                />
                <MetricCard
                  label="Sales / Month"
                  value={result.salesPerMonth.toFixed(1)}
                  sub={`${result.totalUnits} units over 6 months`}
                  accent="from-violet-500/50"
                  style={cardStyle(1)}
                />
                <MetricCard
                  label="Net After 3% Fee"
                  value={`${Math.round(netAfterFees).toLocaleString('cs-CZ')} Kč`}
                  sub="BrickLink seller fee deducted"
                  accent="from-slate-500/40"
                  style={cardStyle(2)}
                />
              </div>

              {/* ROI hero — full width */}
              {roi !== null ? (
                <RoiCard
                  roi={roi}
                  netAfterFees={netAfterFees}
                  purchase={purchase}
                  style={cardStyle(3)}
                />
              ) : (
                <div
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-[13px] text-slate-600"
                  style={cardStyle(3)}
                >
                  Enter a purchase price above to calculate ROI.
                </div>
              )}

            </div>
          )}

          {/* Empty hint */}
          {!result && !error && !loading && (
            <p className="px-5 py-4 text-[13px] text-slate-700 sm:px-6">
              Enter a BrickLink set number to analyse recent sold prices and estimate ROI.
            </p>
          )}

        </div>
      </div>
    </section>
  );
}
