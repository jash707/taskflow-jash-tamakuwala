# TaskFlow - Frontend Engineer Take-Home Assignment

## 1. Overview
TaskFlow is a minimal, polished task management application built as a submission for the Greening India Mid-level Frontend Engineer role. The app features authentication, project management, and task boards with rich interaction, including optimistic updates and drag-and-drop support.

Since this submission is for the Frontend-only role, no backend was built. Instead, the application runs entirely against a locally mocked API using Mock Service Worker (MSW), matching the provided spec in Appendix A.

**Tech Stack:**
*   **Framework:** React 18 with TypeScript (via Vite)
*   **Routing:** React Router v6
*   **Styling:** Tailwind CSS (v3) with CSS variables for dynamic themes
*   **Mock API Framework:** MSW v2 (Mock Service Worker)
*   **State Management:** React Context + Hooks (No Redux/Zustand required for this scope)
*   **Forms & Validation:** React Hook Form + Zod
*   **Drag & Drop:** @dnd-kit
*   **HTTP Client:** Axios (configured with an interceptor for JWT injection)

## 2. Architecture Decisions
*   **Mocking Approach (MSW):** I selected MSW over `json-server` because MSW intercepts requests at the network level using a Service Worker. This allows the application code (`axios.ts`, components, etc.) to remain completely unaware that it's talking to a mock, meaning the transition from the mock to a real backend would require exactly zero code changes—just changing the `VITE_API_BASE_URL`.
*   **Opting out of heavy State Libraries:** The data layer revolves around focused custom hooks (`useProjects`, `useTasks`, `useAuth`) that handle fetching, caching, returning `isLoading`/`error` states, and managing mutations. For an app of this size, `react-query` or `redux` would be over-engineering.
*   **UI Components:** Rather than pulling in the entirety of heavy component libraries (like MUI which creates very bloated DOMs), I built custom styled components directly via Tailwind classes. They offer superior performance and absolute control over the design, ensuring perfect adherence to the responsiveness and empty state requirements while saving time.
*   **Optimistic UI Defaults:** The `useTasks` hook optimistic update pushes local changes directly to the UI prior to receiving server confirmation. This creates a deeply responsive feel, especially during drag-and-drop operations, while guarding against sync errors via catch blocks that revert to the original state.
*   **Monorepo vs Standalone Structure:** The application sits under `frontend/` with a root `docker-compose.yml`, meeting the instructions to configure standard repo structure.

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

# Check if the frontend is up and reachable
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
Data mocking has been established through in-memory arrays populated via MSW in `frontend/src/mocks/db.ts`. The mock database naturally resets across hard reboots of the application/service worker.

## 5. Test Credentials
The test database resets with predefined seeds. To avoid having to register a new user, you can use the following default credentials to securely log in immediately:

```text
Email:    test@example.com
Password: password123
```

*(Note: Registration works flawlessly if you want to test that flow).*

## 6. API Reference (Mocked via MSW)

The frontend intercepts these requests automatically using standard `axios` config. Below are the implemented APIs. Note that endpoints requiring auth expect the JWT token `Authorization: Bearer <token>`.

### Auth
*   **`POST /auth/register`** -> Registers a user (Expects `name`, `email`, `password`)
*   **`POST /auth/login`** -> Verifies existing users, returns `{ token, user }`

### Projects
*   **`GET /projects`** -> Array of projects for current user.
*   **`POST /projects`** -> Creates project (`name`, optional `description`).
*   **`GET /projects/:id`** -> Detailed view (project + its tasks nested).
*   **`PATCH /projects/:id`** -> Update project properties.
*   **`DELETE /projects/:id`** -> Cascade delete project and tasks.

### Tasks
*   **`GET /projects/:id/tasks`** -> Get tasks with `?status=` and `?assignee=` filtering support.
*   **`POST /projects/:id/tasks`** -> Creates task inside the project.
*   **`PATCH /tasks/:id`** -> Update task properties (optimistic UI is utilized on the frontend).
*   **`DELETE /tasks/:id`** -> Deletes task.

## 7. What I'd Do With More Time
*   **E2E Testing:** With more time, I would write Playwright or Cypress workflows tests to guarantee user actions inside the mock system match requirements. I intentionally left this out to finish within reasonable time limits while still maintaining exceptional internal typing (TypeScript) instead.
*   **Websockets/Real-time:** The assignment mentions this in the backend bonus. If we had a real backend, implementing optimistic event streams using `socket.io` or vanilla SSE to seamlessly update clients viewing the same project board would be top priority.
*   **Local Caching (React-Query/SWR):** My custom hooks handle data loading well, but using a well-supported library would reduce the amount of boilerplate needed for deduplication, focus-revalidation, and caching cross-component data without passing props or elevating state locally.
*   **Accessibility (a11y):** Further refinement with precise ARIA labels and strict keyboard navigation controls (especially around deeper modals and the Drag & Drop area) would drastically improve the accessible experience, making it robust for more stringent real-world environments.
