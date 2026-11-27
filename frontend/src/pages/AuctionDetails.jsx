import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

function AuctionDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctionData();

    const socket = io(API_URL);

    socket.emit('joinAuction', id);

    socket.on('bidUpdated', (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => ({
          ...prev,
          currentPrice: data.currentPrice
        }));
        setBids((prev) => [data.bid, ...prev]);
        setSuccess(`New highest bid placed: $${data.currentPrice}!`);
      }
    });

    socket.on('auctionEnded', (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => ({
          ...prev,
          status: 'Ended',
          winner: data.winner,
          currentPrice: data.finalPrice
        }));
        setTimeLeft('Auction Ended');
      }
    });

    return () => {
      socket.emit('leaveAuction', id);
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (!auction || auction.status === 'Ended') {
      setTimeLeft('Auction Ended');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Auction Ended');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  const fetchAuctionData = async () => {
    try {
      const aucRes = await fetch(`${API_URL}/api/auctions/${id}`);
      const aucData = await aucRes.json();
      setAuction(aucData);

      const bidsRes = await fetch(`${API_URL}/api/bids/auction/${id}`);
      const bidsData = await bidsRes.json();
      setBids(bidsData);
    } catch (err) {
      setError('Failed to load auction');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('Please login to place a bid');
      return;
    }

    if (user.role === 'seller' && auction.seller._id === user._id) {
      setError('You cannot bid on your own auction');
      return;
    }

    const amount = Number(bidAmount);
    if (!amount || amount <= auction.currentPrice) {
      setError(`Your bid must be strictly greater than $${auction.currentPrice}`);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({
          auctionId: id,
          amount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Bid rejected');
        return;
      }

      setBidAmount('');
    } catch (err) {
      setError('Network error while placing bid');
    }
  };

  if (loading) {
    return <div className="page-container"><p>Loading auction details...</p></div>;
  }

  if (!auction) {
    return <div className="page-container"><p>Auction not found.</p></div>;
  }

  const isSeller = user && auction.seller && user._id === auction.seller._id;
  const isEnded = auction.status === 'Ended' || timeLeft === 'Auction Ended';

  return (
    <div className="page-container">
      <div className="auction-details-grid">
        <div>
          <img
            src={auction.image || 'https://via.placeholder.com/600x400?text=No+Product+Image'}
            alt={auction.title}
            className="auction-main-image"
          />

          <h2>{auction.title}</h2>
          <p style={{ marginTop: '10px', fontSize: '15px', color: '#475569', lineHeight: 1.6 }}>
            {auction.description}
          </p>

          <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <p><strong>Category:</strong> {auction.category}</p>
            <p><strong>Seller:</strong> {auction.seller ? auction.seller.name : 'Unknown'}</p>
            <p><strong>Starting Price:</strong> ${auction.startingPrice}</p>
            <p><strong>End Date:</strong> {new Date(auction.endTime).toLocaleString()}</p>
          </div>
        </div>

        <div>
          <div className="countdown-box">
            <div className="countdown-label">Time Remaining</div>
            <div className="countdown-digits">{timeLeft}</div>
          </div>

          {isEnded && (
            <div className="winner-announcement">
              <h4>Auction Concluded</h4>
              <p>
                Winner: <strong>{auction.winner ? auction.winner.name : 'No bids placed'}</strong>
              </p>
              <p>Final Winning Price: <strong>${auction.currentPrice}</strong></p>
            </div>
          )}

          {!isEnded && (
            <div className="bidding-panel">
              <div className="current-bid-display">
                <div className="label">Current Highest Bid</div>
                <div className="amount">${auction.currentPrice}</div>
              </div>

              {error && <div className="alert-error">{error}</div>}
              {success && <div className="alert-success">{success}</div>}

              {isSeller ? (
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  You listed this item. Sellers cannot bid on their own auctions.
                </p>
              ) : !user ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ marginBottom: '12px', fontSize: '14px' }}>You must be logged in to bid.</p>
                  <Link to="/login" className="btn-primary">Login to Bid</Link>
                </div>
              ) : (
                <form onSubmit={handlePlaceBid}>
                  <div className="bid-input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder={`Enter > $${auction.currentPrice}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={auction.currentPrice + 1}
                    />
                    <button type="submit" className="btn-primary" style={{ minWidth: '120px' }}>
                      Place Bid
                    </button>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Suggested minimum next bid: ${auction.currentPrice + 5}
                  </span>
                </form>
              )}
            </div>
          )}

          <h3>Live Bid History ({bids.length})</h3>
          <div className="bid-history-container" style={{ marginTop: '12px' }}>
            {bids.length === 0 ? (
              <p style={{ padding: '16px', color: '#94a3b8', textAlign: 'center' }}>
                No bids placed yet. Be the first to bid!
              </p>
            ) : (
              bids.map((b) => (
                <div key={b._id} className="bid-history-item">
                  <div>
                    <strong>{b.bidder ? b.bidder.name : 'Bidder'}</strong>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0284c7' }}>
                    ${b.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionDetails;
