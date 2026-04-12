import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Trash2 } from 'lucide-react';
import type { Task, User, Status, Priority } from '../../types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  task?: Task;
  members: User[];
  onClose: () => void;
  onSave: (payload: Partial<Task>) => Promise<Task | void>;
  onDelete?: (id: string) => Promise<void>;
}

export function TaskModal({ task, members, onClose, onSave, onDelete }: Props) {
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: (task?.status ?? 'todo') as Status,
      priority: (task?.priority ?? 'medium') as Priority,
      assignee_id: task?.assignee_id ?? '',
      due_date: task?.due_date ?? '',
    },
  });

  async function handleSave(data: FormData) {
    setServerError('');
    try {
      const payload: Partial<Task> = {
        ...data,
        assignee_id: data.assignee_id || undefined,
        due_date: data.due_date || undefined,
      };
      await onSave(payload);
      onClose();
    } catch {
      setServerError('Failed to save task. Please try again.');
    }
  }

  async function handleDelete() {
    if (!task || !onDelete) return;
    if (!confirm('Delete this task?')) return;
    try {
      await onDelete(task.id);
      onClose();
    } catch {
      setServerError('Failed to delete task.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button id="close-task-modal" onClick={onClose} className="btn-ghost p-1.5 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {serverError && (
          <p className="text-sm text-red-500 mb-4 p-2 rounded bg-red-50 dark:bg-red-900/20">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="label">Title *</label>
            <input
              id="task-title"
              className={`input ${errors.title ? 'border-red-400' : ''}`}
              placeholder="What needs to be done?"
              {...register('title')}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="label">Description</label>
            <textarea
              id="task-description"
              className="input resize-none"
              rows={3}
              placeholder="Additional details…"
              {...register('description')}
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-status" className="label">Status</label>
              <select id="task-status" className="input" {...register('status')}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-priority" className="label">Priority</label>
              <select id="task-priority" className="input" {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label htmlFor="task-assignee" className="label">Assignee</label>
            <select id="task-assignee" className="input" {...register('assignee_id')}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label htmlFor="task-due-date" className="label">Due date</label>
            <input
              id="task-due-date"
              type="date"
              className="input"
              {...register('due_date')}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {task && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="btn-ghost text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                id="save-task-btn"
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : task ? 'Save changes' : 'Create task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
