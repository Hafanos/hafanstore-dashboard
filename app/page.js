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

/* ── Icons ── */
const Icon = {
  grid: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  cube: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  clipboard: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  chart: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  stack: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  clock: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  trending: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
};

/* ── Sidebar ── */
function NavItem({ href, label, icon, active = false, badge }) {
  return (
    <a
      href={href}
      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all duration-150 ${
        active
          ? 'bg-white/[0.08] font-medium text-white'
          : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'
      }`}
    >
      <span className={`transition-colors ${active ? 'text-slate-300' : 'text-slate-700 group-hover:text-slate-500'}`}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
          {badge}
        </span>
      )}
    </a>
  );
}

function Sidebar({ openOrderCount }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r border-white/[0.06] bg-[#0a0b10] lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-blue-500/25 select-none">
          H
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white">HafanStore</p>
          <p className="text-[10px] text-slate-600">BrickLink Seller</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 pt-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-700">
          Main
        </p>
        <NavItem href="#" label="Overview" icon={Icon.grid} active />
        <NavItem href="#inventory" label="Inventory" icon={Icon.cube} />
        <NavItem
          href="#orders"
          label="Orders"
          icon={Icon.clipboard}
          badge={openOrderCount > 0 ? String(openOrderCount) : null}
        />

        <div className="my-3 h-px bg-white/[0.05]" />

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-700">
          Tools
        </p>
        <NavItem href="#analyzer" label="Set Analyzer" icon={Icon.chart} />
      </nav>

      {/* Account */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white">
            H
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-slate-200">HafanStore</p>
            <p className="text-[10px] text-slate-600">BrickLink Seller</p>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" title="Connected" />
        </div>
      </div>
    </aside>
  );
}

/* ── Stats Card ── */
function StatsCard({ label, value, sub, accent, valueClass = 'text-white', icon, animClass }) {
  return (
    <div className={`fade-up ${animClass} relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-xl`}>
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent} to-transparent`} />
      <div className="mb-4 flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{label}</span>
        <span className="text-slate-800">{icon}</span>
      </div>
      <div className={`text-[28px] font-bold tabular-nums tracking-tight leading-none ${valueClass}`}>{value}</div>
      {sub && <div className="mt-2 text-[11px] text-slate-600">{sub}</div>}
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({ title, meta, id }) {
  return (
    <div id={id} className="mb-5 flex items-center gap-3 scroll-mt-8">
      <h2 className="text-[13px] font-semibold text-white tracking-tight">{title}</h2>
      {meta && (
        <span className="rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-500">
          {meta}
        </span>
      )}
      <div className="h-px flex-1 bg-gradient-to-r from-white/[0.07] to-transparent" />
    </div>
  );
}

/* ── Status Badge ── */
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
    COMPLETED:  'bg-white/[0.05] text-slate-400 border-white/[0.06]',
    CANCELLED:  'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${map[status] ?? 'bg-white/[0.05] text-slate-400 border-white/[0.06]'}`}>
      {status}
    </span>
  );
}

