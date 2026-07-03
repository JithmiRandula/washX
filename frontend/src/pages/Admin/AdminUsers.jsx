import { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import { adminApi } from '../../api/adminApi';
import {
  Search, Filter, UserCheck, UserX, Users,
  ChevronLeft, ChevronRight, ShoppingBag, Shield
} from 'lucide-react';
import './AdminUsers.css';

const ITEMS_PER_PAGE = 8;

const roleColor = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'customer') return { bg: '#dbeafe', color: '#1d4ed8' };
  if (r === 'provider') return { bg: '#e0f2fe', color: '#0369a1' };
  return { bg: '#f3f4f6', color: '#6b7280' };
};

const avatarColor = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'customer') return '#1d4ed8';
  if (r === 'provider') return '#0369a1';
  return '#64748b';
};

const AdminUsers = () => {
  const [users, setUsers]             = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterRole, setFilterRole]   = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await adminApi.getUsers();
        const data = (res?.data || []).map(u => ({
          id:          u.userId      ?? u.UserId,
          name:        u.name        ?? u.Name        ?? '',
          email:       u.email       ?? u.Email       ?? '',
          phone:       u.phone       ?? u.Phone       ?? '',
          status:      'active',
          joinDate:    u.createdAt   ?? u.CreatedAt   ?? '',
          totalOrders: u.totalOrders ?? u.TotalOrders ?? 0,
          totalSpent:  Number(u.totalSpent ?? u.TotalSpent ?? 0),
          address:     u.address     ?? u.Address     ?? '',
          role:        u.role        ?? u.Role        ?? ''
        }));
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterRole]);

  const filtered = useMemo(() => {
    let list = users;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
      );
    }
    if (filterRole !== 'all') {
      list = list.filter(u => u.role.toLowerCase() === filterRole);
    }
    return list;
  }, [users, searchTerm, filterRole]);

  const totalPages   = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage     = Math.min(currentPage, totalPages);
  const startIdx     = (safePage - 1) * ITEMS_PER_PAGE;
  const pageUsers    = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const customers  = users.filter(u => u.role.toLowerCase() === 'customer').length;
  const providers  = users.filter(u => u.role.toLowerCase() === 'provider').length;
  const suspended  = users.filter(u => u.status === 'suspended').length;

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

  const handleSuspendUser = (userId) =>
    setUsers(users.map(u =>
      u.id === userId ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u
    ));

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?'))
      setUsers(users.filter(u => u.id !== userId));
  };

  return (
    <div className="au-page">
      <AdminNavbar />

      <div className="au-content">
        {/* Page Header */}
        <div className="au-page-header">
          <div>
            <h1 className="au-page-title">User Management</h1>
            <p className="au-page-sub">Manage and monitor all registered users</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="au-stats-grid">
          <div className="au-stat-card au-stat-blue">
            <div className="au-stat-icon"><Users size={22} /></div>
            <div className="au-stat-body">
              <span className="au-stat-num">{users.length}</span>
              <span className="au-stat-label">Total Users</span>
            </div>
          </div>
          <div className="au-stat-card au-stat-indigo">
            <div className="au-stat-icon"><ShoppingBag size={22} /></div>
            <div className="au-stat-body">
              <span className="au-stat-num">{customers}</span>
              <span className="au-stat-label">Customers</span>
            </div>
          </div>
          <div className="au-stat-card au-stat-purple">
            <div className="au-stat-icon"><Shield size={22} /></div>
            <div className="au-stat-body">
              <span className="au-stat-num">{providers}</span>
              <span className="au-stat-label">Providers</span>
            </div>
          </div>
          <div className="au-stat-card au-stat-amber">
            <div className="au-stat-icon"><UserX size={22} /></div>
            <div className="au-stat-body">
              <span className="au-stat-num">{suspended}</span>
              <span className="au-stat-label">Suspended</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="au-controls">
          <div className="au-search">
            <Search size={18} className="au-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email or phone…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="au-search-input"
            />
            {searchTerm && (
              <button className="au-clear-btn" onClick={() => setSearchTerm('')}>×</button>
            )}
          </div>

          <div className="au-filter-row">
            <Filter size={16} className="au-filter-icon" />
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="au-filter-select"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="provider">Providers</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="au-table-card">
          <div className="au-table-header">
            <span className="au-table-count">
              {filtered.length === 0
                ? 'No users found'
                : `Showing ${startIdx + 1}–${Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} users`}
            </span>
          </div>

          {loading ? (
            <div className="au-loading">
              <div className="au-spinner" />
              <p>Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="au-empty">
              <Users size={48} />
              <h3>No users found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="au-table-scroll">
              <table className="au-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageUsers.map((user, idx) => {
                    const rc = roleColor(user.role);
                    const ac = avatarColor(user.role);
                    return (
                      <tr key={user.id} className="au-tr">
                        <td className="au-td au-td-num">{startIdx + idx + 1}</td>
                        <td className="au-td">
                          <div className="au-user-cell">
                            <div className="au-avatar" style={{ background: ac }}>
                              {user.name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="au-user-name">{user.name}</div>
                              <div className="au-user-email">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="au-td">
                          <div className="au-user-phone">{user.phone || '—'}</div>
                          {user.address && <div className="au-user-addr">{user.address}</div>}
                        </td>
                        <td className="au-td">
                          <span className="au-role-badge" style={{ background: rc.bg, color: rc.color }}>
                            {user.role
                              ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
                              : '—'}
                          </span>
                        </td>
                        <td className="au-td">
                          <span className={`au-status-badge au-status-${user.status}`}>
                            {user.status === 'active' ? '● Active' : user.status === 'suspended' ? '● Suspended' : '● Inactive'}
                          </span>
                        </td>
                        <td className="au-td au-td-date">
                          {user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="au-td au-td-center">{user.totalOrders}</td>
                        <td className="au-td au-td-money">Rs {user.totalSpent.toFixed(2)}</td>
                        <td className="au-td">
                          <div className="au-actions">
                            <button
                              className={`au-act-btn ${user.status === 'suspended' ? 'au-act-activate' : 'au-act-suspend'}`}
                              onClick={() => handleSuspendUser(user.id)}
                              title={user.status === 'suspended' ? 'Activate' : 'Suspend'}
                            >
                              {user.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
                            </button>
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
            <div className="au-pagination">
              <span className="au-page-info">
                Page {safePage} of {totalPages}
              </span>
              <div className="au-page-btns">
                <button
                  className="au-page-btn au-page-nav"
                  onClick={() => goTo(safePage - 1)}
                  disabled={safePage === 1}
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="au-page-dots">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`au-page-btn ${p === safePage ? 'au-page-active' : ''}`}
                      onClick={() => goTo(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="au-page-btn au-page-nav"
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

export default AdminUsers;
