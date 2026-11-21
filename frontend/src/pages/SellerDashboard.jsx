import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SellerDashboard() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auctions/my-auctions', {
          headers: {
            Authorization: `Bearer ${user.accessToken}`
          }
        });
        const data = await response.json();
        setAuctions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [user]);

  const activeCount = auctions.filter((a) => a.status === 'Active').length;
  const endedCount = auctions.filter((a) => a.status === 'Ended').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Seller Dashboard</h2>
          <p>Welcome back, {user.name}. Overview of your listings.</p>
        </div>
        <Link to="/create-auction" className="btn-primary">Create New Auction</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Listed</div>
          <div className="stat-value">{auctions.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active Auctions</div>
          <div className="stat-value" style={{ color: '#22c55e' }}>{activeCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Ended Auctions</div>
          <div className="stat-value" style={{ color: '#64748b' }}>{endedCount}</div>
        </div>
      </div>

      <h3>Recent Auction Activity</h3>
      {loading ? (
        <p>Loading activity...</p>
      ) : auctions.length === 0 ? (
        <p>No listings created yet. Click "Create New Auction" to get started.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Current Price</th>
              <th>Status</th>
              <th>End Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {auctions.slice(0, 5).map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td>{item.category}</td>
                <td>${item.currentPrice}</td>
                <td>
                  <span className={`card-badge ${item.status === 'Active' ? 'badge-active' : 'badge-ended'}`} style={{ position: 'static' }}>
                    {item.status}
                  </span>
                </td>
                <td>{new Date(item.endTime).toLocaleDateString()}</td>
                <td>
                  <Link to={`/auctions/${item._id}`} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                    View Live
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SellerDashboard;
