import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Task } from '../types';
import { statusLabels } from '../utils/labels';

interface TaskCalendarProps {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onAddTask: (date: string) => void;
}

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value?: string) => {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

const getTaskCalendarDate = (task: Task) => {
  const dueDate = parseDateKey(task.dueDate);
  if (dueDate) return dueDate;

  const completedDate = task.completedAt?.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!completedDate) return null;

  return new Date(
    Number(completedDate[3]),
    Number(completedDate[2]) - 1,
    Number(completedDate[1]),
  );
};

const statusDotColor = {
  Completed: 'bg-emerald-500',
  'In Progress': 'bg-blue-500',
  'Not Started': 'bg-[#FF5252]',
};

export function TaskCalendar({ tasks, onOpenTask, onAddTask }: TaskCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(today));

  const tasksByDate = useMemo(() => {
    const entries = new Map<string, Task[]>();

    tasks.forEach((task) => {
      const calendarDate = getTaskCalendarDate(task);
      if (!calendarDate) return;

      const dateKey = toDateKey(calendarDate);
      const dateTasks = entries.get(dateKey) ?? [];
      dateTasks.push(task);
      entries.set(dateKey, dateTasks);
    });

    return entries;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const days: Array<Date | null> = [];

    for (let index = 0; index < firstDay.getDay(); index += 1) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }
    while (days.length % 7 !== 0) days.push(null);

    return days;
  }, [currentMonth]);

  const selectedTasks = tasksByDate.get(selectedDate) ?? [];
  const selectedDateLabel = useMemo(() => {
    const date = parseDateKey(selectedDate);
    if (!date) return selectedDate;

    return new Intl.DateTimeFormat('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  }, [selectedDate]);

  const moveMonth = (offset: number) => {
    setCurrentMonth(
      (month) => new Date(month.getFullYear(), month.getMonth() + offset, 1),
    );
  };

  return (
    <section className="mt-6 rounded-2xl border border-slate-200/90 bg-[#F8FAFC]/90 p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[#FF5252]" />
          <h2 className="text-base font-bold text-[#FF5252]">일정 달력</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#FF5252] hover:text-[#FF5252]"
            aria-label="이전 달"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-28 text-center text-sm font-bold text-slate-800">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </p>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#FF5252] hover:text-[#FF5252]"
            aria-label="다음 달"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 sm:gap-2 sm:text-xs">
        {weekDays.map((day, index) => (
          <span key={day} className={index === 0 ? 'text-[#FF5252]' : index === 6 ? 'text-blue-500' : ''}>
            {day}
          </span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="min-h-16 sm:min-h-20" />;

          const dateKey = toDateKey(date);
          const dateTasks = tasksByDate.get(dateKey) ?? [];
          const isToday = dateKey === toDateKey(today);
          const isSelected = dateKey === selectedDate;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateKey)}
              className={`min-h-16 rounded-lg border p-1 text-left transition sm:min-h-20 sm:p-2 ${
                isSelected
                  ? 'border-[#FF5252] bg-red-50 shadow-sm'
                  : 'border-transparent bg-white hover:border-red-200 hover:bg-red-50/40'
              }`}
              aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일, 작업 ${dateTasks.length}개`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isToday
                    ? 'bg-[#FF5252] text-white'
                    : date.getDay() === 0
                      ? 'text-[#FF5252]'
                      : date.getDay() === 6
                        ? 'text-blue-500'
                        : 'text-slate-700'
                }`}
              >
                {date.getDate()}
              </span>
              {dateTasks.length > 0 && (
                <div className="mt-1">
                  <div className="flex gap-1">
                    {dateTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={`h-1.5 w-1.5 rounded-full ${statusDotColor[task.status]}`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 hidden truncate text-[10px] font-semibold text-slate-500 sm:block">
                    {dateTasks[0].title}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 border-t border-slate-200/70 pt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-slate-800">{selectedDateLabel} 일정</p>
            <p className="mt-0.5 text-xs text-slate-400">선택한 날짜의 작업 {selectedTasks.length}개</p>
          </div>
          <button
            type="button"
            onClick={() => onAddTask(selectedDate)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF5252] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#ff3b3b]"
          >
            <Plus className="h-3.5 w-3.5" />
            이 날에 추가
          </button>
        </div>

        {selectedTasks.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {selectedTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onOpenTask(task)}
                className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-[#FF5252] hover:shadow-sm"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${statusDotColor[task.status]}`} />
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-700">{task.title}</span>
                <span className="shrink-0 text-[10px] font-semibold text-slate-400">{statusLabels[task.status]}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-400">
            등록된 일정이 없습니다. 이 날에 첫 작업을 추가해보세요.
          </div>
        )}
      </div>
    </section>
  );
}
