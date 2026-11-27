import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

function MyBids() {
  const [bids, setBids] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBidderData();
  }, []);

  const fetchBidderData = async () => {
    try {
      const bidsRes = await fetch(`${API_URL}/api/bids/my-bids`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`
        }
      });
      const bidsData = await bidsRes.json();
      setBids(bidsData);

      const wonRes = await fetch(`${API_URL}/api/bids/my-won-auctions`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`
        }
      });
      const wonData = await wonRes.json();
      setWonAuctions(wonData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>My Bidding Activity</h2>
      <p>Review your bids and check auctions you have won</p>

      <div className="stats-grid" style={{ marginTop: '20px' }}>
        <div className="stat-card">
          <div className="stat-title">Total Bids Placed</div>
          <div className="stat-value">{bids.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Auctions Won</div>
          <div className="stat-value" style={{ color: '#22c55e' }}>{wonAuctions.length}</div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Auctions Won ({wonAuctions.length})</h3>
        {loading ? (
          <p>Loading won auctions...</p>
        ) : wonAuctions.length === 0 ? (
          <p style={{ color: '#64748b', marginTop: '10px' }}>You haven't won any auctions yet. Keep bidding!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Winning Price</th>
                <th>End Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {wonAuctions.map((item) => (
                <tr key={item._id}>
                  <td><strong>{item.title}</strong></td>
                  <td>{item.category}</td>
                  <td style={{ color: '#22c55e', fontWeight: 700 }}>${item.currentPrice}</td>
                  <td>{new Date(item.endTime).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/auctions/${item._id}`} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>My Bidding History ({bids.length})</h3>
        {loading ? (
          <p>Loading bids...</p>
        ) : bids.length === 0 ? (
          <p style={{ color: '#64748b', marginTop: '10px' }}>You have not placed any bids yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Auction</th>
                <th>My Bid Amount</th>
                <th>Current Status</th>
                <th>Placed At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((b) => (
                <tr key={b._id}>
                  <td>
                    {b.auction ? <strong>{b.auction.title}</strong> : 'Auction Unavailable'}
                  </td>
                  <td style={{ color: '#0284c7', fontWeight: 700 }}>${b.amount}</td>
                  <td>
                    {b.auction ? (
                      <span className={`card-badge ${b.auction.status === 'Active' ? 'badge-active' : 'badge-ended'}`} style={{ position: 'static' }}>
                        {b.auction.status}
                      </span>
                    ) : 'Ended'}
                  </td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                  <td>
                    {b.auction && (
                      <Link to={`/auctions/${b.auction._id}`} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                        View Auction
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MyBids;
