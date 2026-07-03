import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag, Clock, CheckCircle, Package,
  Star, Search, MapPin, ArrowRight,
  Droplets, Shirt, Zap, Sparkles, Wind, Crown,
  TrendingUp, XCircle
} from 'lucide-react';
import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import './CustomerDashboard.css';

const SERVICES = [
  { title: 'Dry Cleaning',    desc: 'Professional dry cleaning for delicate fabrics',      icon: Shirt,    accent: '#1d4ed8', bg: '#dbeafe' },
  { title: 'Wash & Fold',     desc: 'Complete wash and fold laundry service',               icon: Droplets, accent: '#0284c7', bg: '#e0f2fe' },
  { title: 'Express Service', desc: 'Fast turnaround for urgent laundry needs',             icon: Zap,      accent: '#d97706', bg: '#fef3c7' },
  { title: 'Ironing Service', desc: 'Professional ironing for crisp, wrinkle-free clothes', icon: Wind,     accent: '#dc2626', bg: '#fee2e2' },
  { title: 'Steam Press',     desc: 'Advanced steam pressing for a perfect finish',         icon: Sparkles, accent: '#0369a1', bg: '#e0f2fe' },
  { title: 'Premium Care',    desc: 'Luxury treatment for your finest garments',            icon: Crown,    accent: '#1d4ed8', bg: '#eff6ff' },
];

