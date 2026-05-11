'use client';

import { useState } from 'react';

function ResultStat({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 flex flex-col gap-1">
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
      {sub && <span className="text-slate-500 text-xs">{sub}</span>}
    </div>
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
        `/api/price-guide?setNumber=${encodeURIComponent(setNumber.trim())}&condition=${condition}`,
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

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-white">Set Analyzer</h2>
        <span className="text-xs text-slate-500">sold listings &middot; last 6 months</span>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-5">

        {/* Inputs */}
        <form onSubmit={handleAnalyze} className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Set Number
            </label>
            <input
              type="text"
              value={setNumber}
              onChange={e => setSetNumber(e.target.value)}
              placeholder="e.g. 75192"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 w-40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Condition
            </label>
            <div className="flex rounded-lg border border-slate-700 overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCondition('N')}
                className={`px-4 py-2 transition-colors ${condition === 'N' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                New
              </button>
              <button
                type="button"
                onClick={() => setCondition('U')}
                className={`px-4 py-2 transition-colors ${condition === 'U' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                Used
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Purchase Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 w-32 tabular-nums"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !setNumber.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-colors"
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-3">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-mono">
              Set {result.setNumber}
              {' '}&middot;{' '}
              {result.condition === 'N' ? 'New' : 'Used'}
              {' '}&middot;{' '}
              {result.sampleSize} {result.sampleSize === 1 ? 'sale' : 'sales'} &middot; {result.totalUnits} units sold in past 6 months
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <ResultStat
                label="Avg Sold Price"
                value={`$${result.avgSoldPrice.toFixed(2)}`}
                sub={`${result.currencyCode} · qty-weighted`}
              />
              <ResultStat
                label="Sales / Month"
                value={result.salesPerMonth.toFixed(1)}
                sub={`${result.totalUnits} units over 6 mo`}
              />
              <ResultStat
                label="Net After 3% Fee"
                value={`$${netAfterFees.toFixed(2)}`}
                sub="after BrickLink seller fee"
              />
              <ResultStat
                label="ROI"
                value={roi !== null ? `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%` : '—'}
                sub={purchase > 0 ? `vs $${purchase.toFixed(2)} paid` : 'enter purchase price'}
                color={
                  roi === null
                    ? 'text-slate-500'
                    : roi >= 20
                    ? 'text-green-400'
                    : roi >= 0
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }
              />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !error && !loading && (
          <p className="text-sm text-slate-600">
            Enter a BrickLink set number to analyse recent sold prices and estimate ROI.
          </p>
        )}
      </div>
    </section>
  );
}
