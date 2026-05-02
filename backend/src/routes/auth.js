const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');

const router = express.Router();
const auth = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      name, email.toLowerCase(), hashedPassword
    );

    const token = jwt.sign(
      { id: result.lastID, email: email.toLowerCase(), name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: result.lastID, name, email: email.toLowerCase() }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const taskCount = await db.get('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?', req.user.id);
    const doneTasks = await db.get("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'done'", req.user.id);

    res.json({ ...user, taskCount: taskCount.count, doneTasks: doneTasks.count });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
