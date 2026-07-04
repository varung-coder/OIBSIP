import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { seedDatabase } from './utils/seeder.js';
import { initSocket } from './socket/socketHandler.js';
import { initCronJobs } from './cron/cronService.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load environment variables
dotenv.config();

// Connect to Database & Seed
connectDB().then(() => {
  seedDatabase();
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.io connection mapping
initSocket(server);

// Initialize Cron Jobs (e.g. low-stock checks)
initCronJobs();

// Security Header protection
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for dev ease-of-use with Razorpay scripts
}));

// Cross-Origin Resource Sharing
const allowedOrigins = [
  'http://localhost:5173',
  'https://oibsip-2uvp.vercel.app'
];

if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',').map(o => o.trim());
  envOrigins.forEach(origin => {
    if (origin && !allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Express rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request body JSON parsing middleware
app.use(express.json());

// Main Router registrations
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);

// Default Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PizzaPilot API running smoothly.',
    timestamp: new Date(),
  });
});

// Fallbacks & Error interception
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SERVER] PizzaPilot Console API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
