import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      <div className="hero-banner">
        <h1>Welcome to BidZone</h1>
        <p>Discover rare items, list your products, and place live bids in real-time auctions.</p>
        <div className="hero-actions">
          <Link to="/auctions" className="btn-primary">Browse Auctions</Link>
          <Link to="/register" className="btn-secondary">Join BidZone</Link>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>Real-Time Live Bidding</h3>
          <p>Instant bid updates powered by Socket.io so you never miss a bid.</p>
        </div>
        <div className="feature-card">
          <h3>Verified Sellers & Buyers</h3>
          <p>Role-based platform designed for genuine buyers, sellers, and administrators.</p>
        </div>
        <div className="feature-card">
          <h3>Server-Side Timers</h3>
          <p>Fair, automated winner selection executed securely on the server.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
