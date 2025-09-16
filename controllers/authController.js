const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const Log = require("../models/Log");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

// ---------------- JWT Helpers ----------------
const signAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
};

const createRefreshToken = async (user, ip, userAgent) => {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + parseExpires(REFRESH_EXPIRES));

  await RefreshToken.create({
    user: user._id,
    token,
    expiresAt,
    ip,
    userAgent,
  });

  return token;
};

function parseExpires(value) {
  if (typeof value === "string") {
    if (value.endsWith("m")) return parseInt(value) * 60 * 1000;
    if (value.endsWith("h")) return parseInt(value) * 60 * 60 * 1000;
    if (value.endsWith("d")) return parseInt(value) * 24 * 60 * 60 * 1000;
    if (value.endsWith("s")) return parseInt(value) * 1000;
  }
  const n = Number(value);
  return isNaN(n) ? 7 * 24 * 60 * 60 * 1000 : n; // default 7 days
}

// ---------------- Signup ----------------
exports.signup = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    // Ensure password is a string
    if (typeof password !== "string") {
      password = String(password);
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const user = await User.create({ name, email, password });

    await Log.create({
      user: user._id,
      actionType: "signup",
      ip: req.ip,
      meta: { email },
    });

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user, req.ip, req.get("User-Agent"));

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- Login ----------------
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    // Ensure password is a string
    if (typeof password !== "string") {
      password = String(password);
    }

    const user = await User.findOne({ email });
    if (!user) {
      await Log.create({
        actionType: "login-failed",
        ip: req.ip,
        meta: { email },
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      await Log.create({
        user: user._id,
        actionType: "login-failed",
        ip: req.ip,
        meta: { email },
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user, req.ip, req.get("User-Agent"));

    await Log.create({
      user: user._id,
      actionType: "login-success",
      ip: req.ip,
    });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

// ---------------- Refresh Token ----------------
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ error: "Missing refreshToken" });

    const stored = await RefreshToken.findOne({ token: refreshToken }).populate("user");
    if (!stored) return res.status(401).json({ error: "Invalid refresh token" });

    const user = stored.user;
    const accessToken = signAccessToken(user);

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// ---------------- Logout ----------------
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ error: "Missing refreshToken" });

    await RefreshToken.findOneAndDelete({ token: refreshToken });
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};
