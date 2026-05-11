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

function StatsCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col gap-1.5">
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      <span className={`text-3xl font-bold tabular-nums ${color}`}>{value}</span>
      {sub && <span className="text-slate-500 text-xs">{sub}</span>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING:    'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    UPDATED:    'bg-orange-500/15 text-orange-300 border-orange-500/30',
    PROCESSING: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    READY:      'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    PAID:       'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    PACKED:     'bg-teal-500/15 text-teal-300 border-teal-500/30',
    SHIPPED:    'bg-purple-500/15 text-purple-300 border-purple-500/30',
    RECEIVED:   'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    COMPLETED:  'bg-slate-500/15 text-slate-400 border-slate-500/30',
    CANCELLED:  'bg-red-500/15 text-red-400 border-red-500/30',
  };
  const cls = map[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status}
    </span>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-3 bg-red-950/50 border border-red-800/60 rounded-lg px-4 py-3 text-red-300 text-sm">
      <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <div>
        <strong>BrickLink API Error:</strong> {message}
        <p className="text-red-400/70 text-xs mt-0.5">
          Ensure BRICKLINK_CONSUMER_KEY, BRICKLINK_CONSUMER_SECRET, BRICKLINK_TOKEN, and
          BRICKLINK_TOKEN_SECRET are set in your .env.local file.
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-16 text-center text-slate-500">
      <svg className="w-10 h-10 mx-auto mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-sm">{message}</p>
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
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#020817' }}>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm select-none">
              H
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">HafanStore</h1>
              <p className="text-xs text-slate-500 leading-tight">BrickLink Seller Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 hidden sm:block">{dateStr}</span>
            <a
              href="/api/bricklink?endpoint=/inventories"
              target="_blank"
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors font-mono"
            >
              API
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 sm:px-6 py-8 max-w-[1400px] mx-auto w-full space-y-8">

        {errors.map((e, i) => <ErrorBanner key={i} message={e} />)}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            label="Total Lots"
            value={totalLots.toLocaleString()}
            sub="unique inventory lines"
          />
          <StatsCard
            label="Total Pieces"
            value={totalQty.toLocaleString()}
            sub="units in stock"
          />
          <StatsCard
            label="Open Orders"
            value={openOrders.length.toLocaleString()}
            sub="awaiting fulfillment"
            color="text-yellow-400"
          />
          <StatsCard
            label="Pending Revenue"
            value={`$${pendingRevenue.toFixed(2)}`}
            sub="from open orders"
            color="text-green-400"
          />
        </div>

        {/* Set Analyzer */}
        <SetAnalyzer />

        {/* Inventory */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Inventory</h2>
            <span className="text-xs text-slate-500">
              {totalLots.toLocaleString()} lots &mdash; ${totalValue.toFixed(2)} total value
            </span>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            {inventory.length === 0 ? (
              <EmptyState message={invResult.error ? 'Failed to load inventory.' : 'No inventory items found.'} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/60 border-b border-slate-700/60">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Color</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Cond.</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.slice(0, 200).map((item, idx) => {
                      const unitPrice = parseFloat(item.unit_price || 0);
                      const qty = item.quantity || 0;
                      return (
                        <tr
                          key={item.inventory_id ?? idx}
                          className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-100 leading-snug">
                              {item.item?.name || '—'}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">{item.item?.no}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                            {item.color_name || '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-semibold ${item.new_or_used === 'N' ? 'text-green-400' : 'text-amber-400'}`}>
                              {item.new_or_used === 'N' ? 'New' : 'Used'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-100 tabular-nums">
                            {qty.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                            ${unitPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-200 tabular-nums">
                            ${(unitPrice * qty).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {inventory.length > 200 && (
                  <div className="px-4 py-3 text-center text-xs text-slate-500 border-t border-slate-800">
                    Showing 200 of {inventory.length.toLocaleString()} lots
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Orders</h2>
            <span className="text-xs text-slate-500">
              {openOrders.length} open &mdash; {orders.length} total
            </span>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            {orders.length === 0 ? (
              <EmptyState message={ordResult.error ? 'Failed to load orders.' : 'No orders found.'} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/60 border-b border-slate-700/60">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Buyer</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Lots</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => {
                      const cost = order.disp_cost || order.cost || {};
                      const total = parseFloat(cost.grand_total || 0);
                      const currency = cost.currency_code || 'USD';
                      const date = order.date_ordered
                        ? new Date(order.date_ordered).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })
                        : '—';
                      return (
                        <tr
                          key={order.order_id ?? idx}
                          className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-blue-400 font-semibold whitespace-nowrap">
                            #{order.order_id}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{order.buyer_name || '—'}</td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{date}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                            {order.unique_count ?? order.total_count ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-100 tabular-nums whitespace-nowrap">
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

      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-700">
        HafanStore Dashboard &mdash; data cached for 60s &middot; powered by BrickLink API
      </footer>
    </div>
  );
}
