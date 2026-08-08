const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const dbPath = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.join(__dirname, '..', '..', 'data', 'tasks.db');

if (dbPath !== ':memory:') {
  const dbDir = path.dirname(dbPath);
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const mapTask = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    dueDate: row.due_date || null,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const insertTask = db.prepare(
  'INSERT INTO tasks (title, description, due_date, completed) VALUES (?, ?, ?, ?)'
);
const getTaskById = db.prepare(
  'SELECT id, title, description, due_date, completed, created_at, updated_at FROM tasks WHERE id = ?'
);
const updateTask = db.prepare(
  'UPDATE tasks SET title = ?, description = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
);
const updateTaskStatus = db.prepare(
  'UPDATE tasks SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
);
const deleteTask = db.prepare('DELETE FROM tasks WHERE id = ?');

const initialTasks = [
  {
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, and coffee',
    dueDate: '2026-08-15',
    completed: 0,
  },
  {
    title: 'Read the project guide',
    description: 'Review the bootcamp requirements and architecture',
    dueDate: '2026-08-10',
    completed: 0,
  },
  {
    title: 'Write follow-up notes',
    description: 'Summarize what was learned in the session',
    dueDate: null,
    completed: 0,
  },
];

const tasksCount = db.prepare('SELECT COUNT(1) AS count FROM tasks').get().count;
if (tasksCount === 0) {
  initialTasks.forEach((task) => {
    insertTask.run(task.title, task.description, task.dueDate, task.completed);
  });
}

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/tasks', (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT id, title, description, due_date, completed, created_at, updated_at
         FROM tasks
         ORDER BY completed ASC, due_date IS NULL, due_date ASC, created_at DESC`
      )
      .all();
    const tasks = rows.map(mapTask);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const task = mapTask(getTaskById.get(id));

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (dueDate && Number.isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'Due date must be a valid date' });
    }

    const result = insertTask.run(
      title.trim(),
      description ? description.trim() : '',
      dueDate || null,
      0
    );
    const task = mapTask(getTaskById.get(result.lastInsertRowid));

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (dueDate && Number.isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'Due date must be a valid date' });
    }

    const existingTask = getTaskById.get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    updateTask.run(title.trim(), description ? description.trim() : '', dueDate || null, id);
    const updatedTask = mapTask(getTaskById.get(id));

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.patch('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed flag is required and must be a boolean' });
    }

    const existingTask = getTaskById.get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    updateTaskStatus.run(completed ? 1 : 0, id);
    const updatedTask = mapTask(getTaskById.get(id));

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingTask = getTaskById.get(id);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    deleteTask.run(id);
    res.json({ message: 'Task deleted successfully', id: parseInt(id, 10) });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = { app, db };