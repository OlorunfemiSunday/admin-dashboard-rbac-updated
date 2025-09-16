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

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
