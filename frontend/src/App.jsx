import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Auctions from './pages/Auctions';
import AuctionDetails from './pages/AuctionDetails';
import SellerDashboard from './pages/SellerDashboard';
import CreateAuction from './pages/CreateAuction';
import MyAuctions from './pages/MyAuctions';
import MyBids from './pages/MyBids';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="site-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auctions" element={<Auctions />} />
              <Route path="/auctions/:id" element={<AuctionDetails />} />

              <Route
                path="/seller-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-auction"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <CreateAuction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-auctions"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <MyAuctions />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-bids"
                element={
                  <ProtectedRoute allowedRoles={['bidder', 'admin']}>
                    <MyBids />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
