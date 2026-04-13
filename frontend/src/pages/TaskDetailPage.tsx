import type { ReactNode } from 'react';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User2, AlertCircle, Clock, CheckCircle2, ArrowRightCircle, ArrowUpCircle, ArrowDownCircle, Pencil } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { users } from '../mocks/db';
import { TaskModal } from '../components/tasks/TaskModal';
import type { Task, Project, Priority } from '../types';

const PRIORITY_ICON: Record<Priority, ReactNode> = {
  high: <ArrowUpCircle className="w-4 h-4 text-red-500" />,
  medium: <ArrowRightCircle className="w-4 h-4 text-amber-500" />,
  low: <ArrowDownCircle className="w-4 h-4 text-emerald-500" />
};

const STATUS_LABEL: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const STATUS_COLOR: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  done: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
};

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: task, isLoading: isTaskLoading, error: taskError } = useQuery<Task>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data } = await api.get<Task>(`/tasks/${taskId}`);
      return data;
    },
    enabled: !!taskId,
  });

  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: ['project', task?.project_id],
    queryFn: async () => {
      const { data } = await api.get<Project>(`/projects/${task?.project_id}`);
      return data;
    },
    enabled: !!task?.project_id,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<Task>) => {
      const { data } = await api.patch<Task>(`/tasks/${task!.id}`, payload);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['task', taskId], updated);
      queryClient.invalidateQueries({ queryKey: ['tasks', task!.project_id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', task!.project_id] });
    },
  });

  const isLoading = isTaskLoading || isProjectLoading;
  const error = taskError ? 'Failed to load task details.' : null;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
        <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-700 mb-8" />
        <div className="h-10 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-32 w-full rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 max-w-4xl mx-auto">
        <AlertCircle className="w-5 h-5 shrink-0" />
        {error || 'Task not found'}
      </div>
    );
  }

  const assignee = users.find((u) => u.id === task.assignee_id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Breadcrumb + back */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${project?.code ?? task.project_id}`} className="btn-ghost p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-sm text-brand-600 dark:text-brand-400 font-semibold mb-0.5">
              {project?.code || 'PROJECT'} / <span className="text-slate-500 dark:text-slate-400">{task.task_key}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditModalOpen(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <Pencil className="w-4 h-4" />
          Edit Task
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              {task.title}
            </h1>

            {task.labels && task.labels.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {task.labels.map((lbl) => (
                  <span key={lbl} className="px-2.5 py-1 rounded-md text-xs uppercase tracking-wider font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                    {lbl}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Description</h3>
              {task.description ? (
                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {task.description}
                </p>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic">No description provided.</p>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full md:w-72 shrink-0 space-y-6">
            {/* Status & Priority Cards */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-5">
              
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Status</h4>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium ${STATUS_COLOR[task.status]}`}>
                  {task.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  {STATUS_LABEL[task.status]}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Priority</h4>
                <div className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                  {PRIORITY_ICON[task.priority]}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{task.priority}</span>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Assignee</h4>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                    {assignee ? assignee.name.charAt(0).toUpperCase() : <User2 className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {assignee ? assignee.name : 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Due Date */}
              {task.due_date && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Due Date</h4>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(task.due_date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {editModalOpen && (
        <TaskModal
          task={task}
          members={users}
          onClose={() => setEditModalOpen(false)}
          onSave={(payload) => updateMutation.mutateAsync(payload)}
          onDelete={async (id) => {
            await deleteMutation.mutateAsync(id);
            window.history.back();
          }}
        />
      )}
    </div>
  );
}
