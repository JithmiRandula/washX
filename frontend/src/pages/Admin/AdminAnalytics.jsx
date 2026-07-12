import { useState, useEffect, useMemo, useCallback } from 'react';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import { adminApi } from '../../api/adminApi';
import {
  TrendingUp, Users, Package, DollarSign,
  RefreshCw, BarChart3, Award, ShoppingBag, Shield,
} from 'lucide-react';
import './AdminAnalytics.css';

// ── helpers ──────────────────────────────────────────────────────────────────
const g  = (obj, c, p) => (obj?.[c] !== undefined ? obj[c] : obj?.[p]) ?? 0;
const gs = (obj, c, p) => obj?.[c] ?? obj?.[p] ?? null;
const fmt    = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const fmtInt = (n) => Math.round(Number(n)).toLocaleString('en-US');

const PERIOD_DAYS = { week: 7, month: 30, year: 365 };
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_CFG = [
  { key: 'pending',   label: 'Pending',   color: '#f59e0b' },
  { key: 'active',    label: 'Active',    color: '#0284c7' },
  { key: 'completed', label: 'Completed', color: '#059669' },
  { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

// ── DonutChart ────────────────────────────────────────────────────────────────
const DonutChart = ({ data, size = 170 }) => {
  const R = 58, SW = 28, C = size / 2;
  const circ = 2 * Math.PI * R;
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!total) return (
    <svg width={size} height={size}>
      <circle cx={C} cy={C} r={R} fill="none" stroke="#f1f5f9" strokeWidth={SW} />
      <text x={C} y={C} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#94a3b8">No data</text>
    </svg>
  );

  let cumRot = -90;
  return (
    <svg width={size} height={size}>
      <circle cx={C} cy={C} r={R} fill="none" stroke="#f1f5f9" strokeWidth={SW} />
      {data.map((d, i) => {
        const frac = d.value / total;
        const dash = frac * circ;
        const rot  = cumRot;
        cumRot += frac * 360;
        return (
          <circle key={i} cx={C} cy={C} r={R} fill="none"
            stroke={d.color} strokeWidth={SW}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={0}
            transform={`rotate(${rot} ${C} ${C})`}
          />
        );
      })}
      <text x={C} y={C - 8}  textAnchor="middle" fontSize="24" fontWeight="700" fill="#0f172a">{fmtInt(total)}</text>
      <text x={C} y={C + 13} textAnchor="middle" fontSize="10" fill="#64748b">Total Orders</text>
    </svg>
  );
};

// ── BarChart ──────────────────────────────────────────────────────────────────
const BarChart = ({ data }) => {
  if (!data.length) return <div className="aa-no-data">No data</div>;
  const max      = Math.max(...data.map(d => d.value), 1);
  const chartH   = 200;
  const barW     = 40;
  const gap      = 16;
  const padX     = 46;
  const padTop   = 24;
  const labelH   = 24;
  const areaH    = chartH - padTop - labelH;
  const totalW   = padX * 2 + data.length * (barW + gap) - gap;
  const ticks    = 4;
  const tickStep = Math.max(Math.ceil(max / ticks / 100) * 100, 1);
  const yMax     = tickStep * ticks;

  return (
    <svg width="100%" height={chartH} viewBox={`0 0 ${totalW} ${chartH}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="aa-bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {Array.from({ length: ticks + 1 }, (_, i) => {
        const y   = padTop + areaH - (i / ticks) * areaH;
        const val = i * tickStep;
        return (
          <g key={i}>
            <line x1={padX - 4} y1={y} x2={totalW - 4} y2={y} stroke="#f1f5f9" strokeWidth="1.5" />
            <text x={padX - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
              {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const barH = d.value > 0 ? Math.max((d.value / yMax) * areaH, 3) : 0;
        const x    = padX + i * (barW + gap);
        const y    = padTop + areaH - barH;
        return (
          <g key={i}>
            <rect x={x} y={padTop} width={barW} height={areaH} rx="6" fill="#f8fafc" />
            {barH > 0 && <rect x={x} y={y} width={barW} height={barH} rx="6" fill="url(#aa-bar-grad)" />}
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#1d4ed8">
                {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
              </text>
            )}
            <text x={x + barW / 2} y={chartH - 4} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="500">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 5;

const AdminAnalytics = () => {
  const [period,     setPeriod]     = useState('month');
  const [stats,      setStats]      = useState(null);
  const [orders,     setOrders]     = useState([]);
  const [providers,  setProviders]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [ordersPage, setOrdersPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, oRes, pRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getOrders(),
        adminApi.getProviders(),
      ]);
      setStats(sRes?.data ?? null);
      setOrders(Array.isArray(oRes?.data) ? oRes.data : []);
      setProviders(Array.isArray(pRes?.data) ? pRes.data : []);
    } catch (e) {
      console.error('Analytics load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setOrdersPage(1); }, [period]);

  const periodStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - PERIOD_DAYS[period]);
    return d;
  }, [period]);

  const filteredOrders = useMemo(() =>
    orders.filter(o => new Date(gs(o, 'createdAt', 'CreatedAt')) >= periodStart),
  [orders, periodStart]);

  const kpi = useMemo(() => {
    const paid    = filteredOrders.filter(o => (gs(o, 'paymentStatus', 'PaymentStatus') ?? '').toLowerCase() === 'paid');
    const revenue = paid.reduce((s, o) => s + Number(gs(o, 'totalAmount', 'TotalAmount') ?? 0), 0);
    return { revenue, count: filteredOrders.length, avg: paid.length > 0 ? revenue / paid.length : 0, paidCount: paid.length };
  }, [filteredOrders]);

  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const from = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const to   = new Date(from.getFullYear(), from.getMonth() + 1, 1);
      const val  = orders
        .filter(o => {
          const dt = new Date(gs(o, 'createdAt', 'CreatedAt'));
          const ps = (gs(o, 'paymentStatus', 'PaymentStatus') ?? '').toLowerCase();
          return dt >= from && dt < to && ps === 'paid';
        })
        .reduce((s, o) => s + Number(gs(o, 'totalAmount', 'TotalAmount') ?? 0), 0);
      return { label: MONTH_SHORT[from.getMonth()], value: Math.round(val) };
    });
  }, [orders]);

  const statusBreakdown = useMemo(() =>
    STATUS_CFG.map(s => ({
      ...s,
      value: s.key === 'pending'   ? g(stats, 'pendingOrders',   'PendingOrders')
           : s.key === 'active'    ? g(stats, 'activeOrders',    'ActiveOrders')
           : s.key === 'completed' ? g(stats, 'completedOrders', 'CompletedOrders')
           :                         g(stats, 'cancelledOrders', 'CancelledOrders'),
    })).filter(s => s.value > 0),
  [stats]);

  const topProviders = useMemo(() =>
    [...providers]
      .sort((a, b) => Number(gs(b, 'revenue', 'Revenue') ?? 0) - Number(gs(a, 'revenue', 'Revenue') ?? 0))
      .slice(0, 5),
  [providers]);

  const sortedOrders = useMemo(() =>
    [...filteredOrders].sort((a, b) =>
      new Date(gs(b, 'createdAt', 'CreatedAt')) - new Date(gs(a, 'createdAt', 'CreatedAt'))
    ),
  [filteredOrders]);

  const totalPages  = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE));
  const pagedOrders = sortedOrders.slice((ordersPage - 1) * PAGE_SIZE, ordersPage * PAGE_SIZE);

  const totalUsers      = g(stats, 'totalUsers',      'TotalUsers');
  const totalCustomers  = g(stats, 'totalCustomers',  'TotalCustomers');
  const totalProviders  = g(stats, 'totalProviders',  'TotalProviders');
  const totalRevenue    = Number(gs(stats, 'totalRevenue',    'TotalRevenue')    ?? 0);
  const totalReviews    = g(stats, 'totalReviews',    'TotalReviews');
  const completedOrders = g(stats, 'completedOrders', 'CompletedOrders');
  const totalOrdersAll  = g(stats, 'totalOrders',     'TotalOrders');
  const completionRate  = totalOrdersAll > 0 ? Math.round((completedOrders / totalOrdersAll) * 100) : 0;

  const pageNumbers = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(p => p === 1 || p === totalPages || Math.abs(p - ordersPage) <= 1);
    const result = [];
    pages.forEach((p, idx) => {
      if (idx > 0 && p - pages[idx - 1] > 1) result.push('…');
      result.push(p);
    });
    return result;
  };

  if (loading) return (
    <div className="aa-page">
      <AdminNavbar />
      <div className="aa-loading"><div className="aa-spinner" /><p>Loading analytics…</p></div>
    </div>
  );

  return (
    <div className="aa-page">
      <AdminNavbar />
      <div className="aa-content">

        {/* Header */}
        <div className="aa-header">
          <div>
            <h1 className="aa-title">Analytics & Reports</h1>
            <p className="aa-sub">Platform-wide insights from real data</p>
          </div>
          <div className="aa-header-right">
            <div className="aa-period-tabs">
              {['week', 'month', 'year'].map(p => (
                <button key={p} className={`aa-period-btn${period === p ? ' aa-period-active' : ''}`}
                  onClick={() => setPeriod(p)}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <button className="aa-refresh-btn" onClick={fetchData} title="Refresh"><RefreshCw size={15} /></button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="aa-kpi-grid">
          <div className="aa-kpi-card">
            <div className="aa-kpi-icon aa-icon-blue"><DollarSign size={20} /></div>
            <div className="aa-kpi-body">
              <span className="aa-kpi-label">Period Revenue</span>
              <span className="aa-kpi-value">Rs {fmt(kpi.revenue)}</span>
              <span className="aa-kpi-sub">{kpi.paidCount} paid orders</span>
            </div>
          </div>
          <div className="aa-kpi-card">
            <div className="aa-kpi-icon aa-icon-sky"><Package size={20} /></div>
            <div className="aa-kpi-body">
              <span className="aa-kpi-label">Period Orders</span>
              <span className="aa-kpi-value">{fmtInt(kpi.count)}</span>
              <span className="aa-kpi-sub">last {PERIOD_DAYS[period]} days</span>
            </div>
          </div>
          <div className="aa-kpi-card">
            <div className="aa-kpi-icon aa-icon-teal"><TrendingUp size={20} /></div>
            <div className="aa-kpi-body">
              <span className="aa-kpi-label">Avg Order Value</span>
              <span className="aa-kpi-value">Rs {fmt(kpi.avg)}</span>
              <span className="aa-kpi-sub">paid orders only</span>
            </div>
          </div>
          <div className="aa-kpi-card">
            <div className="aa-kpi-icon aa-icon-slate"><Users size={20} /></div>
            <div className="aa-kpi-body">
              <span className="aa-kpi-label">Total Users</span>
              <span className="aa-kpi-value">{fmtInt(totalUsers)}</span>
              <span className="aa-kpi-sub">{totalProviders} providers · {totalCustomers} customers</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="aa-charts-row">
          <div className="aa-card aa-chart-main">
            <div className="aa-card-head">
              <div className="aa-card-title"><BarChart3 size={17} />Monthly Revenue</div>
              <span className="aa-card-sub">Last 6 months · paid orders</span>
            </div>
            <div className="aa-bar-wrap"><BarChart data={monthlyRevenue} /></div>
          </div>

          <div className="aa-card aa-chart-side">
            <div className="aa-card-head">
              <div className="aa-card-title"><Package size={17} />Order Status</div>
              <span className="aa-card-sub">All time</span>
            </div>
            <div className="aa-donut-wrap"><DonutChart data={statusBreakdown} size={170} /></div>
            <div className="aa-legend">
              {statusBreakdown.map(s => (
                <div key={s.key} className="aa-legend-item">
                  <span className="aa-legend-dot" style={{ background: s.color }} />
                  <span className="aa-legend-label">{s.label}</span>
                  <span className="aa-legend-val">{fmtInt(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Row */}
        <div className="aa-lower-row">
          <div className="aa-card">
            <div className="aa-card-head">
              <div className="aa-card-title"><Award size={17} />Top Providers</div>
              <span className="aa-card-sub">By total revenue</span>
            </div>
            {topProviders.length === 0
              ? <div className="aa-empty">No provider data</div>
              : <div className="aa-prov-list">
                  {topProviders.map((p, i) => {
                    const name   = gs(p, 'businessName',  'BusinessName')  ?? '—';
                    const rev    = Number(gs(p, 'revenue', 'Revenue') ?? 0);
                    const ords   = g(p, 'totalOrders', 'TotalOrders');
                    const rating = Number(gs(p, 'averageRating', 'AverageRating') ?? 0);
                    const maxRev = Number(gs(topProviders[0], 'revenue', 'Revenue') ?? 1) || 1;
                    return (
                      <div key={i} className="aa-prov-row">
                        <div className="aa-prov-rank">{i + 1}</div>
                        <div className="aa-prov-info">
                          <div className="aa-prov-name">{name}</div>
                          <div className="aa-prov-bar-wrap">
                            <div className="aa-prov-bar" style={{ width: `${(rev / maxRev) * 100}%` }} />
                          </div>
                        </div>
                        <div className="aa-prov-stats">
                          <span className="aa-prov-rev">Rs {fmt(rev)}</span>
                          <span className="aa-prov-meta">{ords} orders · ⭐ {rating.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>

          <div className="aa-card">
            <div className="aa-card-head">
              <div className="aa-card-title"><Shield size={17} />Platform Overview</div>
              <span className="aa-card-sub">All-time snapshot</span>
            </div>
            <div className="aa-ov-rows">
              {[
                ['Total Revenue',    `Rs ${fmt(totalRevenue)}`],
                ['Total Orders',     fmtInt(totalOrdersAll)],
                ['Completion Rate',  `${completionRate}%`,  completionRate >= 70 ? '#059669' : '#f59e0b'],
                ['Total Customers',  fmtInt(totalCustomers)],
                ['Active Providers', fmtInt(totalProviders)],
                ['Total Reviews',    fmtInt(totalReviews)],
                ['Avg Order Value',  completedOrders > 0 ? `Rs ${fmt(totalRevenue / completedOrders)}` : '—'],
              ].map(([label, val, color], i) => (
                <div key={i} className="aa-ov-row">
                  <span className="aa-ov-label">{label}</span>
                  <strong className="aa-ov-val" style={color ? { color } : undefined}>{val}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="aa-card aa-orders-card">
          <div className="aa-card-head">
            <div className="aa-card-title"><ShoppingBag size={17} />Recent Orders</div>
            <span className="aa-card-sub">{sortedOrders.length} orders in period</span>
          </div>
          {pagedOrders.length === 0
            ? <div className="aa-empty aa-empty-lg">No orders found for this period</div>
            : <>
                <div className="aa-table-wrap">
                  <table className="aa-table">
                    <thead>
                      <tr>
                        <th>Reference</th><th>Customer</th><th>Provider</th>
                        <th>Amount</th><th>Status</th><th>Payment</th><th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedOrders.map((o, i) => {
                        const ref     = gs(o, 'orderReference', 'OrderReference') ?? '—';
                        const cust    = gs(o, 'customerName',   'CustomerName')   ?? '—';
                        const prov    = gs(o, 'providerName',   'ProviderName')   ?? '—';
                        const amt     = Number(gs(o, 'totalAmount',   'TotalAmount')   ?? 0);
                        const st      = (gs(o, 'status',        'Status')        ?? 'pending').toLowerCase().replace(/\s+/g, '-');
                        const ps      = (gs(o, 'paymentStatus', 'PaymentStatus') ?? 'pending').toLowerCase();
                        const dt      = gs(o, 'createdAt', 'CreatedAt');
                        const dateStr = dt ? new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                        return (
                          <tr key={i}>
                            <td className="aa-td-ref">{ref}</td>
                            <td>{cust}</td>
                            <td className="aa-td-muted">{prov}</td>
                            <td className="aa-td-amt">Rs {fmt(amt)}</td>
                            <td><span className={`aa-badge aa-badge-${st}`}>{st.replace(/-/g, ' ')}</span></td>
                            <td><span className={`aa-badge aa-badge-${ps}`}>{ps}</span></td>
                            <td className="aa-td-muted">{dateStr}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="aa-pagination">
                    <button className="aa-page-btn" disabled={ordersPage === 1}          onClick={() => setOrdersPage(1)}>«</button>
                    <button className="aa-page-btn" disabled={ordersPage === 1}          onClick={() => setOrdersPage(p => p - 1)}>‹</button>
                    {pageNumbers().map((p, i) =>
                      typeof p === 'string'
                        ? <span key={`e${i}`} className="aa-page-ellipsis">{p}</span>
                        : <button key={p} className={`aa-page-btn${p === ordersPage ? ' aa-page-active' : ''}`} onClick={() => setOrdersPage(p)}>{p}</button>
                    )}
                    <button className="aa-page-btn" disabled={ordersPage === totalPages} onClick={() => setOrdersPage(p => p + 1)}>›</button>
                    <button className="aa-page-btn" disabled={ordersPage === totalPages} onClick={() => setOrdersPage(totalPages)}>»</button>
                  </div>
                )}
              </>
          }
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;