const STATUS_META = {
  pending:       { bg: '#fffbeb', color: '#d97706', label: 'Pending'     },
  'in-progress': { bg: '#dbeafe', color: '#1d4ed8', label: 'In Progress' },
  completed:     { bg: '#ecfdf5', color: '#059669', label: 'Completed'   },
  cancelled:     { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled'   },
};

const ORDERS = [
  { id: '1', providerName: 'CleanWash Express',    status: 'in-progress', items: 3, amount: 45,  pickupDate: '2025-12-08' },
  { id: '2', providerName: 'Premium Laundry Care', status: 'completed',   items: 5, amount: 75,  pickupDate: '2025-12-05' },
];

const ACTIVITY = [
  { id: 1, title: 'Order #1234 completed',   desc: 'CleanWash Express completed your dry cleaning order', time: '2 hours ago', Icon: CheckCircle, color: '#059669', iconBg: '#ecfdf5' },
  { id: 2, title: 'Order #1235 picked up',   desc: 'Premium Laundry Care picked up your items',           time: '1 day ago',   Icon: Package,     color: '#d97706',  iconBg: '#fffbeb' },
  { id: 3, title: 'New order placed',        desc: 'Order #1236 placed with Express Wash Co.',            time: '3 days ago',  Icon: ShoppingBag, color: '#1d4ed8',  iconBg: '#dbeafe' },
  { id: 4, title: 'Provider rated',          desc: 'You rated CleanWash Express 5 stars',                 time: '5 days ago',  Icon: Star,        color: '#d97706',  iconBg: '#fffbeb' },
];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [serviceIdx, setServiceIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setServiceIdx(i => (i + 1) % SERVICES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const svc = SERVICES[serviceIdx];
  const IconComp = svc.icon;

  const customerName = user?.name ?? user?.firstName ?? user?.email?.split('@')[0] ?? 'Customer';

  const stats = [
    { Icon: ShoppingBag, label: 'Total Orders', value: '12', accent: '#1d4ed8', iconBg: '#dbeafe', iconColor: '#1d4ed8' },
    { Icon: Clock,       label: 'Pending',      value: '1',  accent: '#d97706', iconBg: '#fef3c7', iconColor: '#d97706' },
    { Icon: CheckCircle, label: 'Completed',    value: '11', accent: '#059669', iconBg: '#ecfdf5', iconColor: '#059669' },
    { Icon: XCircle,     label: 'Cancelled',    value: '0',  accent: '#dc2626', iconBg: '#fef2f2', iconColor: '#dc2626' },
  ];

  return (
    <>
      <CustomerNavbar />
      <div className="cdb-page">
        <div className="cdb-content">

          {/* ── Page Header ── */}
          <div className="cdb-header">
            <div>
              <h1 className="cdb-title">Welcome back, {customerName}!</h1>
              <p className="cdb-sub">Here's what's happening with your laundry orders</p>
            </div>
            <button className="cdb-find-btn" onClick={() => window.location.href = '/providers'}>
              <Search size={16} /> Find Providers
            </button>
          </div>

          {/* ── Animated Service Banner ── */}
          <div className="cdb-banner" style={{ borderColor: svc.accent }}>
            <div className="cdb-banner-icon" style={{ background: svc.bg, color: svc.accent }}>
              <IconComp size={28} />
            </div>
            <div className="cdb-banner-text">
              <h2 className="cdb-banner-title" style={{ color: svc.accent }}>{svc.title}</h2>
              <p className="cdb-banner-desc">{svc.desc}</p>
            </div>
            <button
              className="cdb-banner-btn"
              style={{ background: svc.accent }}
              onClick={() => window.location.href = '/providers'}
            >
              Explore Services <ArrowRight size={15} />
            </button>
            {/* dots */}
            <div className="cdb-dots">
              {SERVICES.map((_, i) => (
                <span
                  key={i}
                  className={`cdb-dot${i === serviceIdx ? ' cdb-dot-active' : ''}`}
                  style={i === serviceIdx ? { background: svc.accent } : {}}
                  onClick={() => setServiceIdx(i)}
                />
              ))}
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="cdb-stats">
            {stats.map((s, i) => (
              <div key={i} className="cdb-stat-card" style={{ borderLeftColor: s.accent }}>
                <div className="cdb-stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>
                  <s.Icon size={22} />
                </div>
                <div className="cdb-stat-body">
                  <span className="cdb-stat-num">{s.value}</span>
                  <span className="cdb-stat-lbl">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Lower Grid ── */}
          <div className="cdb-lower">

            {/* Recent Orders */}
            <div className="cdb-section">
              <div className="cdb-section-head">
                <div className="cdb-section-title">
                  <ShoppingBag size={17} /> Recent Orders
                </div>
                <a href="/customer/orders" className="cdb-view-all">
                  View All <ArrowRight size={13} />
                </a>
              </div>
              <div className="cdb-orders">
                {ORDERS.map(o => {
                  const sm = STATUS_META[o.status] || STATUS_META.pending;
                  return (
                    <div key={o.id} className="cdb-order-card">
                      <div className="cdb-order-top">
                        <div>
                          <div className="cdb-order-provider">{o.providerName}</div>
                          <div className="cdb-order-id">Order #{o.id}</div>
                        </div>
                        <span className="cdb-status-badge" style={{ background: sm.bg, color: sm.color }}>
                          ● {sm.label}
                        </span>
                      </div>
                      <div className="cdb-order-meta">
                        <span className="cdb-meta-item"><Package size={13} /> {o.items} items</span>
                        <span className="cdb-meta-item"><Clock size={13} /> {o.pickupDate}</span>
                        <span className="cdb-order-amt">Rs {o.amount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right column */}
            <div className="cdb-right">

              {/* Recent Activity */}
              <div className="cdb-section">
                <div className="cdb-section-head">
                  <div className="cdb-section-title">
                    <TrendingUp size={17} /> Recent Activity
                  </div>
                </div>
                <div className="cdb-activity">
                  {ACTIVITY.map(a => (
                    <div key={a.id} className="cdb-act-item">
                      <div className="cdb-act-icon" style={{ background: a.iconBg, color: a.color }}>
                        <a.Icon size={16} />
                      </div>
                      <div className="cdb-act-body">
                        <div className="cdb-act-title">{a.title}</div>
                        <div className="cdb-act-desc">{a.desc}</div>
                        <div className="cdb-act-time">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="cdb-section">
                <div className="cdb-section-head">
                  <div className="cdb-section-title">
                    <Zap size={17} /> Quick Actions
                  </div>
                </div>
                <div className="cdb-quick-actions">
                  <a href="/providers" className="cdb-qa-btn">
                    <div className="cdb-qa-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                      <Search size={18} />
                    </div>
                    <span>Find Providers</span>
                    <ArrowRight size={14} className="cdb-qa-arrow" />
                  </a>
                  <a href="/customer/orders" className="cdb-qa-btn">
                    <div className="cdb-qa-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                      <ShoppingBag size={18} />
                    </div>
                    <span>My Bookings</span>
                    <ArrowRight size={14} className="cdb-qa-arrow" />
                  </a>
                  <a href="/customer/profile" className="cdb-qa-btn">
                    <div className="cdb-qa-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <Star size={18} />
                    </div>
                    <span>My Profile</span>
                    <ArrowRight size={14} className="cdb-qa-arrow" />
                  </a>
                  <a href="/providers?near=me" className="cdb-qa-btn">
                    <div className="cdb-qa-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                      <MapPin size={18} />
                    </div>
                    <span>Nearby Services</span>
                    <ArrowRight size={14} className="cdb-qa-arrow" />
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;
