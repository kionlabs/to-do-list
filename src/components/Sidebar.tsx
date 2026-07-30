import React from 'react';
import { NavTab } from '../types';
import { 
  LayoutGrid, 
  AlertCircle, 
  CheckSquare, 
  ListFilter, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userEmail?: string;
  userName?: string;
  avatarUrl?: string;
  onLogout?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userEmail = 'sundargurung360@gmail.com',
  userName = 'Sundar Gurung',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  onLogout,
  className = '',
}) => {
  const navItems: { tab: NavTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'Dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
    { tab: 'Vital Task', label: 'Vital Task', icon: <AlertCircle className="w-5 h-5" /> },
    { tab: 'My Task', label: 'My Task', icon: <CheckSquare className="w-5 h-5" /> },
    { tab: 'Task Categories', label: 'Task Categories', icon: <ListFilter className="w-5 h-5" /> },
    { tab: 'Settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { tab: 'Help', label: 'Help', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  return (
    <aside 
      className={`w-64 bg-gradient-to-b from-[#FF5E5E] to-[#FF4D4D] text-white flex flex-col justify-between shrink-0 shadow-lg rounded-r-3xl my-3 ml-3 p-5 min-h-[calc(100vh-2rem)] ${className}`}
    >
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center pt-2 pb-4 border-b border-white/20">
          <div className="relative group cursor-pointer mb-3">
            <img
              src={avatarUrl}
              alt={userName}
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md ring-4 ring-white/20 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">{userName}</h2>
          <p className="text-xs text-white/80 font-normal truncate max-w-[200px]">{userEmail}</p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#FF5252] shadow-md transform translate-x-1'
                    : 'text-white/90 hover:bg-white/15 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-[#FF5252]' : 'text-white'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout Button */}
      <div className="pt-6 border-t border-white/20">
        <button
          onClick={onLogout || (() => alert('Logged out successfully'))}
          className="w-full flex items-center gap-3.5 px-4 py-3 text-white/90 hover:text-white hover:bg-white/15 rounded-2xl text-sm font-semibold transition-colors"
        >
          <LogOut className="w-5 h-5 text-white" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
