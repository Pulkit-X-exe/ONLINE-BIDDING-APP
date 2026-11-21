import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bids, setBids] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.accessToken}` };

      const dashRes = await fetch('http://localhost:5000/api/admin/dashboard', { headers });
      const dashData = await dashRes.json();
      setStats(dashData);

      const usersRes = await fetch('http://localhost:5000/api/admin/users', { headers });
      const usersData = await usersRes.json();
      setUsers(usersData);

      const bidsRes = await fetch('http://localhost:5000/api/admin/bids', { headers });
      const bidsData = await bidsRes.json();
      setBids(bidsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('User removed successfully');
        fetchAdminData();
      } else {
        alert(data.message || 'Cannot delete user');
      }
    } catch (error) {
      alert('Error deleting user');
    }
  };

  if (loading) {
    return <div className="page-container"><p>Loading admin control panel...</p></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Admin Control Panel</h2>
          <p>Monitor platform statistics, manage users, and review category sales</p>
        </div>
      </div>

      {message && <div className="alert-success">{message}</div>}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}
        >
          Overview & Sales
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
        >
          Manage Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('bids')}
          className={activeTab === 'bids' ? 'btn-primary' : 'btn-secondary'}
        >
          All Bids ({bids.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">Total Users</div>
              <div className="stat-value">{stats ? stats.totalUsers : 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Total Auctions</div>
              <div className="stat-value">{stats ? stats.totalAuctions : 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Active Auctions</div>
              <div className="stat-value" style={{ color: '#22c55e' }}>{stats ? stats.activeAuctions : 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Ended Auctions</div>
              <div className="stat-value" style={{ color: '#64748b' }}>{stats ? stats.endedAuctions : 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Total Bids Placed</div>
              <div className="stat-value" style={{ color: '#0284c7' }}>{stats ? stats.totalBids : 0}</div>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>Category-Wise Sales (MongoDB Aggregation)</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '14px' }}>
              Calculated dynamically using MongoDB aggregation pipeline on completed auctions with winners.
            </p>

            {stats && stats.categorySales && stats.categorySales.length === 0 ? (
              <p>No completed sales recorded yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Auctions Sold</th>
                    <th>Total Sales Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {stats && stats.categorySales && stats.categorySales.map((item, index) => (
                    <tr key={index}>
                      <td><strong>{item.category}</strong></td>
                      <td>{item.count} items</td>
                      <td style={{ color: '#22c55e', fontWeight: 700 }}>${item.totalSales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div>
          <h3>Registered Users ({users.length})</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span className="user-badge" style={{ backgroundColor: u.role === 'admin' ? '#ef4444' : u.role === 'seller' ? '#f59e0b' : '#334155' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="btn-danger"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'bids' && (
        <div>
          <h3>All Platform Bids ({bids.length})</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Auction</th>
                <th>Category</th>
                <th>Bidder</th>
                <th>Amount</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((b) => (
                <tr key={b._id}>
                  <td>{b.auction ? b.auction.title : 'Auction Item'}</td>
                  <td>{b.auction ? b.auction.category : 'N/A'}</td>
                  <td>{b.bidder ? b.bidder.name : 'Unknown'}</td>
                  <td style={{ color: '#0284c7', fontWeight: 700 }}>${b.amount}</td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
