import { useState } from 'react';
import { Plus, FolderOpen, AlertCircle } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import type { Project } from '../types';

function Skeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-700/50 mb-2" />
      <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-700/50" />
    </div>
  );
}

export function ProjectsPage() {
  const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | undefined>();

  function openCreate() { setEditTarget(undefined); setShowModal(true); }
  function openEdit(p: Project) { setEditTarget(p); setShowModal(true); }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(id);
    } catch {
      alert('Failed to delete project.');
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {isLoading ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button id="create-project-btn" onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && projects.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
            <FolderOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No projects yet
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            Create your first project to get started.
          </p>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Create project
          </button>
        </div>
      )}

      {/* Projects grid */}
      {!isLoading && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProjectModal
          onClose={() => setShowModal(false)}
          onSubmit={editTarget
            ? (name, desc) => updateProject(editTarget.id, name, desc)
            : createProject
          }
          initial={editTarget}
        />
      )}
    </div>
  );
}
