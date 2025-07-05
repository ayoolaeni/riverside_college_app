import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // console.log('Login attempt:', { email, password: '***' });

    // Get user from database
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // console.log('User query result:', result.rows.length > 0 ? 'User found' : 'User not found');

    if (result.rows.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('Found user:', { id: user.id, email: user.email, role: user.role });

    // // Check password
    // console.log('Comparing passwords...');
    // console.log('Stored hash:', user.password);
    // console.log('Input password:', password);
    const validPassword = await bcrypt.compare(password, user.password);
    // console.log('Password valid:', validPassword);

    if (!validPassword) {
      // console.log('Invalid password for user:', email);
      // Try to generate a new hash for debugging
      const newHash = await bcrypt.hash(password, 10);
      // console.log('Generated hash for input password:', newHash);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    // console.log('Login successful for user:', email);
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, full_name, role, class_level, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;