const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('Task API integration', () => {
  it('creates, reads, updates, and deletes a task through the API', async () => {
    const createdResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Integration task',
        description: 'Created by integration test',
        dueDate: '2026-09-20',
      })
      .set('Accept', 'application/json');

    expect(createdResponse.status).toBe(201);
    expect(createdResponse.body).toMatchObject({
      title: 'Integration task',
      description: 'Created by integration test',
      dueDate: '2026-09-20',
      completed: false,
    });

    const taskId = createdResponse.body.id;

    const listResponse = await request(app).get('/api/tasks');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.some((task) => task.id === taskId)).toBe(true);

    const updateResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({
        title: 'Updated integration task',
        description: 'Updated by integration test',
        dueDate: '2026-09-21',
      })
      .set('Accept', 'application/json');

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: taskId,
      title: 'Updated integration task',
      description: 'Updated by integration test',
      dueDate: '2026-09-21',
    });

    const toggleResponse = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ completed: true })
      .set('Accept', 'application/json');

    expect(toggleResponse.status).toBe(200);
    expect(toggleResponse.body.completed).toBe(true);

    const deleteResponse = await request(app).delete(`/api/tasks/${taskId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: taskId });
  });
});
