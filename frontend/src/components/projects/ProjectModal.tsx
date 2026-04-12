import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import type { Project } from '../../types';

const schema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSubmit: (name: string, description?: string) => Promise<Project>;
  initial?: Project;
}

export function ProjectModal({ onClose, onSubmit, initial }: Props) {
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: initial?.name ?? '', description: initial?.description ?? '' },
  });

  async function handleSave(data: FormData) {
    setServerError('');
    try {
      await onSubmit(data.name, data.description);
      onClose();
    } catch {
      setServerError('Failed to save project. Please try again.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md card p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {initial ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            id="close-project-modal"
            onClick={onClose}
            className="btn-ghost p-1.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {serverError && (
          <p className="text-sm text-red-500 mb-4 p-2 rounded bg-red-50 dark:bg-red-900/20">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="label">Project name *</label>
            <input
              id="project-name"
              className={`input ${errors.name ? 'border-red-400' : ''}`}
              placeholder="e.g. Website Redesign"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="project-description" className="label">Description</label>
            <textarea
              id="project-description"
              className="input resize-none"
              rows={3}
              placeholder="What's this project about?"
              {...register('description')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              id="save-project-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : initial ? (
                'Save changes'
              ) : (
                'Create project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
