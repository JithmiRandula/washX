import { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import { adminApi } from '../../api/adminApi';
import {
  Search, Filter, CheckCircle, XCircle, Building2,
  Star, Phone, Mail, ChevronLeft, ChevronRight,
  TrendingUp, Clock, Users
} from 'lucide-react';
import './AdminProviders.css';

const ITEMS_PER_PAGE = 8;

const statusMeta = {
  active:    { bg: '#ecfdf5', color: '#059669', label: 'Active'    },
  pending:   { bg: '#fffbeb', color: '#d97706', label: 'Pending'   },
  suspended: { bg: '#fef2f2', color: '#dc2626', label: 'Suspended' },
};

const AdminProviders = () => {
  const [providers, setProviders]   = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage]   = useState(1);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getProviders();
        const data = (res?.data || []).map(p => ({
          id:           p.providerId      ?? p.ProviderId,
          name:         p.businessName    ?? p.BusinessName    ?? '',
          email:        p.email           ?? p.Email           ?? '',
          phone:        p.phone           ?? p.Phone           ?? '',
          address:      p.businessAddress ?? p.BusinessAddress ?? '',
          ownerName:    p.ownerName       ?? p.OwnerName       ?? '',
          status:       (p.isVerified ?? p.IsVerified) ? 'active' : 'pending',
          joinedAt:     p.joinedAt        ?? p.JoinedAt        ?? '',
          rating:       Number(p.averageRating ?? p.AverageRating ?? 0),
          totalReviews: Number(p.totalReviews  ?? p.TotalReviews  ?? 0),
          totalOrders:  Number(p.totalOrders   ?? p.TotalOrders   ?? 0),
          revenue:      Number(p.revenue       ?? p.Revenue       ?? 0),
        }));
        setProviders(data);
      } catch (err) {
        console.error('Failed to load providers:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

  const filtered = useMemo(() => {
    let list = providers;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q)  ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q)               ||
        p.ownerName.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      list = list.filter(p => p.status === filterStatus);
    }
    return list;
  }, [providers, searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const startIdx   = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems  = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const goTo = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  const pageNumbers = () => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safePage - delta && i <= safePage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const handleApprove = (id) =>
    setProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));

  const handleReject = (id) => {
    if (window.confirm('Reject and remove this provider?'))
      setProviders(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleSuspend = (id) =>
    setProviders(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'suspended' ? 'active' : 'suspended' } : p
    ));

  const activeCount    = providers.filter(p => p.status === 'active').length;
  const pendingCount   = providers.filter(p => p.status === 'pending').length;
  const suspendedCount = providers.filter(p => p.status === 'suspended').length;
  const totalRevenue   = providers.reduce((s, p) => s + p.revenue, 0);

  const StarRating = ({ value }) => {
    const full = Math.floor(value);
    return (
      <div className="apv-stars">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            size={13}
            fill={i <= full ? '#fbbf24' : 'none'}
            color={i <= full ? '#fbbf24' : '#d1d5db'}
          />
        ))}
        <span className="apv-rating-val">{value > 0 ? value.toFixed(1) : '—'}</span>
      </div>
    );
  };

  return (
    <div className="apv-page">
      <AdminNavbar />

      <div className="apv-content">
        {/* Header */}
        <div className="apv-header">
          <div>
            <h1 className="apv-title">Provider Management</h1>
            <p className="apv-sub">Manage and approve service providers</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="apv-stats-grid">
          <div className="apv-stat-card apv-sc-blue">
            <div className="apv-sc-icon"><Building2 size={22} /></div>
            <div className="apv-sc-body">
              <span className="apv-sc-num">{providers.length}</span>
              <span className="apv-sc-label">Total Providers</span>
            </div>
          </div>
          <div className="apv-stat-card apv-sc-green">
            <div className="apv-sc-icon"><CheckCircle size={22} /></div>
            <div className="apv-sc-body">
              <span className="apv-sc-num">{activeCount}</span>
              <span className="apv-sc-label">Active</span>
            </div>
          </div>
          <div className="apv-stat-card apv-sc-amber">
            <div className="apv-sc-icon"><Clock size={22} /></div>
            <div className="apv-sc-body">
              <span className="apv-sc-num">{pendingCount}</span>
              <span className="apv-sc-label">Pending Approval</span>
            </div>
          </div>
          <div className="apv-stat-card apv-sc-sky">
            <div className="apv-sc-icon"><TrendingUp size={22} /></div>
            <div className="apv-sc-body">
              <span className="apv-sc-num">Rs {totalRevenue.toLocaleString()}</span>
              <span className="apv-sc-label">Total Revenue</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="apv-controls">
          <div className="apv-search">
            <Search size={17} className="apv-search-icon" />
            <input
              type="text"
              placeholder="Search by business name, owner or email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="apv-search-input"
            />
            {searchTerm && (
              <button className="apv-clear-btn" onClick={() => setSearchTerm('')}>×</button>
            )}
          </div>
          <div className="apv-filter-row">
            <Filter size={15} className="apv-filter-icon" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="apv-filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table Card */}
        <div className="apv-table-card">
          <div className="apv-table-topbar">
            <span className="apv-table-count">
              {filtered.length === 0
                ? 'No providers found'
                : `Showing ${startIdx + 1}–${Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} providers`}
            </span>
          </div>

          {loading ? (
            <div className="apv-loading">
              <div className="apv-spinner" />
              <p>Loading providers…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="apv-empty">
              <Building2 size={48} />
              <h3>No providers found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="apv-table-scroll">
              <table className="apv-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Business</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Join Date</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((p, idx) => {
                    const sm = statusMeta[p.status] || statusMeta.pending;
                    const initials = p.name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <tr key={p.id} className="apv-tr">
                        <td className="apv-td apv-td-num">{startIdx + idx + 1}</td>

                        <td className="apv-td">
                          <div className="apv-biz-cell">
                            <div className="apv-biz-avatar">{initials}</div>
                            <div>
                              <div className="apv-biz-name">{p.name}</div>
                              {p.ownerName && (
                                <div className="apv-biz-owner">
                                  <Users size={11} /> {p.ownerName}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="apv-td">
                          <div className="apv-contact-line">
                            <Mail size={12} />
                            <span>{p.email}</span>
                          </div>
                          {p.phone && (
                            <div className="apv-contact-line apv-contact-phone">
                              <Phone size={12} />
                              <span>{p.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="apv-td">
                          <span className="apv-status-badge" style={{ background: sm.bg, color: sm.color }}>
                            ● {sm.label}
                          </span>
                        </td>

                        <td className="apv-td">
                          <StarRating value={p.rating} />
                          {p.totalReviews > 0 && (
                            <div className="apv-review-count">{p.totalReviews} reviews</div>
                          )}
                        </td>

                        <td className="apv-td apv-td-date">
                          {p.joinedAt
                            ? new Date(p.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>

                        <td className="apv-td apv-td-center">{p.totalOrders}</td>

                        <td className="apv-td apv-td-money">
                          Rs {p.revenue.toLocaleString()}
                        </td>

                        <td className="apv-td">
                          <div className="apv-actions">
                            {p.status === 'pending' && (
                              <>
                                <button
                                  className="apv-btn apv-btn-approve"
                                  onClick={() => handleApprove(p.id)}
                                  title="Approve"
                                >
                                  <CheckCircle size={13} /> Approve
                                </button>
                                <button
                                  className="apv-btn apv-btn-reject"
                                  onClick={() => handleReject(p.id)}
                                  title="Reject"
                                >
                                  <XCircle size={13} /> Reject
                                </button>
                              </>
                            )}
                            {p.status === 'active' && (
                              <button
                                className="apv-btn apv-btn-suspend"
                                onClick={() => handleToggleSuspend(p.id)}
                                title="Suspend"
                              >
                                <XCircle size={13} /> Suspend
                              </button>
                            )}
                            {p.status === 'suspended' && (
                              <button
                                className="apv-btn apv-btn-activate"
                                onClick={() => handleToggleSuspend(p.id)}
                                title="Activate"
                              >
                                <CheckCircle size={13} /> Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > ITEMS_PER_PAGE && (
            <div className="apv-pagination">
              <span className="apv-page-info">Page {safePage} of {totalPages}</span>
              <div className="apv-page-btns">
                <button
                  className="apv-page-btn apv-page-nav"
                  onClick={() => goTo(safePage - 1)}
                  disabled={safePage === 1}
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNumbers().map((pg, i) =>
                  pg === '...' ? (
                    <span key={`d-${i}`} className="apv-page-dots">…</span>
                  ) : (
                    <button
                      key={pg}
                      className={`apv-page-btn ${pg === safePage ? 'apv-page-active' : ''}`}
                      onClick={() => goTo(pg)}
                    >
                      {pg}
                    </button>
                  )
                )}

                <button
                  className="apv-page-btn apv-page-nav"
                  onClick={() => goTo(safePage + 1)}
                  disabled={safePage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProviders;
