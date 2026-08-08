import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const initialTasks = [
  {
    id: 1,
    title: 'Write summary',
    description: 'Capture the bootcamp notes.',
    dueDate: '2026-08-20',
    completed: false,
    createdAt: '2026-08-10T00:00:00.000Z',
    updatedAt: '2026-08-10T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Review requirements',
    description: 'Read functional requirements and UI guidance.',
    dueDate: '2026-08-18',
    completed: false,
    createdAt: '2026-08-09T00:00:00.000Z',
    updatedAt: '2026-08-09T00:00:00.000Z',
  },
];

let taskStore = [];

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(taskStore));
  }),

  rest.post('/api/tasks', async (req, res, ctx) => {
    const body = await req.json();
    if (!body.title || body.title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }

    const newTask = {
      id: taskStore.length + 1,
      title: body.title.trim(),
      description: body.description || '',
      dueDate: body.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    taskStore.unshift(newTask);
    return res(ctx.status(201), ctx.json(newTask));
  }),

  rest.put('/api/tasks/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();

    if (!body.title || body.title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }

    const taskId = Number(id);
    const task = taskStore.find((item) => item.id === taskId);
    if (!task) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    task.title = body.title.trim();
    task.description = body.description || '';
    task.dueDate = body.dueDate || null;
    task.updatedAt = new Date().toISOString();

    return res(ctx.status(200), ctx.json(task));
  }),

  rest.patch('/api/tasks/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();
    const taskId = Number(id);
    const task = taskStore.find((item) => item.id === taskId);

    if (!task) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    if (typeof body.completed !== 'boolean') {
      return res(ctx.status(400), ctx.json({ error: 'Completed flag is required and must be a boolean' }));
    }

    task.completed = body.completed;
    task.updatedAt = new Date().toISOString();

    return res(ctx.status(200), ctx.json(task));
  }),

  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const { id } = req.params;
    const taskId = Number(id);
    const index = taskStore.findIndex((item) => item.id === taskId);

    if (index === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    taskStore.splice(index, 1);
    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id: taskId }));
  })
);

beforeAll(() => server.listen());
beforeEach(() => {
  taskStore = initialTasks.map((task) => ({ ...task }));
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

describe('App Component', () => {
  test('renders header and task form', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /todo list/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  test('loads and displays tasks', async () => {
    render(<App />);

    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Write summary')).toBeInTheDocument();
      expect(screen.getByText('Review requirements')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const dueDateInput = screen.getByLabelText(/due date/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New details');
    await user.type(dueDateInput, '2026-08-25');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
      expect(screen.getByText(/task added successfully/i)).toBeInTheDocument();
    });
  });

  test('edits an existing task', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Write summary')).toBeInTheDocument();
    });

    const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
    await user.click(editButton);

    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    await user.clear(titleInput);
    await user.type(titleInput, 'Write updated summary');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Write updated summary')).toBeInTheDocument();
      expect(screen.getByText(/task updated successfully/i)).toBeInTheDocument();
    });
  });

  test('toggles task completion', async () => {
    const user = userEvent.setup();
    render(<App />);

    const taskRow = await screen.findByRole('listitem', { name: /task write summary/i });
    expect(taskRow).toBeInTheDocument();

    const toggleButton = within(taskRow).getByRole('button', {
      name: /mark complete for write summary/i,
    });
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText(/task completed/i)).toBeInTheDocument();
    });

    const updatedRow = screen.getByRole('listitem', { name: /task write summary/i });
    expect(within(updatedRow).getByText('Completed')).toBeInTheDocument();
  });

  test('handles API error when loading tasks', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText(/error loading tasks/i).length).toBeGreaterThan(0);
    });
  });

  test('shows empty state when no tasks are returned', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });
  });
});