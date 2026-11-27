import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

function CreateAuction() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [startingPrice, setStartingPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !category || !startingPrice || !endTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(endTime) <= new Date()) {
      setError('End date and time must be in the future');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auctions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({
          title,
          description,
          image,
          category,
          startingPrice: Number(startingPrice),
          endTime
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create auction');
        setLoading(false);
        return;
      }

      navigate('/my-auctions');
    } catch (err) {
      setError(err.message || 'Network error');
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h2>List a New Product for Auction</h2>
      <p>Set product details, starting bid price, and auction duration.</p>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Title *</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Apple MacBook Pro M2"
          />
        </div>

        <div className="form-group">
          <label>Product Description *</label>
          <textarea
            className="form-control"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of item condition, specifications, etc."
          ></textarea>
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            type="text"
            className="form-control"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Electronics">Electronics</option>
            <option value="Collectibles">Collectibles</option>
            <option value="Fashion">Fashion</option>
            <option value="Art">Art</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div className="form-group">
          <label>Starting Price ($) *</label>
          <input
            type="number"
            className="form-control"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            placeholder="e.g. 50"
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Auction End Date and Time *</label>
          <input
            type="datetime-local"
            className="form-control"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Publishing Auction...' : 'Create Auction Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAuction;
