import { format } from 'date-fns';
import { Calendar, User2, ArrowUpRight } from 'lucide-react';
import type { Task, User } from '../../types';

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

interface Props {
  task: Task;
  members: User[];
  onClick: () => void;
}

export function TaskCard({ task, members, onClick }: Props) {
  const assignee = members.find((m) => m.id === task.assignee_id);

  return (
    <button
      id={`task-card-${task.id}`}
      onClick={onClick}
      className="w-full text-left card p-3.5 flex flex-col gap-2 hover:-translate-y-0.5 active:scale-95 transition-transform cursor-pointer group"
    >
      {/* Title + open icon */}
      <div className="flex items-start gap-1.5">
        <span className="flex-1 text-sm font-medium text-slate-800 dark:text-white leading-snug">
          {task.title}
        </span>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 shrink-0 mt-0.5 transition-colors" />
      </div>

      {/* Description snippet */}
      {task.description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: priority + assignee + due date */}
      <div className="flex items-center gap-2 flex-wrap mt-1">
        <span className={`badge badge-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>

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
    </button>
  );
}
