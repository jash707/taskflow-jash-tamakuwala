import { http, HttpResponse, delay } from 'msw';
import { v4 as uuidv4 } from 'uuid';
import { users, passwords, projects, tasks } from './db';
import type { Task } from '../types';

// helper: extract user_id from Bearer token (we encode as base64 JSON)
function getUserFromRequest(request: Request): { id: string; email: string } | null {
  const auth = request.headers.get('Authorization') ?? '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

function makeToken(id: string, email: string): string {
  return btoa(JSON.stringify({ id, email }));
}

export const handlers = [
  // ─── POST /auth/register ───────────────────────────────────────────────
  http.post('http://localhost:4000/auth/register', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { name?: string; email?: string; password?: string };

    const fields: Record<string, string> = {};
    if (!body.name) fields.name = 'is required';
    if (!body.email) fields.email = 'is required';
    if (!body.password) fields.password = 'is required';
    if (Object.keys(fields).length) {
      return HttpResponse.json({ error: 'validation failed', fields }, { status: 400 });
    }

    if (users.find((u) => u.email === body.email)) {
      return HttpResponse.json(
        { error: 'validation failed', fields: { email: 'already taken' } },
        { status: 400 },
      );
    }

    const user = {
      id: uuidv4(),
      name: body.name!,
      email: body.email!,
      created_at: new Date().toISOString(),
    };
    users.push(user);
    passwords[user.email] = body.password!;

    const token = makeToken(user.id, user.email);
    return HttpResponse.json({ token, user }, { status: 201 });
  }),

  // ─── POST /auth/login ──────────────────────────────────────────────────
  http.post('http://localhost:4000/auth/login', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { email?: string; password?: string };

    const user = users.find((u) => u.email === body.email);
    if (!user || passwords[user.email] !== body.password) {
      return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const token = makeToken(user.id, user.email);
    return HttpResponse.json({ token, user }, { status: 200 });
  }),

  // ─── GET /projects ─────────────────────────────────────────────────────
  http.get('http://localhost:4000/projects', async ({ request }) => {
    await delay(500);
    const auth = getUserFromRequest(request);
    if (!auth) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const accessible = projects.filter(
      (p) =>
        p.owner_id === auth.id ||
        tasks.some((t) => t.project_id === p.id && t.assignee_id === auth.id),
    );
    return HttpResponse.json({ projects: accessible });
  }),

  // ─── POST /projects ────────────────────────────────────────────────────
  http.post('http://localhost:4000/projects', async ({ request }) => {
    await delay(500);
    const auth = getUserFromRequest(request);
    if (!auth) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = (await request.json()) as { name?: string; description?: string; code?: string };
    if (!body.name) {
      return HttpResponse.json(
        { error: 'validation failed', fields: { name: 'is required' } },
        { status: 400 },
      );
    }
    if (!body.code) {
      return HttpResponse.json(
        { error: 'validation failed', fields: { code: 'is required' } },
        { status: 400 },
      );
    }

    const project = {
      id: uuidv4(),
      code: body.code.toUpperCase(),
      name: body.name,
      description: body.description,
      owner_id: auth.id,
      created_at: new Date().toISOString(),
    };
    projects.push(project);
    return HttpResponse.json(project, { status: 201 });
  }),

  // ─── GET /projects/:id ────────────────────────────────────────────────
  http.get('http://localhost:4000/projects/:id', async ({ request, params }) => {
    await delay(500);
    const auth = getUserFromRequest(request);
    if (!auth) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const project = projects.find((p) => p.id === params.id || p.code === (typeof params.id === 'string' ? params.id.toUpperCase() : params.id));
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    const projectTasks = tasks.filter((t) => t.project_id === project.id);
    return HttpResponse.json({ ...project, tasks: projectTasks });
  }),

  // ─── PATCH /projects/:id ──────────────────────────────────────────────
  http.patch('http://localhost:4000/projects/:id', async ({ request, params }) => {
    await delay(500);
    const auth = getUserFromRequest(request);
    if (!auth) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const idx = projects.findIndex((p) => p.id === params.id || p.code === (typeof params.id === 'string' ? params.id.toUpperCase() : params.id));
    if (idx === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    if (projects[idx].owner_id !== auth.id) {
      return HttpResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as { name?: string; description?: string };
    projects[idx] = { ...projects[idx], ...body };
    return HttpResponse.json(projects[idx]);
  }),

  // ─── DELETE /projects/:id ─────────────────────────────────────────────
  http.delete('http://localhost:4000/projects/:id', async ({ request, params }) => {
    await delay(500);
    const auth = getUserFromRequest(request);
    if (!auth) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const idx = projects.findIndex((p) => p.id === params.id || p.code === (typeof params.id === 'string' ? params.id.toUpperCase() : params.id));
    if (idx === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    if (projects[idx].owner_id !== auth.id) {
      return HttpResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const projectId = projects[idx].id;
    projects.splice(idx, 1);
    // also delete all tasks belonging to this project
    const toRemove = tasks
      .map((t, i) => (t.project_id === projectId ? i : -1))
      .filter((i) => i !== -1)
      .reverse();
    toRemove.forEach((i) => tasks.splice(i, 1));

    return new HttpResponse(null, { status: 204 });
  }),

  // ─── GET /projects/:id/tasks ──────────────────────────────────────────
  http.get('http://localhost:4000/projects/:id/tasks', async ({ request, params }) => {
    await delay(500);
    const auth = getUserFromRequest(request);
    if (!auth) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const project = projects.find((p) => p.id === params.id || p.code === (typeof params.id === 'string' ? params.id.toUpperCase() : params.id));
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    const assigneeFilter = url.searchParams.get('assignee');
    const labelFilter = url.searchParams.get('label');

    let result = tasks.filter((t) => t.project_id === project.id);
    if (statusFilter) result = result.filter((t) => t.status === statusFilter);
    if (assigneeFilter) result = result.filter((t) => t.assignee_id === assigneeFilter);
    if (labelFilter) {
      const lowerLabel = labelFilter.toLowerCase();
      result = result.filter((t) => t.labels?.some((l) => l.toLowerCase().includes(lowerLabel)));
    }

    return HttpResponse.json({ tasks: result });
  }),

  // ─── POST /projects/:id/tasks ─────────────────────────────────────────
  http.post('http://localhost:4000/projects/:id/tasks', async ({ request, params }) => {
    await delay(500);
    const auth = getUserFromRequest(request);
    if (!auth) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const project = projects.find((p) => p.id === params.id || p.code === (typeof params.id === 'string' ? params.id.toUpperCase() : params.id));
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    const body = (await request.json()) as Partial<Task>;
    if (!body.title) {
      return HttpResponse.json(
        { error: 'validation failed', fields: { title: 'is required' } },
        { status: 400 },
      );
    }

    const projectTasks = tasks.filter((t) => t.project_id === project.id);
    const nextNum = projectTasks.length + 1;
    const task_key = `${project.code}-${nextNum}`;

    const task: Task = {
      id: uuidv4(),
      task_key,
      title: body.title,
      description: body.description,
      labels: body.labels ?? [],
      status: body.status ?? 'todo',
      priority: body.priority ?? 'medium',
      project_id: project.id,
      assignee_id: body.assignee_id,
      due_date: body.due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    tasks.push(task);
    return HttpResponse.json(task, { status: 201 });
  }),

  // ─── GET /tasks/:id ───────────────────────────────────────────────────
  http.get('http://localhost:4000/tasks/:id', async ({ request, params }) => {
    await delay(500);
    const auth = getUserFromRequest(request);
    if (!auth) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const task = tasks.find((t) => t.id === params.id || t.task_key === (typeof params.id === 'string' ? params.id.toUpperCase() : params.id));
    if (!task) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    return HttpResponse.json(task);
  }),

  // ─── PATCH /tasks/:id ─────────────────────────────────────────────────
  http.patch('http://localhost:4000/tasks/:id', async ({ request, params }) => {
    await delay(500);
    const auth = getUserFromRequest(request);
    if (!auth) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const idx = tasks.findIndex((t) => t.id === params.id || t.task_key === (typeof params.id === 'string' ? params.id.toUpperCase() : params.id));
    if (idx === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    const body = (await request.json()) as Partial<Task>;
    tasks[idx] = { ...tasks[idx], ...body, updated_at: new Date().toISOString() };
    return HttpResponse.json(tasks[idx]);
  }),

  // ─── DELETE /tasks/:id ────────────────────────────────────────────────
  http.delete('http://localhost:4000/tasks/:id', async ({ request, params }) => {
    await delay(500);
    const auth = getUserFromRequest(request);
    if (!auth) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const idx = tasks.findIndex((t) => t.id === params.id || t.task_key === (typeof params.id === 'string' ? params.id.toUpperCase() : params.id));
    if (idx === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    tasks.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
