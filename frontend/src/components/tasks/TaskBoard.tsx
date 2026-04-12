import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import type { Task, User, Status } from '../../types';

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'done', label: 'Done', color: 'bg-emerald-500' },
];

interface SortableCardProps {
  task: Task;
  members: User[];
  onOpen: (t: Task) => void;
}

function SortableCard({ task, members, onOpen }: SortableCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} members={members} onClick={() => onOpen(task)} />
    </div>
  );
}

interface Props {
  tasks: Task[];
  members: User[];
  onUpdateTask: (id: string, payload: Partial<Task>) => Promise<Task>;
  onCreateTask: (payload: Partial<Task>) => Promise<Task>;
  onDeleteTask: (id: string) => Promise<void>;
  projectId: string;
}

export function TaskBoard({
  tasks,
  members,
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
  projectId,
}: Props) {
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function openCreate(status: Status) {
    setEditTask(undefined);
    setDefaultStatus(status);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditTask(task);
    setModalOpen(true);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // `over.id` is either a task id or a column id
    const overColumn = COLUMNS.find((c) => c.id === over.id);
    const overTask = tasks.find((t) => t.id === over.id);
    const targetStatus = overColumn?.id ?? overTask?.status;
    const dragged = tasks.find((t) => t.id === active.id);

    if (dragged && targetStatus && dragged.status !== targetStatus) {
      await onUpdateTask(dragged.id, { status: targetStatus });
    }
  }

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                id={`column-${col.id}`}
                className="flex flex-col gap-3"
              >
                {/* Column header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color}`} />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {col.label}
                    </h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    id={`add-task-${col.id}`}
                    onClick={() => openCreate(col.id)}
                    className="btn-ghost p-1.5 text-slate-400 hover:text-brand-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Drop zone */}
                <div
                  className="flex flex-col gap-2 min-h-[120px] rounded-xl p-2 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700"
                  id={col.id}
                >
                  <SortableContext
                    items={colTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {colTasks.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-slate-300 dark:text-slate-600 select-none py-6">
                        No tasks
                      </div>
                    ) : (
                      colTasks.map((t) => (
                        <SortableCard key={t.id} task={t} members={members} onOpen={openEdit} />
                      ))
                    )}
                  </SortableContext>
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="shadow-2xl rotate-2 scale-105">
              <TaskCard task={activeTask} members={members} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {modalOpen && (
        <TaskModal
          task={editTask}
          members={members}
          onClose={() => setModalOpen(false)}
          onSave={
            editTask
              ? (payload) => onUpdateTask(editTask.id, payload)
              : (payload) => onCreateTask({ ...payload, status: defaultStatus, project_id: projectId })
          }
          onDelete={editTask ? onDeleteTask : undefined}
        />
      )}
    </>
  );
}
