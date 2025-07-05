import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get announcements
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'admin') {
      query = 'SELECT a.*, u.full_name as created_by_name FROM announcements a LEFT JOIN users u ON a.created_by = u.id ORDER BY a.created_at DESC';
    } else {
      // Students and teachers see school-wide announcements and class-specific ones
      query = 'SELECT a.*, u.full_name as created_by_name FROM announcements a LEFT JOIN users u ON a.created_by = u.id WHERE a.class_level IS NULL OR a.class_level = $1 ORDER BY a.created_at DESC';
      params = [req.user.class_level];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create announcement (Admin/Teacher)
router.post('/', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { title, content, class_level } = req.body;

    const result = await pool.query(
      'INSERT INTO announcements (title, content, created_by, class_level) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, req.user.id, class_level]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update announcement
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, class_level } = req.body;

    let whereClause = 'id = $4';
    let params = [title, content, class_level, id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND created_by = $5';
      params.push(req.user.id);
    }

    const result = await pool.query(
      `UPDATE announcements SET title = $1, content = $2, class_level = $3, updated_at = CURRENT_TIMESTAMP WHERE ${whereClause} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found or access denied' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete announcement
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let whereClause = 'id = $1';
    let params = [id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND created_by = $2';
      params.push(req.user.id);
    }

    const result = await pool.query(`DELETE FROM announcements WHERE ${whereClause} RETURNING id`, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found or access denied' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;