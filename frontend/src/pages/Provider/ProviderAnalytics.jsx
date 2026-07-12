import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, DollarSign, Package, Users,
  CheckCircle, Clock, BarChart3, RefreshCw
} from 'lucide-react';
import { providerOrdersAPI } from '../../api/commerceApi';
import './ProviderAnalytics.css';

// ── SVG Donut Pie Chart ────────────────────────────────────────────────────
const DonutChart = ({ data, size = 180 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="pa-pie-empty">
        <Package size={32} />
        <p>No orders yet</p>
      </div>
    );
  }

  const R = 66;
  const circ = 2 * Math.PI * R;
  const cx = size / 2;
  const cy = size / 2;

  let cumulative = 0;
  const slices = data.map((d) => {
    const dash = (d.value / total) * circ;
    const gap = circ - dash;
    const startOffset = circ / 4 - cumulative;
    cumulative += dash;
    return { ...d, dash, gap, startOffset };
  });

  return (
    <div className="pa-donut-wrap">
      <svg width={size} height={size} className="pa-donut-svg">
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={30}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.startOffset}
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={22} fontWeight={800} fill="#0f172a">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={11} fill="#64748b">
          orders
        </text>
      </svg>

      <div className="pa-donut-legend">
        {slices.map((s, i) => (
          <div key={i} className="pa-legend-item">
            <span className="pa-legend-dot" style={{ background: s.color }} />
            <span className="pa-legend-label">{s.label}</span>
            <span className="pa-legend-val">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Helper: parse field from camelCase or PascalCase ──────────────────────
const f = (obj, camel, pascal) => obj?.[camel] ?? obj?.[pascal];

// ── Status colours ────────────────────────────────────────────────────────
const STATUS_COLOR = {
  completed:    '#059669',
  'in-progress':'#0284c7',
  confirmed:    '#1d4ed8',
  pending:      '#f59e0b',
  cancelled:    '#ef4444',
};
const statusColor = (s) => STATUS_COLOR[s] ?? '#94a3b8';

const PIE_COLORS = ['#1d4ed8','#0284c7','#059669','#f59e0b','#ef4444','#8b5cf6'];

// ── Main component ────────────────────────────────────────────────────────
const ProviderAnalytics = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [period, setPeriod]       = useState('month');

  // Fetch real orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await providerOrdersAPI.getMine();
      const rows = res?.data?.data ?? res?.data ?? [];
      setAllOrders(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Period start date
  const periodStart = useMemo(() => {
    const d = new Date();
    if (period === 'week')  d.setDate(d.getDate() - 7);
    else if (period === 'month') d.setDate(d.getDate() - 30);
    else d.setFullYear(d.getFullYear() - 1);
    return d;
  }, [period]);

  // Orders filtered to selected period
  const periodOrders = useMemo(
    () => allOrders.filter(o => {
      const dt = f(o, 'createdAt', 'CreatedAt');
      return dt ? new Date(dt) >= periodStart : true;
    }),
    [allOrders, periodStart]
  );

  // Previous period orders (for % change)
  const prevStart = useMemo(() => {
    const span = new Date() - periodStart;
    return new Date(periodStart - span);
  }, [periodStart]);

  const prevOrders = useMemo(
    () => allOrders.filter(o => {
      const dt = f(o, 'createdAt', 'CreatedAt');
      if (!dt) return false;
      const d = new Date(dt);
      return d >= prevStart && d < periodStart;
    }),
    [allOrders, periodStart, prevStart]
  );

  // Key metrics
  const metrics = useMemo(() => {
    const paid   = (arr) => arr.filter(o => (f(o,'paymentStatus','PaymentStatus') ?? '').toLowerCase() === 'paid');
    const revenue = (arr) => paid(arr).reduce((s, o) => s + Number(f(o,'totalAmount','TotalAmount') ?? 0), 0);

    const cur = {
      revenue:   revenue(periodOrders),
      orders:    periodOrders.length,
      customers: new Set(periodOrders.map(o => f(o,'customerId','CustomerId'))).size,
    };
    cur.avg = cur.orders > 0 ? cur.revenue / cur.orders : 0;

    const prev = {
      revenue:   revenue(prevOrders),
      orders:    prevOrders.length,
      customers: new Set(prevOrders.map(o => f(o,'customerId','CustomerId'))).size,
    };

    const pct = (cur, prev) => prev === 0 ? null : Math.round(((cur - prev) / prev) * 100);

    return {
      ...cur,
      revChange:  pct(cur.revenue, prev.revenue),
      ordChange:  pct(cur.orders, prev.orders),
      custChange: pct(cur.customers, prev.customers),
    };
  }, [periodOrders, prevOrders]);

  // Monthly revenue — last 6 months (always from allOrders for context)
  const monthlyRevenue = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      return { label: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), month: d.getMonth(), revenue: 0 };
    });

    allOrders
      .filter(o => (f(o,'paymentStatus','PaymentStatus') ?? '').toLowerCase() === 'paid')
      .forEach(o => {
        const dt = f(o,'createdAt','CreatedAt');
        if (!dt) return;
        const d = new Date(dt);
        const slot = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
        if (slot) slot.revenue += Number(f(o,'totalAmount','TotalAmount') ?? 0);
      });

    return months;
  }, [allOrders]);

  const maxRevenue = useMemo(
    () => Math.max(...monthlyRevenue.map(m => m.revenue), 1),
    [monthlyRevenue]
  );

  // Order status breakdown for pie chart
  const statusBreakdown = useMemo(() => {
    const map = {};
    periodOrders.forEach(o => {
      const s = (f(o,'providerStatus','ProviderStatus') ?? f(o,'overallStatus','OverallStatus') ?? 'pending').toLowerCase();
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([label, value]) => ({ label, value, color: statusColor(label) }));
  }, [periodOrders]);

  // Top services by number of order items
  const topServices = useMemo(() => {
    const map = {};
    periodOrders.forEach(o => {
      const items = f(o,'items','Items') ?? [];
      items.forEach(it => {
        const name = f(it,'itemName','ItemName') ?? f(it,'description','Description') ?? 'Unknown';
        if (!map[name]) map[name] = { count: 0, revenue: 0 };
        map[name].count += 1;
        map[name].revenue += Number(f(it,'price','Price') ?? 0);
      });
    });
    const total = Object.values(map).reduce((s, v) => s + v.count, 0) || 1;
    return Object.entries(map)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([name, v], i) => ({
        name,
        count: v.count,
        revenue: v.revenue,
        pct: Math.round((v.count / total) * 100),
        color: PIE_COLORS[i % PIE_COLORS.length],
      }));
  }, [periodOrders]);

  // All orders sorted newest first (for paginated table)
  const sortedOrders = useMemo(
    () => [...allOrders].sort((a, b) =>
      new Date(f(b,'createdAt','CreatedAt')) - new Date(f(a,'createdAt','CreatedAt'))
    ),
    [allOrders]
  );

  const PAGE_SIZE = 5;
  const [ordersPage, setOrdersPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE));
  const pagedOrders = sortedOrders.slice((ordersPage - 1) * PAGE_SIZE, ordersPage * PAGE_SIZE);

  const fmt = (n) => `Rs ${Number(n).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const pctLabel = (v) => v === null ? '—' : v >= 0 ? `+${v}%` : `${v}%`;
  const pctClass = (v) => v === null ? 'pa-neutral' : v >= 0 ? 'pa-positive' : 'pa-negative';

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="provider-analytics">
      <div className="analytics-container">

        {/* Header */}
        <div className="pa-header">
          <div>
            <h1>Business Analytics</h1>
            <p>Track your real-time business performance</p>
          </div>
          <div className="pa-header-right">
            <div className="period-selector">
              {['week','month','year'].map(p => (
                <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <button className="pa-refresh-btn" onClick={fetchOrders} title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="pa-loading">
            <div className="pa-spinner" />
            <p>Loading analytics…</p>
          </div>
        )}
        {error && !loading && (
          <div className="pa-error">
            <p>{error}</p>
            <button onClick={fetchOrders}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI Cards */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon revenue"><DollarSign size={22} /></div>
                <div className="metric-content">
                  <h3>Total Revenue</h3>
                  <div className="metric-value">{fmt(metrics.revenue)}</div>
                  <div className="metric-change">
                    <span className={`change-value ${pctClass(metrics.revChange)}`}>{pctLabel(metrics.revChange)}</span>
                    <span>vs last {period}</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon orders"><Package size={22} /></div>
                <div className="metric-content">
                  <h3>Total Orders</h3>
                  <div className="metric-value">{metrics.orders}</div>
                  <div className="metric-change">
                    <span className={`change-value ${pctClass(metrics.ordChange)}`}>{pctLabel(metrics.ordChange)}</span>
                    <span>vs last {period}</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon customers"><Users size={22} /></div>
                <div className="metric-content">
                  <h3>Unique Customers</h3>
                  <div className="metric-value">{metrics.customers}</div>
                  <div className="metric-change">
                    <span className={`change-value ${pctClass(metrics.custChange)}`}>{pctLabel(metrics.custChange)}</span>
                    <span>vs last {period}</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon avg-order"><TrendingUp size={22} /></div>
                <div className="metric-content">
                  <h3>Avg Order Value</h3>
                  <div className="metric-value">{fmt(metrics.avg)}</div>
                  <div className="metric-change">
                    <span className="change-value pa-neutral">—</span>
                    <span>this {period}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="charts-section">

              {/* Monthly Revenue bar chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Monthly Revenue</h3>
                  <BarChart3 size={18} color="#64748b" />
                </div>
                <div className="pa-bar-chart">
                  {monthlyRevenue.map((m, i) => (
                    <div key={i} className="pa-bar-col">
                      <div className="pa-bar-track">
                        <div
                          className="pa-bar-fill"
                          style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                          title={fmt(m.revenue)}
                        />
                      </div>
                      <span className="pa-bar-label">{m.label}</span>
                      <span className="pa-bar-val">
                        {m.revenue > 0 ? `Rs ${Math.round(m.revenue / 1000)}k` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order status pie chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Order Status</h3>
                  <CheckCircle size={18} color="#64748b" />
                </div>
                <DonutChart data={statusBreakdown} size={180} />
              </div>
            </div>

            {/* Top Services */}
            {topServices.length > 0 && (
              <div className="chart-card pa-services-card">
                <div className="chart-header">
                  <h3>Top Services</h3>
                  <Clock size={18} color="#64748b" />
                </div>
                <div className="service-distribution">
                  {topServices.map((s, i) => (
                    <div key={i} className="service-item">
                      <div className="service-info">
                        <span className="service-name">{s.name}</span>
                        <span className="service-count">{s.count} order{s.count !== 1 ? 's' : ''} · {fmt(s.revenue)}</span>
                      </div>
                      <div className="service-bar">
                        <div
                          className="service-progress"
                          style={{ width: `${s.pct}%`, background: s.color }}
                        />
                      </div>
                      <span className="service-percentage">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="recent-orders">
              <div className="orders-header">
                <h3>All Orders</h3>
                <span className="pa-order-count">{allOrders.length} total</span>
              </div>

              {sortedOrders.length === 0 ? (
                <div className="pa-empty-orders">
                  <Package size={36} />
                  <p>No orders yet</p>
                </div>
              ) : (
                <>
                  <div className="analytics-orders-table">
                    <div className="analytics-table-header">
                      <span className="analytics-header-orderid">Order ID</span>
                      <span className="analytics-header-customer">Customer</span>
                      <span className="analytics-header-amount">Amount</span>
                      <span className="analytics-header-date">Date</span>
                      <span className="analytics-header-status">Status</span>
                    </div>
                    {pagedOrders.map((o, i) => {
                      const status = (f(o,'providerStatus','ProviderStatus') ?? f(o,'overallStatus','OverallStatus') ?? 'pending').toLowerCase();
                      return (
                        <div key={i} className="analytics-table-row">
                          <span className="analytics-cell-orderid">#{f(o,'orderReference','OrderReference') ?? f(o,'orderId','OrderId')}</span>
                          <span className="analytics-cell-customer">{f(o,'customerName','CustomerName') ?? `Customer #${f(o,'customerId','CustomerId')}`}</span>
                          <span className="analytics-cell-amount">{fmt(f(o,'totalAmount','TotalAmount') ?? 0)}</span>
                          <span className="analytics-cell-date">{fmtDate(f(o,'createdAt','CreatedAt'))}</span>
                          <span
                            className="analytics-cell-status"
                            style={{ background: `${statusColor(status)}18`, color: statusColor(status) }}
                          >
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pa-pagination">
                      <span className="pa-page-info">
                        Showing {(ordersPage - 1) * PAGE_SIZE + 1}–{Math.min(ordersPage * PAGE_SIZE, sortedOrders.length)} of {sortedOrders.length}
                      </span>
                      <div className="pa-page-controls">
                        <button
                          className="pa-page-btn"
                          onClick={() => setOrdersPage(1)}
                          disabled={ordersPage === 1}
                          title="First page"
                        >
                          «
                        </button>
                        <button
                          className="pa-page-btn"
                          onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                          disabled={ordersPage === 1}
                        >
                          ‹
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(n => n === 1 || n === totalPages || Math.abs(n - ordersPage) <= 1)
                          .reduce((acc, n, idx, arr) => {
                            if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                            acc.push(n);
                            return acc;
                          }, [])
                          .map((item, idx) =>
                            item === '…' ? (
                              <span key={`ellipsis-${idx}`} className="pa-page-ellipsis">…</span>
                            ) : (
                              <button
                                key={item}
                                className={`pa-page-btn ${ordersPage === item ? 'pa-page-active' : ''}`}
                                onClick={() => setOrdersPage(item)}
                              >
                                {item}
                              </button>
                            )
                          )
                        }

                        <button
                          className="pa-page-btn"
                          onClick={() => setOrdersPage(p => Math.min(totalPages, p + 1))}
                          disabled={ordersPage === totalPages}
                        >
                          ›
                        </button>
                        <button
                          className="pa-page-btn"
                          onClick={() => setOrdersPage(totalPages)}
                          disabled={ordersPage === totalPages}
                          title="Last page"
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderAnalytics;
