import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { MoreHorizontal, Trash2, Edit3, CheckCircle2, Circle, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onDeleteTask,
  onEditTask,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Status icon styling
  const getStatusIcon = () => {
    switch (task.status) {
      case 'Completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 stroke-[2.5]" />;
      case 'In Progress':
        return <Circle className="w-5 h-5 text-blue-500 stroke-[2.5]" />;
      case 'Not Started':
      default:
        return <Circle className="w-5 h-5 text-red-500 stroke-[2.5]" />;
    }
  };

  const getStatusBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'text-emerald-600 font-semibold';
      case 'In Progress':
        return 'text-blue-600 font-semibold';
      case 'Not Started':
      default:
        return 'text-red-500 font-semibold';
    }
  };

  const toggleNextStatus = () => {
    if (task.status === 'Not Started') {
      onStatusChange(task.id, 'In Progress');
    } else if (task.status === 'In Progress') {
      onStatusChange(task.id, 'Completed');
    } else {
      onStatusChange(task.id, 'Not Started');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition-all duration-200 relative group flex flex-col justify-between">
      {/* Top Header Row with Status Circle, Title & Options */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={toggleNextStatus}
            className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
            title={`Current status: ${task.status}. Click to change.`}
          >
            {getStatusIcon()}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
              {task.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          </div>
        </div>

        {/* Thumbnail Image if present */}
        {task.imageUrl && (
          <img
            src={task.imageUrl}
            alt={task.title}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-100 shadow-sm"
          />
        )}

        {/* 3-Dots Menu Button */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Task options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div 
              className="absolute right-0 top-7 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 text-xs font-medium"
              onMouseLeave={() => setShowMenu(false)}
            >
              {onEditTask && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEditTask(task);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Task
                </button>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  toggleNextStatus();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
              >
                <Clock className="w-3.5 h-3.5" />
                Change Status
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteTask(task.id);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Metadata Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-3 flex-wrap">
          <span>
            Priority: <strong className="text-slate-700">{task.priority}</strong>
          </span>
          <span>
            Status: <span className={getStatusBadgeColor(task.status)}>{task.status}</span>
          </span>
        </div>
        <div>
          {task.status === 'Completed' && task.completedAt ? (
            <span className="text-slate-400">{task.completedAt}</span>
          ) : (
            <span>Created on: <strong className="text-slate-600">{task.createdAt}</strong></span>
          )}
        </div>
      </div>
    </div>
  );
};
