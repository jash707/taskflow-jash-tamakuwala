import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Calendar, User2, ArrowUpRight, ArrowUpCircle, ArrowRightCircle, ArrowDownCircle } from 'lucide-react';
import type { Task, User } from '../../types';

const PRIORITY_ICON = {
  high: <ArrowUpCircle className="w-3.5 h-3.5 text-red-500" />,
  medium: <ArrowRightCircle className="w-3.5 h-3.5 text-amber-500" />,
  low: <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-500" />
};

interface Props {
  task: Task;
  members: User[];
  onClick: () => void;
}

export function TaskCard({ task, members, onClick }: Props) {
  const assignee = members.find((m) => m.id === task.assignee_id);

  return (
    <div
      id={`task-card-${task.id}`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      role="button"
      tabIndex={0}
      className="w-full text-left card p-3.5 flex flex-col gap-2 hover:-translate-y-0.5 active:scale-95 transition-transform cursor-pointer group"
    >
      {/* Title + open icon */}
      <div className="flex items-start gap-1.5">
        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
          {task.task_key}
        </span>
        <span className="flex-1 text-sm font-medium text-slate-800 dark:text-white leading-snug">
          {task.title}
        </span>
        <Link 
          to={`/tasks/${task.task_key}`} 
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 mt-0.5"
        >
          <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400 transition-colors" />
        </Link>
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5 mb-1">
          {task.labels.map((lbl) => (
            <span key={lbl} className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
              {lbl}
            </span>
          ))}
        </div>
      )}

      {/* Description snippet */}
      {task.description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: priority + assignee + due date */}
      <div className="flex items-center gap-2 flex-wrap mt-1">
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
          {PRIORITY_ICON[task.priority]}
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 uppercase leading-none tracking-wider">{task.priority}</span>
        </div>

        {assignee && (
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <User2 className="w-3 h-3" />
            {assignee.name.split(' ')[0]}
          </span>
        )}

        {task.due_date && (
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 ml-auto">
            <Calendar className="w-3 h-3" />
            {format(new Date(task.due_date), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
}
