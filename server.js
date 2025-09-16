require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const logRoutes = require("./routes/logs");
const statsRoutes = require("./routes/stats");
const userRoutes = require("./routes/users");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Notes API is running successfully!',
    version: '1.0.0',
    status: 'Active',
    endpoints: {
      auth: '/api/auth',
      logs: '/api/logs',
      stats: '/api/stats',
      users: '/api/users'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// rate limiter for auth (login) routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many requests from this IP, please try again later." },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", userRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: ['/api/auth', '/api/logs', '/api/stats', '/api/users']
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
