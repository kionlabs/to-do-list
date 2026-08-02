import React, { useState } from 'react';
import { Search, Bell, Calendar as CalendarIcon, Menu, X, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const currentDate = new Date();
  const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(
    currentDate.getMonth() + 1,
  ).padStart(2, '0')}/${currentDate.getFullYear()}`;
  const monthLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  const notifications = [
    { id: '1', text: "Meeting with client at 4 PM today", time: '10m ago', unread: true },
    { id: '2', text: "Nischal's birthday party reminder", time: '1h ago', unread: true },
    { id: '3', text: "Landing page design status updated to In Progress", time: '2h ago', unread: false },
  ];

  return (
    <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="flex items-center text-2xl sm:text-3xl font-extrabold tracking-tight">
          <span className="text-[#FF5252]">Dash</span>
          <span className="text-slate-900">board</span>
        </div>
      </div>

      {/* Middle: Search Input */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-6">
        <div className="relative flex items-center bg-[#F8FAFC] rounded-xl border border-slate-200/80 focus-within:border-[#FF5252] focus-within:ring-2 focus-within:ring-[#FF5252]/20 transition-all px-3 py-1.5 shadow-sm">
          <input
            type="text"
            placeholder="Search your task here..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none pr-2"
          />
          <button 
            type="button" 
            className="bg-[#FF5252] hover:bg-[#ff3b3b] text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
            aria-label="Search"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Right: Actions & Date */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowCalendar(false);
            }}
            className="relative p-2.5 bg-[#FF5252] hover:bg-[#ff3d3d] text-white rounded-xl shadow-sm transition-all transform active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 border-2 border-[#FF5252] rounded-full animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 text-[#FF5252] rounded-full">
                  2 New
                </span>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-colors ${
                      n.unread ? 'bg-red-50/60 border border-red-100/80' : 'bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#FF5252] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-slate-700 font-medium leading-tight">{n.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Calendar Icon Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowCalendar(!showCalendar);
              setShowNotifications(false);
            }}
            className="p-2.5 bg-[#FF5252] hover:bg-[#ff3d3d] text-white rounded-xl shadow-sm transition-all transform active:scale-95"
            aria-label="Calendar"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="text-center pb-2 border-b border-slate-100 mb-3">
                <h3 className="font-bold text-slate-800 text-sm">{monthLabel}</h3>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-700 font-medium">
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === currentDate.getDate();
                  return (
                    <div
                      key={day}
                      className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                        isToday
                          ? 'bg-[#FF5252] text-white font-bold shadow-sm'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Date Display */}
        <div className="hidden sm:flex flex-col text-right leading-tight pl-1">
          <span className="text-xs font-semibold text-slate-700">{weekday}</span>
          <span className="text-xs font-bold text-cyan-500">{formattedDate}</span>
        </div>
      </div>
    </header>
  );
};
