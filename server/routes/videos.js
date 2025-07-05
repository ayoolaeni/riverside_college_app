import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all videos (Admin) or class-specific videos (Teacher/Student)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'admin') {
      query = 'SELECT v.*, u.full_name as uploaded_by_name FROM videos v LEFT JOIN users u ON v.uploaded_by = u.id ORDER BY v.created_at DESC';
    } else if (req.user.role === 'teacher') {
      query = 'SELECT v.*, u.full_name as uploaded_by_name FROM videos v LEFT JOIN users u ON v.uploaded_by = u.id WHERE v.uploaded_by = $1 ORDER BY v.created_at DESC';
      params = [req.user.id];
    } else {
      query = 'SELECT v.*, u.full_name as uploaded_by_name FROM videos v LEFT JOIN users u ON v.uploaded_by = u.id WHERE v.class_level = $1 ORDER BY v.created_at DESC';
      params = [req.user.class_level];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new video (Admin/Teacher)
router.post('/', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { title, description, url, class_level } = req.body;

    const result = await pool.query(
      'INSERT INTO videos (title, description, url, class_level, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, url, class_level, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update video (Admin or video owner)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, url, class_level } = req.body;

    let whereClause = 'id = $5';
    let params = [title, description, url, class_level, id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND uploaded_by = $6';
      params.push(req.user.id);
    }

    const result = await pool.query(
      `UPDATE videos SET title = $1, description = $2, url = $3, class_level = $4, updated_at = CURRENT_TIMESTAMP WHERE ${whereClause} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found or access denied' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete video (Admin or video owner)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let whereClause = 'id = $1';
    let params = [id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND uploaded_by = $2';
      params.push(req.user.id);
    }

    const result = await pool.query(`DELETE FROM videos WHERE ${whereClause} RETURNING id`, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found or access denied' });
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;