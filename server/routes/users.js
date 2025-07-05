import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    let query;
    let params = [];
    
    if (req.user.role === 'admin') {
      // Admin sees all users
      query = 'SELECT id, email, username, full_name, role, class_level, created_at FROM users ORDER BY created_at DESC';
    } else if (req.user.role === 'teacher') {
      // Teachers see only students from their class level
      query = 'SELECT id, email, username, full_name, role, class_level, created_at FROM users WHERE role = $1 AND class_level = $2 ORDER BY created_at DESC';
      params = ['student', req.user.class_level];
    }
    
    console.log('Users query for', req.user.role, ':', query);
    console.log('With params:', params);
    
    const result = await pool.query(query, params);
    
    console.log('Found', result.rows.length, 'users for', req.user.role);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { email, username, full_name, password, role, class_level } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (email, username, full_name, password, role, class_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, username, full_name, role, class_level, created_at',
      [email, username, full_name, hashedPassword, role, class_level]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, full_name, role, class_level } = req.body;

    const result = await pool.query(
      'UPDATE users SET email = $1, username = $2, full_name = $3, role = $4, class_level = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, email, username, full_name, role, class_level, updated_at',
      [email, username, full_name, role, class_level, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset user password (Admin only)
router.post('/:id/reset-password', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;