import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Bid<span>Zone</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/auctions" className="nav-link">Auctions</Link>
          
          {user ? (
            <>
              {user.role === 'seller' && (
                <>
                  <Link to="/seller-dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/create-auction" className="nav-link">Create Auction</Link>
                  <Link to="/my-auctions" className="nav-link">My Auctions</Link>
                </>
              )}

              {user.role === 'bidder' && (
                <Link to="/my-bids" className="nav-link">My Bids</Link>
              )}

              {user.role === 'admin' && (
                <Link to="/admin-dashboard" className="nav-link">Admin</Link>
              )}

              <span className="user-badge">{user.name} ({user.role})</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
