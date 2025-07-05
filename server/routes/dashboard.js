import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'admin') {
      const [users, videos, assignments, announcements] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM users'),
        pool.query('SELECT COUNT(*) FROM videos'),
        pool.query('SELECT COUNT(*) FROM assignments'),
        pool.query('SELECT COUNT(*) FROM announcements')
      ]);

      stats = {
        totalUsers: parseInt(users.rows[0].count),
        totalVideos: parseInt(videos.rows[0].count),
        totalAssignments: parseInt(assignments.rows[0].count),
        totalAnnouncements: parseInt(announcements.rows[0].count)
      };
    } else if (req.user.role === 'teacher') {
      const [videos, assignments, announcements] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM videos WHERE uploaded_by = $1', [req.user.id]),
        pool.query('SELECT COUNT(*) FROM assignments WHERE created_by = $1', [req.user.id]),
        pool.query('SELECT COUNT(*) FROM announcements WHERE created_by = $1', [req.user.id])
      ]);

      stats = {
        totalVideos: parseInt(videos.rows[0].count),
        totalAssignments: parseInt(assignments.rows[0].count),
        totalAnnouncements: parseInt(announcements.rows[0].count)
      };
    } else if (req.user.role === 'student') {
      const [videos, results, assignments] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM videos WHERE class_level = $1', [req.user.class_level]),
        pool.query('SELECT score, total_score FROM results WHERE student_id = $1', [req.user.id]),
        pool.query('SELECT COUNT(*) FROM assignments WHERE class_level = $1', [req.user.class_level])
      ]);

      const averageScore = results.rows.length > 0
        ? Math.round(results.rows.reduce((acc, result) => acc + (result.score / result.total_score) * 100, 0) / results.rows.length)
        : 0;

      stats = {
        classVideos: parseInt(videos.rows[0].count),
        myResults: results.rows.length,
        pendingAssignments: parseInt(assignments.rows[0].count),
        averageScore
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activities
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    // This is a simplified version - you can expand this based on your needs
    const activities = [];
    res.json(activities);
  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;