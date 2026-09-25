const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const seedDatabase = require('./seed/seedData');

const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/departments');
const hallRoutes = require('./routes/halls');
const bookingRoutes = require('./routes/bookings');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');

const app = express();
const server = http.createServer(app);

// Enable Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach io to request object for real-time broadcasts in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

// Health Check & Trigger Seed Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'College Hall Booking Backend', timestamp: new Date() });
});

app.post('/api/seed', (req, res) => {
  try {
    seedDatabase();
    res.json({ message: 'Database seeded successfully with demo data' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed DB automatically if database tables are empty
const hallCount = db.prepare('SELECT COUNT(*) as count FROM halls').get().count;
if (hallCount === 0) {
  seedDatabase();
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 College Hall Booking API Server running on port ${PORT}`);
});
