import type { User, Project, Task } from '../types';

// ─── Seed Users ──────────────────────────────────────────────────────────────
export const users: User[] = [
  {
    id: 'user-seed-1',
    name: 'Jane Doe',
    email: 'test@example.com',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-seed-2',
    name: 'Alex Chen',
    email: 'alex@example.com',
    created_at: '2026-01-02T00:00:00Z',
  },
];

// password is "password123" hashed — we just store plaintext in mock
export const passwords: Record<string, string> = {
  'test@example.com': 'password123',
  'alex@example.com': 'password123',
};

// ─── Seed Projects ────────────────────────────────────────────────────────────
export const projects: Project[] = [
  {
    id: 'proj-seed-1',
    name: 'Website Redesign',
    description: 'Revamp the company landing page for Q2 launch',
    owner_id: 'user-seed-1',
    created_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'proj-seed-2',
    name: 'Mobile App MVP',
    description: 'iOS and Android launch for the core product',
    owner_id: 'user-seed-1',
    created_at: '2026-03-15T09:00:00Z',
  },
];

// ─── Seed Tasks ───────────────────────────────────────────────────────────────
export const tasks: Task[] = [
  {
    id: 'task-seed-1',
    title: 'Design the hero section',
    description: 'Create high-fidelity mockups for the hero banner',
    status: 'done',
    priority: 'high',
    project_id: 'proj-seed-1',
    assignee_id: 'user-seed-2',
    due_date: '2026-04-01',
    created_at: '2026-03-02T10:00:00Z',
    updated_at: '2026-03-28T14:00:00Z',
  },
  {
    id: 'task-seed-2',
    title: 'Implement navigation menu',
    description: 'Build responsive nav with mobile hamburger toggle',
    status: 'in_progress',
    priority: 'medium',
    project_id: 'proj-seed-1',
    assignee_id: 'user-seed-1',
    due_date: '2026-04-15',
    created_at: '2026-03-05T11:00:00Z',
    updated_at: '2026-04-08T09:00:00Z',
  },
  {
    id: 'task-seed-3',
    title: 'Write copy for About page',
    description: 'Draft and review content for the team & mission section',
    status: 'todo',
    priority: 'low',
    project_id: 'proj-seed-1',
    assignee_id: undefined,
    due_date: '2026-04-20',
    created_at: '2026-03-10T08:00:00Z',
    updated_at: '2026-03-10T08:00:00Z',
  },
];
