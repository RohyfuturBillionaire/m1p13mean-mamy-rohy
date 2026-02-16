const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Role = require('../models/Role');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

const loginUser = async (user, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await RefreshToken.create({
    user_id: user._id,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  });

  const role = user.id_role ? await Role.findById(user.id_role) : null;

  return {
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      role: role ? role.role_name : null
    }
  };
};

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, id_role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      id_role
    });
    await user.save();

    const response = await loginUser(user, res);
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[LOGIN] Attempt for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('[LOGIN] No user found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('[LOGIN] User found:', user.email, '| Password starts with $2:', user.password?.startsWith('$2'));

    // If password is plain text (not hashed), hash it first then compare
    if (user.password && !user.password.startsWith('$2')) {
      console.log('[LOGIN] Plain text password detected, hashing it now...');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
    }

    const match = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password match:', match);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const response = await loginUser(user, res);
    res.json(response);
  } catch (error) {
    console.error('[LOGIN] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// RESET PASSWORD (dev helper)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REFRESH TOKEN
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await RefreshToken.findOne({
      token_hash: tokenHash,
      revoked: false,
      expires_at: { $gt: new Date() }
    });

    if (!storedToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(storedToken.user_id);
    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGOUT
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await RefreshToken.updateOne({ token_hash: tokenHash }, { revoked: true });
  }

  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

module.exports = router;
