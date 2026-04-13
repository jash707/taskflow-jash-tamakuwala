# TaskFlow - Frontend Engineer Take-Home Assignment

## 1. Overview
TaskFlow is a minimal, polished task management application built as a submission for the Greening India Mid-level Frontend Engineer role. The app features authentication, project management, and task boards with rich interaction, including optimistic updates and drag-and-drop support.

Since this submission is for the Frontend-only role, no backend was built. Instead, the application runs entirely against a locally mocked API using Mock Service Worker (MSW), matching the provided spec in Appendix A.

**Tech Stack:**
*   **Framework:** React 19 with TypeScript (via Vite)
*   **Routing:** React Router v7
*   **Styling:** Tailwind CSS (v3) with CSS variables for dynamic themes
*   **Mock API Framework:** MSW v2 (Mock Service Worker)
*   **Server State / Data Fetching:** TanStack React Query v5
*   **Forms & Validation:** React Hook Form + Zod
*   **Drag & Drop:** @dnd-kit
*   **HTTP Client:** Axios (configured with an interceptor for JWT injection)

## 2. Architecture Decisions
*   **Mocking Approach (MSW):** MSW was selected over `json-server` because it intercepts requests at the network level using a Service Worker. This allows the application code (`axios.ts`, components, etc.) to remain completely unaware that it's talking to a mock — transitioning to a real backend requires only changing `VITE_API_BASE_URL`, with zero code changes elsewhere.
*   **TanStack React Query:** All server state (projects, tasks) is managed through React Query's `useQuery` and `useMutation`. This provides automatic caching, background refetching, deduplication, and fine-grained loading/error states without manual bookkeeping. Custom hooks (`useProjects`, `useTasks`) wrap the Query API so components stay declarative and free of fetch logic.
*   **Optimistic UI:** The `useTasks` hook applies optimistic updates via `onMutate` — local state is updated immediately before the server confirms, with automatic rollback on error. This creates a deeply responsive feel during drag-and-drop status changes.
*   **Task Navigation UX:** Clicking a task card on the project board opens the edit modal inline. The corner arrow icon navigates to the full task detail page, which also provides its own Edit Task button and modal. Task and project URLs use human-readable keys (e.g. `/tasks/GRN-1`, `/projects/GRN`) rather than UUIDs.
*   **Debounced Label Filter:** The label/tag filter input on the project board is debounced by 300 ms, so the API query only fires after the user stops typing rather than on every keystroke.
*   **UI Components:** Custom styled components via Tailwind classes rather than heavyweight libraries like MUI, giving superior performance and full design control while meeting responsiveness and empty-state requirements.
*   **Monorepo vs Standalone Structure:** The application sits under `frontend/` with a root `docker-compose.yml`, meeting the instructions to configure a standard repo structure.

## 3. Running Locally

Make sure you have Docker installed.

```bash
# Clone the repository (replace with the actual clone URL)
git clone https://github.com/your-name/taskflow
cd taskflow

# Verify or copy the .env file in the frontend folder
cp frontend/.env.example frontend/.env

# Spin up the environment using Docker Compose
docker compose up -d

# Open your browser and navigate to:
# http://localhost:3000
```

Alternatively, to run natively using Node:
```bash
cd frontend
npm install
npm run dev
```

## 4. Running Migrations
**Not Applicable (Frontend-Only role).**
Data mocking is provided through in-memory arrays populated via MSW in `frontend/src/mocks/db.ts`. The mock database resets to seed data on each hard reload.

## 5. Test Credentials
The test database resets with predefined seeds. To avoid registering a new user, use the following credentials:

```text
Email:    test@example.com
Password: password123
```

*(Note: Registration works flawlessly if you want to test that flow.)*

## 6. API Reference (Mocked via MSW)

The frontend intercepts these requests automatically using standard `axios` config. All endpoints requiring auth expect the JWT token `Authorization: Bearer <token>`.

### Auth
*   **`POST /auth/register`** → Registers a user (expects `name`, `email`, `password`)
*   **`POST /auth/login`** → Verifies credentials, returns `{ token, user }`

### Projects
*   **`GET /projects`** → Array of projects accessible to the current user
*   **`POST /projects`** → Creates a project (expects `name`, `code`, optional `description`)
*   **`GET /projects/:id`** → Project detail (accepts UUID or project code)
*   **`PATCH /projects/:id`** → Update project properties
*   **`DELETE /projects/:id`** → Cascade delete project and all its tasks

### Tasks
*   **`GET /projects/:id/tasks`** → Get tasks with optional `?status=`, `?assignee=`, and `?label=` filtering
*   **`POST /projects/:id/tasks`** → Create a task inside the project
*   **`GET /tasks/:id`** → Get a single task by UUID or task key (e.g. `GRN-1`)
*   **`PATCH /tasks/:id`** → Update task properties (optimistic UI applied on the frontend)
*   **`DELETE /tasks/:id`** → Delete a task

## 7. What I'd Do With More Time
*   **E2E Testing:** Playwright or Cypress workflows to guarantee user actions against the mock system match requirements. Left out intentionally to stay within reasonable time limits while still keeping strong internal typing (TypeScript) throughout.
*   **Sprint Planning:** A dedicated sprint board with configurable time-boxed sprints, backlog drag-in, capacity indicators, and a burndown chart — enabling proper agile workflow on top of the existing kanban columns.
*   **Role-Based Access Control:** Project-level roles (Owner, Member, Viewer) enforced both in the UI (hiding destructive actions) and at the API layer, so teams can safely collaborate without accidental data loss.
*   **Task History & Audit Log:** A chronological activity feed per task recording every field change, status transition, and comment — surfaced in the task detail sidebar so teams have full visibility into how work progressed.
*   **Epics & Hierarchy:** An Epic container that groups related tasks with its own progress rollup. A "holding area" / backlog column for tasks not yet assigned to a sprint or epic, keeping the active board clean.
*   **Clone Tasks & Blocking Links:** One-click task cloning to duplicate boilerplate tasks, plus blocking/blocked-by relationships between tasks rendered as dependency indicators on the board and in the detail view.
*   **GitHub Integration:** Linking a task to a pull request or branch via the GitHub API — showing PR status (open / merged / closed) directly on the task card and auto-transitioning task status when a PR merges.
*   **Websockets / Real-time:** If backed by a real server, implementing optimistic event streams using `socket.io` or SSE to push board updates to all clients viewing the same project would be the top priority.
*   **Pagination / Virtual Lists:** For projects with many tasks, windowed rendering (e.g. `react-virtual`) and cursor-based pagination on the tasks endpoint would be needed to keep the board performant at scale.