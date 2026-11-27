import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

function MyAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  const fetchMyAuctions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auctions/my-auctions`, {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this auction?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auctions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.accessToken}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Auction deleted successfully');
        fetchMyAuctions();
      } else {
        alert(data.message || 'Cannot delete auction');
      }
    } catch (error) {
      alert('Error deleting auction');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>My Listed Auctions</h2>
          <p>Manage and track products you have listed on BidZone</p>
        </div>
        <Link to="/create-auction" className="btn-primary">Create New Auction</Link>
      </div>

      {message && <div className="alert-success">{message}</div>}

      {loading ? (
        <p>Loading your auctions...</p>
      ) : auctions.length === 0 ? (
        <p>You have not listed any auctions yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Starting Price</th>
              <th>Current Price</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Winner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.title}</strong>
                </td>
                <td>{item.category}</td>
                <td>${item.startingPrice}</td>
                <td style={{ color: '#0284c7', fontWeight: 600 }}>${item.currentPrice}</td>
                <td>{new Date(item.endTime).toLocaleString()}</td>
                <td>
                  <span className={`card-badge ${item.status === 'Active' ? 'badge-active' : 'badge-ended'}`} style={{ position: 'static' }}>
                    {item.status}
                  </span>
                </td>
                <td>{item.winner ? item.winner.name : 'None'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/auctions/${item._id}`} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn-danger"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyAuctions;
