import React from 'react';
import { AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskDetailViewProps {
  task: Task;
  onBack: () => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const getStatusColor = (status: TaskStatus) => {
  if (status === 'Completed') return 'text-emerald-600';
  if (status === 'In Progress') return 'text-blue-600';
  return 'text-red-500';
};

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({
  task,
  onBack,
  onDeleteTask,
  onStatusChange,
}) => {
  const descriptionLines = task.description
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="rounded-3xl border border-slate-300 bg-[#F8FAFC] p-5 shadow-sm lg:p-8">
      <div className="mb-10 flex items-start gap-6">
        {task.imageUrl && (
          <img
            src={task.imageUrl}
            alt={task.title}
            className="h-44 w-44 rounded-xl object-cover shadow-sm"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">{task.title}</h2>
              <p className="mt-4 text-sm text-slate-700">
                Priority:{' '}
                <span className="font-semibold text-sky-500">{task.priority}</span>
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Status:{' '}
                <span className={`font-semibold ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </p>
              <p className="mt-3 text-xs text-slate-400">
                {task.dueDate ? `Due on: ${task.dueDate}` : `Created on: ${task.createdAt}`}
              </p>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="shrink-0 text-sm font-bold text-slate-900 underline underline-offset-2 hover:text-[#FF5252]"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[360px] space-y-6 text-base leading-8 text-slate-500">
        {descriptionLines.length > 0 ? (
          descriptionLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)
        ) : (
          <p>No task description has been added yet.</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => onDeleteTask(task.id)}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FF5252] text-white shadow-sm transition hover:bg-[#ff3b3b]"
          aria-label="Delete task"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FF5252] text-white shadow-sm transition hover:bg-[#ff3b3b]"
          aria-label="Edit task"
        >
          <Edit3 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() =>
            onStatusChange(task.id, task.status === 'Completed' ? 'Not Started' : 'Completed')
          }
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FF5252] text-white shadow-sm transition hover:bg-[#ff3b3b]"
          aria-label="Toggle completion"
        >
          <AlertCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
