import React, { ChangeEvent, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400';

const priorityOptions: { label: string; value: TaskPriority; color: string }[] = [
  { label: 'Extreme', value: 'Vital', color: 'bg-red-500' },
  { label: 'Moderate', value: 'Moderate', color: 'bg-sky-400' },
  { label: 'Low', value: 'Low', color: 'bg-emerald-500' },
];

const formatDate = (date: Date) => {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}/${date.getFullYear()}`;
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Vital');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [status] = useState<TaskStatus>('Not Started');
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setPriority('Vital');
    setDescription('');
    setCategory('Personal');
    setImageUrl('');
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !dueDate) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      category,
      createdAt: formatDate(new Date()),
      dueDate,
      imageUrl: imageUrl || DEFAULT_IMAGE,
      isVital: priority === 'Vital',
    });

    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-4xl rounded-md bg-white p-6 shadow-2xl sm:p-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add New Task</h2>
            <div className="mt-1 h-0.5 w-20 bg-[#FF5252]" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-slate-900 underline underline-offset-2 hover:text-[#FF5252]"
          >
            Go Back
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="border border-slate-300 p-4">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-[1fr_240px]">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="h-10 w-full rounded border border-slate-400 px-3 text-sm outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="h-10 w-full rounded border border-slate-400 px-3 text-sm outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                  />
                </div>

                <div>
                  <span className="mb-2 block text-sm font-bold text-slate-900">Priority</span>
                  <div className="flex flex-wrap items-center gap-8">
                    {priorityOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 text-xs font-medium text-slate-500"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${option.color}`} />
                        {option.label}
                        <input
                          type="radio"
                          name="priority"
                          value={option.value}
                          checked={priority === option.value}
                          onChange={() => setPriority(option.value)}
                          className="h-3.5 w-3.5 accent-[#FF5252]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px]">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-900">
                      Task Description
                    </label>
                    <textarea
                      rows={7}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Start writing here....."
                      className="w-full resize-none rounded border border-slate-400 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-900">
                      Upload Image
                    </label>
                    <label className="flex h-[188px] cursor-pointer flex-col items-center justify-center rounded border border-slate-400 bg-white px-4 text-center transition hover:border-[#FF5252] hover:bg-red-50/40">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Selected task"
                          className="h-full w-full rounded object-cover"
                        />
                      ) : (
                        <>
                          <ImagePlus className="mb-4 h-14 w-14 text-slate-400" />
                          <span className="text-xs text-slate-400">Drag&Drop files here</span>
                          <span className="my-2 text-xs text-slate-400">or</span>
                          <span className="rounded border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-500">
                            Browse
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">Category</label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-10 w-full rounded border border-slate-400 px-3 text-sm outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20 sm:w-64"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Development">Development</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 rounded-md bg-[#ff4b2b] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#FF5252] focus:outline-none focus:ring-2 focus:ring-[#FF5252]/30"
          >
            Done
          </button>
        </form>
      </div>
    </div>
  );
};
