import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FolderOpen, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Project } from '../../types';

interface Props {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="card p-5 flex flex-col gap-3 group hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <Link
            to={`/projects/${project.id}`}
            className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 truncate transition-colors"
          >
            {project.name}
          </Link>
        </div>

        {/* Kebab menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            id={`project-menu-${project.id}`}
            onClick={() => setMenuOpen((o) => !o)}
            className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 card shadow-lg py-1 z-20">
              <button
                id={`edit-project-${project.id}`}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={() => { setMenuOpen(false); onEdit(project); }}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                id={`delete-project-${project.id}`}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={() => { setMenuOpen(false); onDelete(project.id); }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {project.description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500">
        Created {format(new Date(project.created_at), 'MMM d, yyyy')}
      </div>
    </div>
  );
}
