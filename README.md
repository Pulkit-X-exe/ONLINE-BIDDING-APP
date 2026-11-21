# BidZone – Online Auction Platform

BidZone is a full-stack online auction web application developed as a 3rd-semester B.Tech Computer Science and Engineering project. The platform enables sellers to list items for auction and allows bidders to place live bids in real time. The auction system operates with server-side countdown timers, atomic concurrency protection for simultaneous bids, and real-time bid broadcasts using Socket.io. When an auction timer concludes, the server automatically computes and determines the final winning bidder.

---

## Technologies Used

### Backend
- **Node.js**: Server runtime environment.
- **Express.js**: Web application framework following the MVC pattern.
- **MongoDB**: NoSQL database for document storage.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB.
- **Socket.io**: Real-time bidirectional event-based communication for live bidding rooms.
- **jsonwebtoken (JWT)**: Secure user authentication using short-lived access tokens and long-lived refresh tokens.
- **bcrypt**: Cryptographic password hashing.
- **dotenv**: Environment variable management.
- **cors**: Cross-Origin Resource Sharing middleware.

### Frontend
- **React.js**: User interface library with functional components and hooks.
- **Vite**: Next-generation frontend build tool and development server.
- **React Router DOM**: Client-side routing and protected routes.
- **Context API**: Global state management for user authentication and authorization.
- **Socket.io-client**: Client library for real-time WebSocket connection to auction rooms.
- **Standard CSS**: Responsive design with a dark navy and white theme.

---

## User Roles and Capabilities

### 1. Bidder
- Register and login to the system.
- Browse available auctions with real-time countdown timers.
- Search items by product name and filter by category or status.
- Enter live auction rooms and view current highest bids and bid history in real time.
- Place bids higher than current highest bids.
- View personal bidding history across all auctions.
- View won auctions in a dedicated dashboard.

### 2. Seller
- Register as a seller or bidder.
- List new products with title, description, image, category, starting price, and end date/time.
- View seller dashboard summarizing total listed, active, and completed auctions.
- Edit auction details before any bids are placed.
- Delete listed auctions before any bids are placed.
- Track real-time bids received on listed products.
- View final winners of concluded auctions.

### 3. Admin
- Sign in with administrative privileges.
- View platform-wide statistics (total users, total auctions, active auctions, ended auctions, total bids).
- View category-wise sales metrics calculated dynamically using a MongoDB aggregation pipeline.
- View and manage registered users with deletion capabilities (admin accounts are protected).
- Inspect all bids placed across the entire platform.

---

## Database Architecture

The system utilizes three core collections in MongoDB with relationships using ObjectIds and Mongoose references:

1. **User**
   - `name`: String
   - `email`: String (Unique)
   - `password`: String (Hashed with bcrypt)
   - `role`: String (`bidder`, `seller`, `admin`)
   - `createdAt`: Date

2. **Auction**
   - `seller`: ObjectId (Reference to User)
   - `title`: String
   - `description`: String
   - `image`: String
   - `category`: String (Indexed)
   - `startingPrice`: Number
   - `currentPrice`: Number
   - `endTime`: Date
   - `status`: String (`Upcoming`, `Active`, `Ended`) (Indexed)
   - `winner`: ObjectId (Reference to User, default null)
   - `createdAt`: Date

3. **Bid**
   - `auction`: ObjectId (Reference to Auction, indexed)
   - `bidder`: ObjectId (Reference to User)
   - `amount`: Number
   - `createdAt`: Date (Indexed)

---

## Key Technical Features

### 1. Atomic Concurrency Protection
To prevent race conditions where multiple users place conflicting bids at the same moment, the server uses an atomic MongoDB query:
```javascript
const updatedAuction = await Auction.findOneAndUpdate(
  {
    _id: auctionId,
    status: 'Active',
    endTime: { $gt: new Date() },
    currentPrice: { $lt: bidAmount }
  },
  {
    $set: { currentPrice: bidAmount }
  },
  { new: true }
);
```
If two simultaneous requests arrive with the same bid amount, only the first atomic operation succeeds, and the second request is immediately rejected.

### 2. Server-Side Winner Determination
Winner selection is never delegated to the client browser. A background interval executes every 5 seconds on the server:
- Finds auctions where `endTime <= new Date()` and `status === 'Active'`.
- Queries the highest valid bid from the `Bid` collection.
- Persists the highest bidder as `winner` and updates `status` to `Ended`.
- Emits an `auctionEnded` Socket.io event to all clients in the room to stop accepting further bids.