/* ── Error / Empty ── */
function ErrorBanner({ message }) {
  return (
    <div className="fade-in flex items-start gap-3 rounded-xl border border-red-900/40 bg-red-950/25 px-4 py-3.5 text-sm text-red-300 backdrop-blur-sm">
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <div>
        <span className="font-semibold">BrickLink API error:</span> {message}
        <p className="mt-0.5 text-xs text-red-400/60">Check that all four BRICKLINK_* env vars are set in .env.local.</p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-20 text-center">
      <svg className="mx-auto mb-4 h-10 w-10 text-white/[0.06]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}

/* ── Table wrapper ── */
function GlassTable({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm">
      {children}
    </div>
  );
}

const TH = ({ children, right, center }) => (
  <th className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 ${right ? 'text-right' : center ? 'text-center' : 'text-left'}`}>
    {children}
  </th>
);

/* ── Dashboard ── */
const OPEN_STATUSES = new Set(['PENDING', 'UPDATED', 'PROCESSING', 'READY', 'PAID', 'PACKED']);

export default async function Dashboard() {
  const [invResult, ordResult] = await Promise.all([
    fetchSafe('/inventories'),
    fetchSafe('/orders', { direction: 'in' }),
  ]);

  const inventory = invResult.data;
  const orders = ordResult.data;

  const totalLots    = inventory.length;
  const totalQty     = inventory.reduce((s, i) => s + (i.quantity || 0), 0);
  const totalValue   = inventory.reduce((s, i) => s + parseFloat(i.unit_price || 0) * (i.quantity || 0), 0);
  const openOrders   = orders.filter(o => OPEN_STATUSES.has(o.status));
  const pendingRev   = openOrders.reduce((s, o) => s + parseFloat(o.disp_cost?.grand_total || o.cost?.grand_total || 0), 0);

  const errors  = [invResult.error, ordResult.error].filter(Boolean);
  const dateStr = new Date().toLocaleDateString('cs-CZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex min-h-screen">
      <Sidebar openOrderCount={openOrders.length} />

      <div className="flex flex-1 flex-col lg:pl-56">

        {/* Mobile top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#07080d]/85 px-4 py-3.5 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white select-none">H</div>
            <span className="text-sm font-semibold text-white">HafanStore</span>
          </div>
          <span className="text-xs text-slate-600">{dateStr}</span>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1300px] space-y-10">

            {/* Page title */}
            <div className="fade-in">
              <h1 className="text-2xl font-bold tracking-tight text-white">Overview</h1>
              <p className="mt-1 text-sm text-slate-600">{dateStr}</p>
            </div>

            {errors.map((e, i) => <ErrorBanner key={i} message={e} />)}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatsCard
                label="Total Lots"
                value={totalLots.toLocaleString('cs-CZ')}
                sub="unique inventory lines"
                accent="from-blue-500/50"
                icon={Icon.stack}
                animClass="d-0"
              />
              <StatsCard
                label="Total Pieces"
                value={totalQty.toLocaleString('cs-CZ')}
                sub="units in stock"
                accent="from-violet-500/50"
                icon={Icon.cube}
                animClass="d-1"
              />
              <StatsCard
                label="Open Orders"
                value={openOrders.length.toLocaleString('cs-CZ')}
                sub="awaiting fulfillment"
                accent="from-amber-500/50"
                valueClass="text-amber-400"
                icon={Icon.clock}
                animClass="d-2"
              />
              <StatsCard
                label="Pending Revenue"
                value={`${Math.round(pendingRev).toLocaleString('cs-CZ')} Kč`}
                sub="from open orders"
                accent="from-emerald-500/50"
                valueClass="text-emerald-400"
                icon={Icon.trending}
                animClass="d-3"
              />
            </div>

            {/* Set Analyzer */}
            <div id="analyzer" className="scroll-mt-8">
              <SetAnalyzer />
            </div>

            {/* Inventory */}
            <section>
              <SectionHeader
                id="inventory"
                title="Inventory"
                meta={`${totalLots.toLocaleString('cs-CZ')} lots · ${Math.round(totalValue).toLocaleString('cs-CZ')} Kč`}
              />
              <GlassTable>
                {inventory.length === 0 ? (
                  <EmptyState message={invResult.error ? 'Failed to load inventory.' : 'No inventory items found.'} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <TH>Item</TH>
                          <TH>Color</TH>
                          <TH center>Cond.</TH>
                          <TH right>Qty</TH>
                          <TH right>Unit Price</TH>
                          <TH right>Total Value</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.slice(0, 200).map((item, idx) => {
                          const unitPrice = parseFloat(item.unit_price || 0);
                          const qty = item.quantity || 0;
                          return (
                            <tr
                              key={item.inventory_id ?? idx}
                              className="border-b border-white/[0.04] transition-colors duration-100 hover:bg-white/[0.04]"
                            >
                              <td className="px-4 py-3.5">
                                <div className="font-medium leading-snug text-slate-200">{item.item?.name || '—'}</div>
                                <div className="mt-0.5 font-mono text-[10px] text-slate-700">{item.item?.no}</div>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">{item.color_name || '—'}</td>
                              <td className="px-4 py-3.5 text-center">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${item.new_or_used === 'N' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                  {item.new_or_used === 'N' ? 'NEW' : 'USED'}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right font-medium tabular-nums text-slate-300">
                                {qty.toLocaleString('cs-CZ')}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-500">
                                {unitPrice.toFixed(2)}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-slate-200">
                                {(unitPrice * qty).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {inventory.length > 200 && (
                      <div className="border-t border-white/[0.05] px-4 py-3 text-center text-[11px] text-slate-600">
                        Showing 200 of {inventory.length.toLocaleString('cs-CZ')} lots
                      </div>
                    )}
                  </div>
                )}
              </GlassTable>
            </section>

            {/* Orders */}
            <section>
              <SectionHeader
                id="orders"
                title="Orders"
                meta={`${openOrders.length} open · ${orders.length} total`}
              />
              <GlassTable>
                {orders.length === 0 ? (
                  <EmptyState message={ordResult.error ? 'Failed to load orders.' : 'No orders found.'} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <TH>Order ID</TH>
                          <TH>Buyer</TH>
                          <TH>Date</TH>
                          <TH>Status</TH>
                          <TH right>Lots</TH>
                          <TH right>Total</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, idx) => {
                          const cost     = order.disp_cost || order.cost || {};
                          const total    = parseFloat(cost.grand_total || 0);
                          const currency = cost.currency_code || 'USD';
                          const date     = order.date_ordered
                            ? new Date(order.date_ordered).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—';
                          return (
                            <tr
                              key={order.order_id ?? idx}
                              className="border-b border-white/[0.04] transition-colors duration-100 hover:bg-white/[0.04]"
                            >
                              <td className="px-4 py-3.5 font-mono text-xs font-semibold text-blue-400 whitespace-nowrap">
                                #{order.order_id}
                              </td>
                              <td className="px-4 py-3.5 text-slate-300">{order.buyer_name || '—'}</td>
                              <td className="px-4 py-3.5 text-[12px] whitespace-nowrap text-slate-600">{date}</td>
                              <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                              <td className="px-4 py-3.5 text-right tabular-nums text-slate-500">
                                {order.unique_count ?? order.total_count ?? '—'}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold tabular-nums whitespace-nowrap text-slate-200">
                                {currency} {total.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassTable>
            </section>

            <footer className="pb-4 pt-2 text-center">
              <p className="text-[11px] text-slate-800">HafanStore · data cached 60s · BrickLink API</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
