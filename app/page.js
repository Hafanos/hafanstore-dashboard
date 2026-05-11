import { blFetch } from '@/lib/bricklink';
import SetAnalyzer from '@/app/components/SetAnalyzer';

async function fetchSafe(path, params = {}) {
  try {
    const data = await blFetch(path, params);
    return { data: Array.isArray(data) ? data : [], error: null };
  } catch (e) {
    return { data: [], error: e.message };
  }
}

function StatsCard({ label, value, sub, accent, valueClass = 'text-white', icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/60 p-5">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent} to-transparent`} />
      <div className="mb-3 flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-slate-700">{icon}</span>
      </div>
      <div className={`text-3xl font-bold tabular-nums tracking-tight ${valueClass}`}>{value}</div>
      {sub && <div className="mt-1.5 text-xs text-slate-600">{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, meta }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="h-4 w-0.5 rounded-full bg-gradient-to-b from-blue-400 to-blue-700" />
      <h2 className="text-sm font-semibold tracking-tight text-slate-100">{title}</h2>
      {meta && <span className="ml-auto text-xs text-slate-600">{meta}</span>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING:    'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    UPDATED:    'bg-orange-500/10 text-orange-300 border-orange-500/20',
    PROCESSING: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    READY:      'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    PAID:       'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    PACKED:     'bg-teal-500/10 text-teal-300 border-teal-500/20',
    SHIPPED:    'bg-purple-500/10 text-purple-300 border-purple-500/20',
    RECEIVED:   'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    COMPLETED:  'bg-slate-700/30 text-slate-400 border-slate-700/30',
    CANCELLED:  'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const cls = map[status] || 'bg-slate-700/30 text-slate-400 border-slate-700/30';
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${cls}`}>
      {status}
    </span>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3.5 text-sm text-red-300">
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <div>
        <span className="font-semibold">BrickLink API error:</span> {message}
        <p className="mt-0.5 text-xs text-red-400/60">
          Check that all four BRICKLINK_* env vars are set in .env.local.
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-16 text-center">
      <svg className="mx-auto mb-3 h-10 w-10 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}

const OPEN_STATUSES = new Set(['PENDING', 'UPDATED', 'PROCESSING', 'READY', 'PAID', 'PACKED']);

export default async function Dashboard() {
  const [invResult, ordResult] = await Promise.all([
    fetchSafe('/inventories'),
    fetchSafe('/orders', { direction: 'in' }),
  ]);

  const inventory = invResult.data;
  const orders = ordResult.data;

  const totalLots = inventory.length;
  const totalQty = inventory.reduce((s, i) => s + (i.quantity || 0), 0);
  const totalValue = inventory.reduce(
    (s, i) => s + parseFloat(i.unit_price || 0) * (i.quantity || 0),
    0,
  );
  const openOrders = orders.filter(o => OPEN_STATUSES.has(o.status));
  const pendingRevenue = openOrders.reduce(
    (s, o) => s + parseFloat(o.disp_cost?.grand_total || o.cost?.grand_total || 0),
    0,
  );

  const errors = [invResult.error, ordResult.error].filter(Boolean);
  const dateStr = new Date().toLocaleDateString('cs-CZ', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/[0.05] bg-[#030712]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20 select-none">
              H
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">HafanStore</h1>
              <p className="text-xs text-slate-500">BrickLink Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-600 sm:block">{dateStr}</span>
            <a
              href="/api/bricklink?endpoint=/inventories"
              target="_blank"
              className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 font-mono text-xs text-slate-500 transition-colors hover:border-slate-700 hover:text-slate-300"
            >
              API
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-8 px-4 py-8 sm:px-6">

        {errors.map((e, i) => <ErrorBanner key={i} message={e} />)}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            label="Total Lots"
            value={totalLots.toLocaleString('cs-CZ')}
            sub="unique inventory lines"
            accent="from-blue-500/50"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            }
          />
          <StatsCard
            label="Total Pieces"
            value={totalQty.toLocaleString('cs-CZ')}
            sub="units in stock"
            accent="from-violet-500/50"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <StatsCard
            label="Open Orders"
            value={openOrders.length.toLocaleString('cs-CZ')}
            sub="awaiting fulfillment"
            accent="from-amber-500/50"
            valueClass="text-amber-400"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            label="Pending Revenue"
            value={`${Math.round(pendingRevenue).toLocaleString('cs-CZ')} Kč`}
            sub="from open orders"
            accent="from-emerald-500/50"
            valueClass="text-emerald-400"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        {/* Set Analyzer */}
        <SetAnalyzer />

        {/* Inventory */}
        <section>
          <SectionHeader
            title="Inventory"
            meta={`${totalLots.toLocaleString('cs-CZ')} lots · ${Math.round(totalValue).toLocaleString('cs-CZ')} Kč`}
          />
          <div className="overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/40">
            {inventory.length === 0 ? (
              <EmptyState message={invResult.error ? 'Failed to load inventory.' : 'No inventory items found.'} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-slate-900/80">
                      {['Item', 'Color', 'Cond.', 'Qty', 'Unit Price', 'Total Value'].map((h, i) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 ${i >= 3 ? 'text-right' : i === 2 ? 'text-center' : 'text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.slice(0, 200).map((item, idx) => {
                      const unitPrice = parseFloat(item.unit_price || 0);
                      const qty = item.quantity || 0;
                      return (
                        <tr
                          key={item.inventory_id ?? idx}
                          className="border-b border-slate-800/30 transition-colors duration-100 hover:bg-slate-800/20"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium leading-snug text-slate-200">{item.item?.name || '—'}</div>
                            <div className="mt-0.5 font-mono text-[10px] text-slate-600">{item.item?.no}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-400">{item.color_name || '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[10px] font-semibold tracking-wide ${item.new_or_used === 'N' ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {item.new_or_used === 'N' ? 'NEW' : 'USED'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-200">
                            {qty.toLocaleString('cs-CZ')}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-400">
                            {unitPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-slate-200">
                            {(unitPrice * qty).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {inventory.length > 200 && (
                  <div className="border-t border-slate-800/40 px-4 py-3 text-center text-xs text-slate-600">
                    Showing 200 of {inventory.length.toLocaleString('cs-CZ')} lots
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Orders */}
        <section>
          <SectionHeader
            title="Orders"
            meta={`${openOrders.length} open · ${orders.length} total`}
          />
          <div className="overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/40">
            {orders.length === 0 ? (
              <EmptyState message={ordResult.error ? 'Failed to load orders.' : 'No orders found.'} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-slate-900/80">
                      {[
                        ['Order ID', 'left'], ['Buyer', 'left'], ['Date', 'left'],
                        ['Status', 'left'], ['Lots', 'right'], ['Total', 'right'],
                      ].map(([h, align]) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 text-${align}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => {
                      const cost = order.disp_cost || order.cost || {};
                      const total = parseFloat(cost.grand_total || 0);
                      const currency = cost.currency_code || 'USD';
                      const date = order.date_ordered
                        ? new Date(order.date_ordered).toLocaleDateString('cs-CZ', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : '—';
                      return (
                        <tr
                          key={order.order_id ?? idx}
                          className="border-b border-slate-800/30 transition-colors duration-100 hover:bg-slate-800/20"
                        >
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-400 whitespace-nowrap">
                            #{order.order_id}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{order.buyer_name || '—'}</td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">{date}</td>
                          <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-400">
                            {order.unique_count ?? order.total_count ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs font-semibold tabular-nums whitespace-nowrap text-slate-100">
                            {currency} {total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

      </main>

      <footer className="border-t border-white/[0.04] px-6 py-5 text-center">
        <p className="text-xs text-slate-700">HafanStore Dashboard · data cached 60s · BrickLink API</p>
      </footer>
    </div>
  );
}