### 3. MongoDB Aggregation Pipeline
Category-wise sales are aggregated dynamically using MongoDB's aggregation pipeline:
```javascript
const categorySales = await Auction.aggregate([
  {
    $match: {
      status: 'Ended',
      winner: { $ne: null }
    }
  },
  {
    $group: {
      _id: '$category',
      totalSales: { $sum: '$currentPrice' },
      count: { $sum: 1 }
    }
  },
  {
    $project: {
      category: '$_id',
      totalSales: 1,
      count: 1,
      _id: 0
    }
  },
  {
    $sort: { totalSales: -1 }
  }
]);
```

---

## Folder Structure

```
BidZone/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── auctionController.js
│   │   ├── authController.js
│   │   └── bidController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Auction.js
│   │   ├── Bid.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── auctionRoutes.js
│   │   ├── authRoutes.js
│   │   └── bidRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AuctionDetails.jsx
│   │   │   ├── Auctions.jsx
│   │   │   ├── CreateAuction.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyAuctions.jsx
│   │   │   ├── MyBids.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Register.jsx
│   │   │   └── SellerDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── BidZone.postman_collection.json
└── README.md
```

---

## Setup and Installation

### Prerequisites
- Node.js (version 18 or newer)
- MongoDB Server running locally on port 27017 or a MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/Pulkit-X-exe/ONLINE-BIDDING-APP.git
cd ONLINE-BIDDING-APP
```

### 2. Configure Backend Environment
Navigate to `backend` and create your `.env` file based on `.env.example`:
```bash
cd backend
copy .env.example .env
```
Inside `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bidzone
JWT_SECRET=bidzone_access_secret_key_12345
JWT_REFRESH_SECRET=bidzone_refresh_secret_key_12345
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### 4. Run the Application
In your first terminal, start the backend server:
```bash
cd backend
npm start
```
The backend server runs on `http://localhost:5000`.

In your second terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## API Testing with Postman

A complete Postman collection named `BidZone.postman_collection.json` is located in the project root folder.

### How to use:
1. Open Postman.
2. Click **Import** and choose `BidZone.postman_collection.json`.
3. The collection is pre-configured with endpoints organized into:
   - `1. Authentication` (Register Bidder, Register Seller, Login, Refresh Token, Profile)
   - `2. Auctions` (Create, Get All with Search & Filters, Get By ID, Seller Auctions, Update, Delete)
   - `3. Bids` (Place Valid Bid, Place Invalid Low Bid, Auction Bid History, User Bids, Won Auctions)
   - `4. Admin & Aggregation` (Dashboard Stats, Category-wise Sales Aggregation, User List, Bid Log)
4. Tokens and IDs can be configured as collection variables for seamless testing.

---

## College Viva Questions & Answers

**Q1: Why did you use Socket.io instead of regular HTTP polling for bidding?**
> HTTP polling creates continuous overhead by sending requests every few seconds even when no new bids are placed. Socket.io maintains a persistent, full-duplex WebSocket connection. As soon as a bid is placed, the server broadcasts an event immediately to only the clients viewing that specific auction room.

**Q2: How do you prevent race conditions when two bidders place bids at the exact same moment?**
> We use MongoDB's atomic `findOneAndUpdate` with a condition `{ currentPrice: { $lt: bidAmount } }`. MongoDB executes updates on a single document atomically. If two simultaneous bids arrive, only the first update matches and completes; the second fails the condition and is rejected with an appropriate error.

**Q3: Why do you have both Access Tokens and Refresh Tokens?**
> Short-lived access tokens (15 minutes) reduce the window of vulnerability if a token is intercepted. Long-lived refresh tokens (7 days) allow users to obtain a new access token without re-entering credentials repeatedly.

**Q4: How does the server decide the winner when the auction ends?**
> Winner selection runs entirely on the backend to prevent frontend clock manipulation. The server runs an automated interval every 5 seconds that checks for active auctions past their `endTime`. It retrieves the highest bid from the `Bid` collection, assigns the bidder to the `winner` field, changes the status to `Ended`, and emits an `auctionEnded` socket event.

**Q5: What is a MongoDB aggregation pipeline and how is it used here?**
> An aggregation pipeline processes documents through ordered stages (`$match`, `$group`, `$project`, `$sort`). In our project, it filters completed auctions that have winners, groups them by product category, computes the sum of sales revenue and item counts, and outputs sorted sales statistics for the admin dashboard.
