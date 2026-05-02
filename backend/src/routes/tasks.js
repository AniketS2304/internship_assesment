const express = require('express');
const { getDb } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [req.user.id];

    if (status && status !== 'all') { query += ' AND status = ?'; params.push(status); }
    if (priority && priority !== 'all') { query += ' AND priority = ?'; params.push(priority); }
    query += ' ORDER BY created_at DESC';

    const db = await getDb();
    const tasks = await db.all(query, ...params);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, description = '', status = 'pending', priority = 'medium', due_date = '' } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Task title is required' });

    const validStatuses = ['pending', 'in-progress', 'done'];
    const validPriorities = ['low', 'medium', 'high'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    if (!validPriorities.includes(priority)) return res.status(400).json({ error: 'Invalid priority' });

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      req.user.id, title.trim(), description, status, priority, due_date
    );

    const task = await db.get('SELECT * FROM tasks WHERE id = ?', result.lastID);
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const db = await getDb();
    const task = await db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', taskId, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const {
      title = task.title,
      description = task.description,
      status = task.status,
      priority = task.priority,
      due_date = task.due_date
    } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ error: 'Task title is required' });

    await db.run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?',
      title.trim(), description, status, priority, due_date, taskId, req.user.id
    );

    const updated = await db.get('SELECT * FROM tasks WHERE id = ?', taskId);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const db = await getDb();
    const task = await db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', taskId, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', taskId, req.user.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
