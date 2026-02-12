import { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import { Search, Filter, UserCheck, UserX, Eye, MoreVertical } from 'lucide-react';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Sample users data
  useEffect(() => {
    const sampleUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 234-567-8900',
        status: 'active',
        joinDate: '2025-01-15',
        totalOrders: 12,
        totalSpent: 450.50,
        address: '123 Main St, City, State'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1 234-567-8901',
        status: 'active',
        joinDate: '2025-01-10',
        totalOrders: 8,
        totalSpent: 320.75,
        address: '456 Oak Ave, City, State'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1 234-567-8902',
        status: 'suspended',
        joinDate: '2024-12-20',
        totalOrders: 5,
        totalSpent: 180.25,
        address: '789 Pine St, City, State'
      },
      {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        phone: '+1 234-567-8903',
        status: 'active',
        joinDate: '2025-01-05',
        totalOrders: 15,
        totalSpent: 675.00,
        address: '321 Elm Dr, City, State'
      },
      {
        id: '5',
        name: 'David Brown',
        email: 'david.brown@example.com',
        phone: '+1 234-567-8904',
        status: 'inactive',
        joinDate: '2024-11-15',
        totalOrders: 2,
        totalSpent: 85.50,
        address: '654 Maple Ave, City, State'
      }
    ];
    
    setTimeout(() => {
      setUsers(sampleUsers);
      setFilteredUsers(sampleUsers);
      setLoading(false);
    }, 500);
  }, []);

  // Filter users based on search and status
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus]);

  const handleSuspendUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' }
        : user
    ));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'suspended': return '#f59e0b';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="admin-page">
      <AdminNavbar />
      
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1>User Management</h1>
            <p>Manage and monitor all registered users</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <div className="stat-content">
              <h3>{users.filter(u => u.status === 'active').length}</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-icon active">
              <UserCheck size={24} />
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-content">
              <h3>{users.filter(u => u.status === 'suspended').length}</h3>
              <p>Suspended Users</p>
            </div>
            <div className="stat-icon warning">
              <UserX size={24} />
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-content">
              <h3>{users.length}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-icon total">
              <Eye size={24} />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="admin-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <Filter size={20} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="loading-state">Loading users...</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div>{user.phone}</div>
                        <div className="user-address">{user.address}</div>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: `${getStatusColor(user.status)}20`, color: getStatusColor(user.status) }}
                      >
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                    <td>{user.totalOrders}</td>
                    <td>Rs {user.totalSpent.toFixed(2)}</td>
                    <td>
                      <div className="admin-user-action-buttons">
                        <button 
                          className={`admin-user-action-btn ${user.status === 'suspended' ? 'activate' : 'suspend'}`}
                          onClick={() => handleSuspendUser(user.id)}
                          title={user.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                        >
                          {user.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
                        </button>
                        <button 
                          className="admin-user-action-btn delete"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                        >
                          <UserX size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="empty-state">
              <Eye size={48} />
              <h3>No users found</h3>
              <p>No users match your current search and filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;