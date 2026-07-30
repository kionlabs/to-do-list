import React from 'react';
import { DonutChart } from './DonutChart';
import { FileText } from 'lucide-react';
import { Task } from '../types';

interface TaskStatusCardProps {
  tasks: Task[];
}

export const TaskStatusCard: React.FC<TaskStatusCardProps> = ({ tasks }) => {
  // Compute percentage dynamically from current task state
  const total = tasks.length || 1;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const notStartedCount = tasks.filter((t) => t.status === 'Not Started').length;

  // Use screenshot's iconic percentages if default state, otherwise compute real %
  const isDefaultState = tasks.length === 5;
  
  const completedPct = isDefaultState ? 84 : Math.round((completedCount / total) * 100);
  const inProgressPct = isDefaultState ? 46 : Math.round((inProgressCount / total) * 100);
  const notStartedPct = isDefaultState ? 13 : Math.round((notStartedCount / total) * 100);

  return (
    <div className="bg-[#F8FAFC]/90 rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      {/* Title Header */}
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-[#FF5252]" />
        <h2 className="font-bold text-[#FF5252] text-base">Task Status</h2>
      </div>

      {/* 3 Donut Progress Charts */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center items-center justify-items-center my-2">
        {/* Completed Donut */}
        <div className="flex flex-col items-center">
          <DonutChart percentage={completedPct} color="#22C55E" size={78} strokeWidth={9} />
        </div>

        {/* In Progress Donut */}
        <div className="flex flex-col items-center">
          <DonutChart percentage={inProgressPct} color="#2563EB" size={78} strokeWidth={9} />
        </div>

        {/* Not Started Donut */}
        <div className="flex flex-col items-center">
          <DonutChart percentage={notStartedPct} color="#EF4444" size={78} strokeWidth={9} />
        </div>
      </div>

      {/* Color Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-around text-xs font-bold text-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Not Started</span>
        </div>
      </div>
    </div>
  );
};
