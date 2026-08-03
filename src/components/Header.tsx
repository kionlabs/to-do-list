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
  const weekday = currentDate.toLocaleDateString('ko-KR', { weekday: 'long' });
  const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(
    currentDate.getMonth() + 1,
  ).padStart(2, '0')}/${currentDate.getFullYear()}`;
  const monthLabel = currentDate.toLocaleDateString('ko-KR', {
    month: 'long',
    year: 'numeric',
  });
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  const notifications = [
    { id: '1', text: '오늘 오후 4시에 클라이언트 미팅이 있습니다', time: '10분 전', unread: true },
    { id: '2', text: '생일 파티 일정 알림', time: '1시간 전', unread: true },
    { id: '3', text: '랜딩 페이지 디자인 상태가 진행 중으로 변경되었습니다', time: '2시간 전', unread: false },
  ];

  return (
    <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="메뉴 열기"
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
          placeholder="할 일을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none pr-2"
          />
          <button 
            type="button" 
            className="bg-[#FF5252] hover:bg-[#ff3b3b] text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
            aria-label="검색"
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
            aria-label="알림"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 border-2 border-[#FF5252] rounded-full animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <h3 className="font-bold text-slate-800 text-sm">알림</h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 text-[#FF5252] rounded-full">
                  새 알림 2개
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
            aria-label="달력"
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
                <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
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
