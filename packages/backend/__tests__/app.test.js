const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

const createTask = async (
  title = 'Temp Task To Delete',
  description = 'Temporary description',
  dueDate = '2026-08-31'
) => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title, description, dueDate })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  expect(response.body.title).toBe(title);
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const task = response.body[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('completed');
      expect(task).toHaveProperty('createdAt');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = { title: 'Test Task', description: 'Task details', dueDate: '2026-09-01' };
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.description).toBe(newTask.description);
      expect(response.body.dueDate).toBe(newTask.dueDate);
      expect(response.body.completed).toBe(false);
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'Missing title' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Task title is required');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      const task = await createTask('Original title', 'Original description');

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: 'Updated title', description: 'Updated description', dueDate: '2026-09-02' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated title');
      expect(response.body.description).toBe('Updated description');
      expect(response.body.dueDate).toBe('2026-09-02');
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app)
        .put('/api/tasks/999999')
        .send({ title: 'Missing task', description: 'No task' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should toggle task completion', async () => {
      const task = await createTask('Task to complete');

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .send({ completed: true })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });

    it('should return 400 for invalid completed value', async () => {
      const task = await createTask('Task invalid complete');

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .send({ completed: 'yes' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Completed flag is required and must be a boolean');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      const task = await createTask('Task to delete');

      const response = await request(app).delete(`/api/tasks/${task.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Task deleted successfully', id: task.id });
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app).delete('/api/tasks/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });
  });
});