# TaskFlow — Frontend

React 19 + TypeScript + Vite frontend for the TaskFlow project management app. All API calls are intercepted by MSW (Mock Service Worker) — no real backend is required.

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env   # or create .env manually (see below)

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

## Environment Variables

Create a `.env` file in this folder with:

```env
VITE_API_BASE_URL=http://localhost:4000
```

This is the base URL Axios uses for all requests. Because MSW intercepts at the Service Worker level, no server actually needs to be running at that address during development.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and produce a production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | Run ESLint across all source files |

## Project Structure

```
src/
├── assets/           Static assets
├── components/
│   ├── layout/       Navbar, Layout wrapper
│   ├── projects/     ProjectCard, ProjectModal
│   └── tasks/        TaskBoard, TaskCard, TaskModal
├── context/          AuthContext, ToastContext
├── hooks/            useAuth, useProjects, useTasks
├── lib/              Axios instance (JWT interceptor)
├── mocks/            MSW browser worker, handlers, in-memory db
├── pages/            LoginPage, RegisterPage, ProjectsPage,
│                     ProjectDetailPage, TaskDetailPage
└── types/            Shared TypeScript interfaces
```

## How the Mock API Works

MSW is registered as a Service Worker in development (`main.tsx` calls `worker.start()` before mounting React). Every `axios` request is intercepted by the handlers in `src/mocks/handlers.ts` and resolved against the in-memory data in `src/mocks/db.ts`.

**The mock resets on every hard reload.** Use the seeded test account to avoid re-registering:

```
Email:    test@example.com
Password: password123
```
