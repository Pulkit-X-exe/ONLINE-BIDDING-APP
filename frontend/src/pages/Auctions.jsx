import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, [search, category, status]);

  const fetchAuctions = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      if (status) queryParams.append('status', status);

      const response = await fetch(`${API_URL}/api/auctions?${queryParams.toString()}`);
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Explore Live Auctions</h2>
          <p>Find unique items and bid in real-time</p>
        </div>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search products by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="form-control filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Collectibles">Collectibles</option>
          <option value="Fashion">Fashion</option>
          <option value="Art">Art</option>
          <option value="Vehicles">Vehicles</option>
          <option value="Others">Others</option>
        </select>

        <select
          className="form-control filter-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Ended">Ended</option>
        </select>
      </div>

      {loading ? (
        <p>Loading auctions...</p>
      ) : auctions.length === 0 ? (
        <p>No auctions found matching your criteria.</p>
      ) : (
        <div className="auctions-grid">
          {auctions.map((auction) => (
            <div key={auction._id} className="auction-card">
              <div className="card-image-box">
                <img
                  src={auction.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={auction.title}
                />
                <span className="card-category">{auction.category}</span>
                <span className={`card-badge ${auction.status === 'Active' ? 'badge-active' : 'badge-ended'}`}>
                  {auction.status}
                </span>
              </div>

              <div className="card-content">
                <h3 className="card-title">{auction.title}</h3>
                <p className="card-desc">{auction.description}</p>

                <div className="card-prices">
                  <div className="price-box">
                    <span className="price-label">Current Bid</span>
                    <span className="price-value">${auction.currentPrice}</span>
                  </div>
                  <div className="price-box" style={{ textAlign: 'right' }}>
                    <span className="price-label">Starting</span>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>${auction.startingPrice}</span>
                  </div>
                </div>

                <div className="timer-box">
                  {auction.status === 'Active'
                    ? `Ends: ${new Date(auction.endTime).toLocaleString()}`
                    : `Closed on: ${new Date(auction.endTime).toLocaleDateString()}`}
                </div>

                <Link to={`/auctions/${auction._id}`} className="btn-primary" style={{ textAlign: 'center' }}>
                  {auction.status === 'Active' ? 'Place Bid' : 'View Result'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Auctions;
