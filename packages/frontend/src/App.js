import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Unable to load tasks');
      }
      const result = await response.json();
      setTasks(result);
    } catch (err) {
      setError('Error loading tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setEditingTask(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    clearMessages();
    setSaving(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
    };

    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
    const method = editingTask ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Unable to save task');
      }

      await fetchTasks();
      resetForm();
      setSuccess(editingTask ? 'Task updated successfully.' : 'Task added successfully.');
    } catch (err) {
      setError('Error saving task: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (task) => {
    clearMessages();
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate || '');
  };

  const handleCancelEdit = () => {
    clearMessages();
    resetForm();
  };

  const handleDelete = async (taskId) => {
    clearMessages();

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Unable to delete task');
      }

      await fetchTasks();
      setSuccess('Task removed successfully.');
    } catch (err) {
      setError('Error deleting task: ' + err.message);
    }
  };

  const handleToggleComplete = async (task) => {
    clearMessages();

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Unable to update task status');
      }

      await fetchTasks();
      setSuccess(task.completed ? 'Task marked incomplete.' : 'Task completed.' );
    } catch (err) {
      setError('Error updating task: ' + err.message);
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TODO List</h1>
        <p>Keep track of your tasks with due dates and status.</p>
      </header>

      <main>
        <section className="task-form-section">
          <h2>{editingTask ? 'Edit Task' : 'Add Task'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>

            <div className="field-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details (optional)"
              />
            </div>

            <div className="field-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                {editingTask ? 'Save Changes' : 'Add Task'}
              </button>
              {editingTask && (
                <button type="button" className="secondary-btn" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
            </div>

            {success && <p className="success">{success}</p>}
          </form>
        </section>

        <section className="task-list-section">
          {error && <p className="error">{error}</p>}
          <div className="section-heading">
            <h2>Tasks</h2>
            <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
          </div>

          {loading && <p>Loading tasks...</p>}
          {!loading && !error && tasks.length === 0 && <p>No tasks yet. Add one above to get started.</p>}

          {!loading && tasks.length > 0 && (
            <ul className="task-list">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-row ${task.completed ? 'completed' : ''}`}
                  aria-label={`Task ${task.title}`}
                >
                  <div className="task-details">
                    <div className="task-title-row">
                      <h3 className="task-title">{task.title}</h3>
                      <span className={`task-status ${task.completed ? 'task-completed' : 'task-pending'}`}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    {task.description && <p className="task-description">{task.description}</p>}
                    <div className="task-meta">
                      <span>{task.dueDate ? `Due ${formatDueDate(task.dueDate)}` : 'No due date'}</span>
                      <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="task-actions">
                    <button type="button" className="secondary-btn" onClick={() => handleEdit(task)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleToggleComplete(task)}
                      aria-label={`${task.completed ? 'Mark incomplete for' : 'Mark complete for'} ${task.title}`}
                    >
                      {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button type="button" className="delete-btn" onClick={() => handleDelete(task.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {error && !loading && <p className="error">{error}</p>}
        </section>
      </main>
    </div>
  );
}

export default App;