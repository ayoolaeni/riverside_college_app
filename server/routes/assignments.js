import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get assignments
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'admin') {
      query = 'SELECT a.*, u.full_name as created_by_name FROM assignments a LEFT JOIN users u ON a.created_by = u.id ORDER BY a.created_at DESC';
    } else if (req.user.role === 'teacher') {
      query = 'SELECT a.*, u.full_name as created_by_name FROM assignments a LEFT JOIN users u ON a.created_by = u.id WHERE a.created_by = $1 ORDER BY a.created_at DESC';
      params = [req.user.id];
    } else {
      // Students only see assignments for their class level
      query = 'SELECT a.*, u.full_name as created_by_name FROM assignments a LEFT JOIN users u ON a.created_by = u.id WHERE a.class_level = $1 ORDER BY a.created_at DESC';
      params = [req.user.class_level];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create assignment (Admin/Teacher)
router.post('/', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { title, description, type, class_level, due_date, file_url, questions } = req.body;

    console.log('Creating assignment with data:', {
      title,
      description,
      type,
      class_level,
      due_date,
      file_url,
      questions: questions ? 'Questions provided' : 'No questions'
    });

    // Properly serialize questions to JSON string if they exist
    let questionsJson = null;
    if (questions && Array.isArray(questions) && questions.length > 0) {
      try {
        questionsJson = JSON.stringify(questions);
        console.log('Serialized questions JSON:', questionsJson);
      } catch (jsonError) {
        console.error('Error serializing questions to JSON:', jsonError);
        return res.status(400).json({ error: 'Invalid questions format' });
      }
    }

    const result = await pool.query(
      'INSERT INTO assignments (title, description, type, class_level, created_by, due_date, file_url, questions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, type, class_level, req.user.id, due_date, file_url, questionsJson]
    );

    console.log('Assignment created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create assignment error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update assignment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, class_level, due_date, file_url, questions } = req.body;

    // Properly serialize questions to JSON string if they exist
    let questionsJson = null;
    if (questions && Array.isArray(questions) && questions.length > 0) {
      try {
        questionsJson = JSON.stringify(questions);
      } catch (jsonError) {
        console.error('Error serializing questions to JSON:', jsonError);
        return res.status(400).json({ error: 'Invalid questions format' });
      }
    }

    let whereClause = 'id = $8';
    let params = [title, description, type, class_level, due_date, file_url, questionsJson, id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND created_by = $9';
      params.push(req.user.id);
    }

    const result = await pool.query(
      `UPDATE assignments SET title = $1, description = $2, type = $3, class_level = $4, due_date = $5, file_url = $6, questions = $7, updated_at = CURRENT_TIMESTAMP WHERE ${whereClause} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found or access denied' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete assignment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let whereClause = 'id = $1';
    let params = [id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND created_by = $2';
      params.push(req.user.id);
    }

    const result = await pool.query(`DELETE FROM assignments WHERE ${whereClause} RETURNING id`, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found or access denied' });
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;