import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get submissions
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'admin') {
      // Admin sees all submissions
      query = `
        SELECT s.*, 
               u.full_name as student_name,
               a.title as assignment_title,
               a.type as assignment_type,
               a.class_level,
               u2.full_name as graded_by_name
        FROM assignment_submissions s 
        LEFT JOIN users u ON s.student_id = u.id 
        LEFT JOIN assignments a ON s.assignment_id = a.id
        LEFT JOIN users u2 ON s.graded_by = u2.id
        ORDER BY s.submitted_at DESC
      `;
    } else if (req.user.role === 'teacher') {
      // Teachers see submissions for their assignments
      query = `
        SELECT s.*, 
               u.full_name as student_name,
               a.title as assignment_title,
               a.type as assignment_type,
               a.class_level,
               u2.full_name as graded_by_name
        FROM assignment_submissions s 
        LEFT JOIN users u ON s.student_id = u.id 
        LEFT JOIN assignments a ON s.assignment_id = a.id
        LEFT JOIN users u2 ON s.graded_by = u2.id
        WHERE a.created_by = $1
        ORDER BY s.submitted_at DESC
      `;
      params = [req.user.id];
    } else {
      // Students see only their own submissions
      query = `
        SELECT s.*, 
               u.full_name as student_name,
               a.title as assignment_title,
               a.type as assignment_type,
               a.class_level,
               u2.full_name as graded_by_name
        FROM assignment_submissions s 
        LEFT JOIN users u ON s.student_id = u.id 
        LEFT JOIN assignments a ON s.assignment_id = a.id
        LEFT JOIN users u2 ON s.graded_by = u2.id
        WHERE s.student_id = $1
        ORDER BY s.submitted_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get submissions for a specific assignment
router.get('/assignment/:assignmentId', authenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    let query;
    let params = [assignmentId];

    if (req.user.role === 'admin') {
      query = `
        SELECT s.*, 
               u.full_name as student_name,
               a.title as assignment_title,
               a.type as assignment_type
        FROM assignment_submissions s 
        LEFT JOIN users u ON s.student_id = u.id 
        LEFT JOIN assignments a ON s.assignment_id = a.id
        WHERE s.assignment_id = $1
        ORDER BY s.submitted_at DESC
      `;
    } else if (req.user.role === 'teacher') {
      // Verify teacher owns the assignment
      query = `
        SELECT s.*, 
               u.full_name as student_name,
               a.title as assignment_title,
               a.type as assignment_type
        FROM assignment_submissions s 
        LEFT JOIN users u ON s.student_id = u.id 
        LEFT JOIN assignments a ON s.assignment_id = a.id
        WHERE s.assignment_id = $1 AND a.created_by = $2
        ORDER BY s.submitted_at DESC
      `;
      params = [assignmentId, req.user.id];
    } else {
      // Students see only their own submission for this assignment
      query = `
        SELECT s.*, 
               u.full_name as student_name,
               a.title as assignment_title,
               a.type as assignment_type
        FROM assignment_submissions s 
        LEFT JOIN users u ON s.student_id = u.id 
        LEFT JOIN assignments a ON s.assignment_id = a.id
        WHERE s.assignment_id = $1 AND s.student_id = $2
        ORDER BY s.submitted_at DESC
      `;
      params = [assignmentId, req.user.id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create submission
router.post('/', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const { assignment_id, file_url, answers } = req.body;

    // Validate assignment exists and student can submit
    const assignmentCheck = await pool.query(
      'SELECT id, class_level, type FROM assignments WHERE id = $1',
      [assignment_id]
    );

    if (assignmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignment = assignmentCheck.rows[0];

    // Check if student is in the correct class
    if (assignment.class_level !== req.user.class_level) {
      return res.status(403).json({ error: 'You are not enrolled in this class' });
    }

    // Check if student has already submitted
    const existingSubmission = await pool.query(
      'SELECT id FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignment_id, req.user.id]
    );

    if (existingSubmission.rows.length > 0) {
      return res.status(400).json({ error: 'You have already submitted this assignment' });
    }

    // Validate submission based on assignment type
    if (assignment.type === 'pdf' && !file_url) {
      return res.status(400).json({ error: 'PDF file URL is required for PDF assignments' });
    }

    if (assignment.type === 'cbt' && !answers) {
      return res.status(400).json({ error: 'Answers are required for CBT assignments' });
    }

    // Serialize answers to JSON if provided
    let answersJson = null;
    if (answers) {
      try {
        answersJson = JSON.stringify(answers);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid answers format' });
      }
    }

    const result = await pool.query(
      'INSERT INTO assignment_submissions (assignment_id, student_id, file_url, answers) VALUES ($1, $2, $3, $4) RETURNING *',
      [assignment_id, req.user.id, file_url, answersJson]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Grade submission (Teachers/Admin only)
router.put('/:id', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    const { score, approved } = req.body;

    if (score === undefined || score < 0) {
      return res.status(400).json({ error: 'Valid score is required' });
    }

    let whereClause = 'id = $1';
    let params = [id];

    // If teacher, verify they own the assignment
    if (req.user.role === 'teacher') {
      const submissionCheck = await pool.query(`
        SELECT s.id 
        FROM assignment_submissions s
        JOIN assignments a ON s.assignment_id = a.id
        WHERE s.id = $1 AND a.created_by = $2
      `, [id, req.user.id]);

      if (submissionCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Submission not found or access denied' });
      }
    }

    const result = await pool.query(
      'UPDATE assignment_submissions SET score = $2, graded_at = CURRENT_TIMESTAMP, graded_by = $3 WHERE id = $1 RETURNING *',
      [id, score, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete submission
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let whereClause = 'id = $1';
    let params = [id];

    if (req.user.role === 'student') {
      whereClause += ' AND student_id = $2';
      params.push(req.user.id);
    } else if (req.user.role === 'teacher') {
      // Teachers can delete submissions for their assignments
      const submissionCheck = await pool.query(`
        SELECT s.id 
        FROM assignment_submissions s
        JOIN assignments a ON s.assignment_id = a.id
        WHERE s.id = $1 AND a.created_by = $2
      `, [id, req.user.id]);

      if (submissionCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Submission not found or access denied' });
      }
    }

    const result = await pool.query(`DELETE FROM assignment_submissions WHERE ${whereClause} RETURNING id`, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found or access denied' });
    }

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;