import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Filter } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { users } from '../mocks/db';
import type { Status } from '../types';

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-64 rounded bg-slate-100 dark:bg-slate-700/50" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            {[0, 1].map((j) => (
              <div key={j} className="card p-4 h-20" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const { tasks, isLoading, error, createTask, updateTask, deleteTask } = useTasks(id!, {
    status: statusFilter as Status | undefined,
    assignee: assigneeFilter || undefined,
  });

  if (isLoading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
        <AlertCircle className="w-5 h-5 shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + back */}
      <div className="flex items-center gap-3">
        <Link to="/projects" className="btn-ghost p-2 text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Projects</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Project Board</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Filter className="w-4 h-4" />
          Filters:
        </div>

        <select
          id="filter-status"
          className="input w-auto text-sm py-1.5"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Status | '')}
        >
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          id="filter-assignee"
          className="input w-auto text-sm py-1.5"
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
        >
          <option value="">All assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {(statusFilter || assigneeFilter) && (
          <button
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            onClick={() => { setStatusFilter(''); setAssigneeFilter(''); }}
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Board */}
      <TaskBoard
        tasks={tasks}
        members={users}
        projectId={id!}
        onCreateTask={createTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}
