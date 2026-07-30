import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { X, Plus, Image as ImageIcon } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

const PRESET_IMAGES = [
  { label: 'Party / Event', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400' },
  { label: 'Laptop Design', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400' },
  { label: 'Meeting', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400' },
  { label: 'Dog / Pet', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400' },
  { label: 'Office Team', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400' },
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Moderate');
  const [status, setStatus] = useState<TaskStatus>('Not Started');
  const [category, setCategory] = useState('Personal');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(
      today.getMonth() + 1
    ).padStart(2, '0')}/${today.getFullYear()}`;

    onAddTask({
      title,
      description,
      priority,
      status,
      category,
      createdAt: formattedDate,
      completedAt: status === 'Completed' ? 'Completed just now' : undefined,
      imageUrl,
      isVital: priority === 'Vital',
    });

    // Reset
    setTitle('');
    setDescription('');
    setPriority('Moderate');
    setStatus('Not Started');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#FF5252] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Plus className="w-5 h-5" />
            <span>Add New Task</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design Landing Page wireframe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide clear task details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5252]"
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Vital">Vital ⭐</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5252]"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5252]"
            >
              <option value="Personal">Personal</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Development">Development</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#FF5252]" />
              Choose Thumbnail Image
            </label>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {PRESET_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(img.url)}
                  className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all ${
                    imageUrl === img.url ? 'border-[#FF5252] ring-2 ring-[#FF5252]/30 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-white font-bold text-sm shadow-md transition-all transform active:scale-95"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
