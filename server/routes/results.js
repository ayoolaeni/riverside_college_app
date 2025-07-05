import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get results
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'admin') {
      // Admin sees all results with student names
      query = `
        SELECT r.*, 
               u1.full_name as student_name, 
               u2.full_name as uploaded_by_name 
        FROM results r 
        LEFT JOIN users u1 ON r.student_id = u1.id 
        LEFT JOIN users u2 ON r.uploaded_by = u2.id 
        ORDER BY r.created_at DESC
      `;
    } else if (req.user.role === 'teacher') {
      // Teachers see results they uploaded with student names
      query = `
        SELECT r.*, 
               u1.full_name as student_name, 
               u2.full_name as uploaded_by_name 
        FROM results r 
        LEFT JOIN users u1 ON r.student_id = u1.id 
        LEFT JOIN users u2 ON r.uploaded_by = u2.id 
        WHERE r.uploaded_by = $1 
        ORDER BY r.created_at DESC
      `;
      params = [req.user.id];
    } else {
      // Students see only their own results
      query = `
        SELECT r.*, 
               u1.full_name as student_name, 
               u2.full_name as uploaded_by_name 
        FROM results r 
        LEFT JOIN users u1 ON r.student_id = u1.id 
        LEFT JOIN users u2 ON r.uploaded_by = u2.id 
        WHERE r.student_id = $1 
        ORDER BY r.created_at DESC
      `;
      params = [req.user.id];
    }

    console.log('Executing query:', query);
    console.log('With params:', params);
    
    const result = await pool.query(query, params);
    
    console.log('Query result count:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Sample result:', result.rows[0]);
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create result (Admin/Teacher)
router.post('/', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { student_id, class_level, subject, score, total_score, file_url } = req.body;

    console.log('Creating result with data:', { 
      student_id, 
      class_level, 
      subject, 
      score, 
      total_score, 
      file_url, 
      uploaded_by: req.user.id 
    });

    // Validate required fields
    if (!student_id || !class_level || !subject || score === undefined || total_score === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['student_id', 'class_level', 'subject', 'score', 'total_score']
      });
    }

    // Validate student exists and get their info
    const studentCheck = await pool.query('SELECT id, full_name, class_level FROM users WHERE id = $1 AND role = $2', [student_id, 'student']);
    if (studentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    console.log('Found student:', studentCheck.rows[0]);

    // Insert the result
    const insertResult = await pool.query(
      'INSERT INTO results (student_id, class_level, subject, score, total_score, file_url, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [student_id, class_level, subject, score, total_score, file_url, req.user.id]
    );

    // Get the complete result with student name
    const completeResult = await pool.query(`
      SELECT r.*, 
             u1.full_name as student_name, 
             u2.full_name as uploaded_by_name 
      FROM results r 
      LEFT JOIN users u1 ON r.student_id = u1.id 
      LEFT JOIN users u2 ON r.uploaded_by = u2.id 
      WHERE r.id = $1
    `, [insertResult.rows[0].id]);

    console.log('Result created successfully:', completeResult.rows[0]);
    res.status(201).json(completeResult.rows[0]);
  } catch (error) {
    console.error('Create result error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      code: error.code 
    });
  }
});

// Update result
router.put('/:id', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, class_level, subject, score, total_score, file_url } = req.body;

    let whereClause = 'id = $7';
    let params = [student_id, class_level, subject, score, total_score, file_url, id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND uploaded_by = $8';
      params.push(req.user.id);
    }

    const updateResult = await pool.query(
      `UPDATE results SET student_id = $1, class_level = $2, subject = $3, score = $4, total_score = $5, file_url = $6, updated_at = CURRENT_TIMESTAMP WHERE ${whereClause} RETURNING *`,
      params
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Result not found or access denied' });
    }

    // Get the complete updated result with student name
    const completeResult = await pool.query(`
      SELECT r.*, 
             u1.full_name as student_name, 
             u2.full_name as uploaded_by_name 
      FROM results r 
      LEFT JOIN users u1 ON r.student_id = u1.id 
      LEFT JOIN users u2 ON r.uploaded_by = u2.id 
      WHERE r.id = $1
    `, [id]);

    res.json(completeResult.rows[0]);
  } catch (error) {
    console.error('Update result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete result
router.delete('/:id', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;

    let whereClause = 'id = $1';
    let params = [id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND uploaded_by = $2';
      params.push(req.user.id);
    }

    const result = await pool.query(`DELETE FROM results WHERE ${whereClause} RETURNING id`, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Result not found or access denied' });
    }

    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;