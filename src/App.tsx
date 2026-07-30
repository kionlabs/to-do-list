import { useState, useMemo } from 'react';
import { initialTasks, initialTeamMembers } from './data/initialData';
import { Task, NavTab, TeamMember, TaskStatus } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskCard } from './components/TaskCard';
import { TaskStatusCard } from './components/TaskStatusCard';
import { AddTaskModal } from './components/AddTaskModal';
import { InviteModal } from './components/InviteModal';
import { 
  FileText, 
  CheckSquare, 
  Plus, 
  UserPlus, 
  AlertCircle, 
  FolderKanban, 
  Settings as SettingsIcon, 
  HelpCircle,
  Search
} from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [activeTab, setActiveTab] = useState<NavTab>('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Modals
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  // Separate tasks into To-Do (Not Started / In Progress) and Completed for the main view
  const toDoTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.status !== 'Completed');
  }, [filteredTasks]);

  const completedTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.status === 'Completed');
  }, [filteredTasks]);

  // Handlers
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'Completed' ? 'Completed just now' : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleInviteMember = (email: string) => {
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: email.split('@')[0],
      email,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&q=80&w=150`,
    };
    setTeamMembers((prev) => [...prev, newMember]);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 font-sans flex flex-col selection:bg-[#FF5252] selection:text-white">
      {/* Top Navigation Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          className="hidden lg:flex"
        />

        {/* Mobile Slide-over Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              className="relative z-50 my-0 ml-0 rounded-r-2xl"
            />
          </div>
        )}

        {/* Right Main Dashboard Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {/* Greeting Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, Sundar
              </h1>
              <span className="text-3xl animate-bounce">👋</span>
            </div>

            {/* Team Avatars & Invite Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center -space-x-2 overflow-hidden">
                {teamMembers.slice(0, 4).map((member) => (
                  <img
                    key={member.id}
                    src={member.avatar}
                    alt={member.name}
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-sm hover:scale-110 transition-transform"
                    title={member.name}
                  />
                ))}
                {teamMembers.length > 4 && (
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white ring-2 ring-white shadow-sm">
                    +{teamMembers.length - 4}
                  </div>
                )}
              </div>

              {/* Invite Button */}
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-[#FF5252] text-[#FF5252] hover:bg-[#FF5252] hover:text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm transform active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Invite</span>
              </button>
            </div>
          </div>

          {/* TAB 1: MAIN DASHBOARD VIEW (Screenshot Replica) */}
          {activeTab === 'Dashboard' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: TO-DO TASKS (Span 7) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  {/* To-Do Header & Add Task Button */}
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#FF5252]" />
                      <h2 className="font-bold text-[#FF5252] text-base sm:text-lg">To-Do</h2>
                    </div>

                    <button
                      onClick={() => setIsAddTaskModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FF5252] hover:text-[#ff3b3b] hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add task</span>
                    </button>
                  </div>

                  {/* Sub-date label */}
                  <div className="text-xs font-semibold text-slate-400 border-b border-slate-100 pb-2">
                    20 June <span className="text-slate-300">•</span> Today
                  </div>

                  {/* To-Do Tasks List */}
                  <div className="space-y-4 pt-1">
                    {toDoTasks.length > 0 ? (
                      toDoTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={handleStatusChange}
                          onDeleteTask={handleDeleteTask}
                          onEditTask={() => setIsAddTaskModalOpen(true)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-500">No active tasks in To-Do</p>
                        <p className="text-xs text-slate-400 mt-1">Click "+ Add task" to create a new task.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: TASK STATUS & COMPLETED TASKS (Span 5) */}
                <div className="lg:col-span-5 flex flex-col space-y-6">
                  {/* Task Status Progress Card */}
                  <TaskStatusCard tasks={tasks} />

                  {/* Completed Task Card */}
                  <div className="bg-[#F8FAFC]/90 rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200/60">
                      <CheckSquare className="w-5 h-5 text-[#FF5252]" />
                      <h2 className="font-bold text-[#FF5252] text-base">Completed Task</h2>
                    </div>

                    {/* Completed Tasks List */}
                    <div className="space-y-3">
                      {completedTasks.length > 0 ? (
                        completedTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onStatusChange={handleStatusChange}
                            onDeleteTask={handleDeleteTask}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs italic">
                          No completed tasks yet. Finish a task to see it here!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: VITAL TASKS VIEW */}
          {activeTab === 'Vital Task' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                <AlertCircle className="w-6 h-6 text-[#FF5252]" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Vital Tasks</h2>
                  <p className="text-xs text-slate-500">High priority and critical deadline assignments.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.filter((t) => t.isVital || t.priority === 'Vital' || t.priority === 'High').map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDeleteTask={handleDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MY TASKS VIEW */}
          {activeTab === 'My Task' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">My Task List</h2>
                  <p className="text-xs text-slate-500">All personal and team tasks assigned to you.</p>
                </div>
                <button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="bg-[#FF5252] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDeleteTask={handleDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TASK CATEGORIES VIEW */}
          {activeTab === 'Task Categories' && (
            <div className="space-y-6">
              {['Personal', 'Design', 'Business', 'Development'].map((cat) => {
                const catTasks = tasks.filter((t) => t.category === cat);
                return (
                  <div key={cat} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                      <FolderKanban className="w-5 h-5 text-[#FF5252]" />
                      <h3 className="font-bold text-slate-900 text-lg">{cat} Tasks ({catTasks.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {catTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={handleStatusChange}
                          onDeleteTask={handleDeleteTask}
                        />
                      ))}
                      {catTasks.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No tasks in this category.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: SETTINGS VIEW */}
          {activeTab === 'Settings' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm max-w-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                <SettingsIcon className="w-6 h-6 text-[#FF5252]" />
                <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Sundar Gurung"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#FF5252]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue="sundargurung360@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#FF5252]"
                  />
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Email Notifications</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#FF5252]" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: HELP VIEW */}
          {activeTab === 'Help' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm max-w-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                <HelpCircle className="w-6 h-6 text-[#FF5252]" />
                <h2 className="text-xl font-bold text-slate-900">Help & User Guide</h2>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-1">How to change task status?</h4>
                  <p className="text-xs leading-relaxed">
                    Click the circle icon on any task card to quickly toggle between Not Started, In Progress, and Completed states. Donut progress metrics update automatically.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-1">How to invite team members?</h4>
                  <p className="text-xs leading-relaxed">
                    Click the "+ Invite" button near your welcome greeting to open the invitation dialog and share projects with team members.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        teamMembers={teamMembers}
        onInviteMember={handleInviteMember}
      />
    </div>
  );
}
