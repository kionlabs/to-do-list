import { useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { initialTasks, initialTeamMembers } from './data/initialData';
import { Task, NavTab, TeamMember, TaskStatus } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskCard } from './components/TaskCard';
import { TaskDetailView } from './components/TaskDetailView';
import { TaskStatusCard } from './components/TaskStatusCard';
import { AddTaskModal } from './components/AddTaskModal';
import { InviteModal } from './components/InviteModal';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { supabase } from './lib/supabase';
import { categoryLabels } from './utils/labels';
import { 
  FileText, 
  CheckSquare, 
  Plus, 
  UserPlus, 
  AlertCircle, 
  FolderKanban, 
  Settings as SettingsIcon, 
  HelpCircle
} from 'lucide-react';

type AuthView = 'signin' | 'signup';

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Task['priority'];
  created_at: string;
  due_date: string | null;
  completed_at: string | null;
  image_url: string | null;
  is_vital: boolean | null;
  category: string | null;
};

const getDisplayName = (session: Session | null) => {
  const metadata = session?.user.user_metadata;
  const fullName = [metadata?.first_name, metadata?.last_name].filter(Boolean).join(' ').trim();

  return (
    fullName ||
    metadata?.full_name ||
    metadata?.username ||
    session?.user.email?.split('@')[0] ||
    '사용자'
  );
};

const getFirstName = (displayName: string) => displayName.split(' ')[0] || displayName;

const formatDisplayDate = (dateValue?: string | null) => {
  if (!dateValue) return undefined;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}/${date.getFullYear()}`;
};

const mapTaskRow = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description ?? '',
  status: row.status,
  priority: row.priority,
  createdAt: formatDisplayDate(row.created_at) ?? '',
  dueDate: row.due_date ?? undefined,
  completedAt: row.completed_at ? `${formatDisplayDate(row.completed_at)} 완료` : undefined,
  imageUrl: row.image_url ?? undefined,
  isVital: row.is_vital ?? false,
  category: row.category ?? 'Personal',
});

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>(() => {
    return window.location.pathname === '/signup' ? 'signup' : 'signin';
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskError, setTaskError] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [activeTab, setActiveTab] = useState<NavTab>('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Modals
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setTasks([]);
      return;
    }

    let isMounted = true;

    const loadTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(
          'id,title,description,status,priority,created_at,due_date,completed_at,image_url,is_vital,category',
        )
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (error) {
        setTaskError(error.message);
        setTasks(initialTasks);
        return;
      }

      setTaskError('');
      setTasks((data ?? []).map((row) => mapTaskRow(row as TaskRow)));
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [session]);

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

  const currentUserName = useMemo(() => getDisplayName(session), [session]);
  const currentUserFirstName = useMemo(() => getFirstName(currentUserName), [currentUserName]);
  const currentUserEmail = session?.user.email ?? '';

  // Handlers
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const completedAt = newStatus === 'Completed' ? new Date().toISOString() : null;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'Completed' ? '방금 완료됨' : undefined,
          };
        }
        return t;
      })
    );
    setSelectedTask((current) =>
      current?.id === taskId
        ? {
            ...current,
            status: newStatus,
            completedAt: newStatus === 'Completed' ? '방금 완료됨' : undefined,
          }
        : current,
    );

    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: completedAt,
      })
      .eq('id', taskId);

    if (error) {
      setTaskError(error.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask((current) => (current?.id === taskId ? null : current));

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      setTaskError(error.message);
    }
  };

  const handleAddTask = async (newTaskData: Omit<Task, 'id'>) => {
    if (!session) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: session.user.id,
        title: newTaskData.title,
        description: newTaskData.description,
        status: newTaskData.status,
        priority: newTaskData.priority,
        category: newTaskData.category,
        due_date: newTaskData.dueDate,
        image_url: newTaskData.imageUrl,
        is_vital: newTaskData.isVital ?? false,
        completed_at: newTaskData.completedAt ? new Date().toISOString() : null,
      })
      .select(
        'id,title,description,status,priority,created_at,due_date,completed_at,image_url,is_vital,category',
      )
      .single();

    if (error) {
      setTaskError(error.message);
      return;
    }

    setTaskError('');
    setTasks((prev) => [mapTaskRow(data as TaskRow), ...prev]);
  };

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleBackToTasks = () => {
    setSelectedTask(null);
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

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return error.message;
    }

    if (!rememberMe) {
      window.localStorage.removeItem('todo-list-remember-me');
    } else {
      window.localStorage.setItem('todo-list-remember-me', 'true');
    }

    window.history.replaceState(null, '', '/');
    return null;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.localStorage.removeItem('todo-list-remember-me');
    setIsMobileSidebarOpen(false);
    window.history.replaceState(null, '', '/');
  };

  const showSignUp = () => {
    setAuthView('signup');
    window.history.pushState(null, '', '/signup');
  };

  const showSignIn = () => {
    setAuthView('signin');
    window.history.pushState(null, '', '/');
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ff6666] text-sm font-semibold text-white">
        불러오는 중...
      </div>
    );
  }

  if (!session) {
    if (authView === 'signup') {
      return <SignUpPage onSignIn={showSignIn} />;
    }

    return <LoginPage onLogin={handleLogin} onCreateAccount={showSignUp} />;
  }

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
          userName={currentUserName}
          userEmail={currentUserEmail}
          onLogout={handleLogout}
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
              userName={currentUserName}
              userEmail={currentUserEmail}
              onLogout={handleLogout}
              className="relative z-50 my-0 ml-0 rounded-r-2xl"
            />
          </div>
        )}

        {/* Right Main Dashboard Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {taskError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {taskError}
            </div>
          )}

          {/* Greeting Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentUserFirstName}님, 다시 오신 것을 환영합니다
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
                <span>+ 초대</span>
              </button>
            </div>
          </div>

          {/* TAB 1: MAIN DASHBOARD VIEW (Screenshot Replica) */}
          {selectedTask ? (
            <TaskDetailView
              task={selectedTask}
              onBack={handleBackToTasks}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ) : activeTab === 'Dashboard' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: TO-DO TASKS (Span 7) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  {/* To-Do Header & Add Task Button */}
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#FF5252]" />
                      <h2 className="font-bold text-[#FF5252] text-base sm:text-lg">할 일</h2>
                    </div>

                    <button
                      onClick={() => setIsAddTaskModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FF5252] hover:text-[#ff3b3b] hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>작업 추가</span>
                    </button>
                  </div>

                  {/* Sub-date label */}
                  <div className="text-xs font-semibold text-slate-400 border-b border-slate-100 pb-2">
                    오늘의 할 일
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
                          onOpenTask={handleOpenTask}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-500">진행 중인 할 일이 없습니다</p>
                        <p className="text-xs text-slate-400 mt-1">"+ 작업 추가"를 눌러 새 작업을 만들어보세요.</p>
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
                      <h2 className="font-bold text-[#FF5252] text-base">완료한 작업</h2>
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
                            onOpenTask={handleOpenTask}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs italic">
                          아직 완료한 작업이 없습니다. 작업을 완료하면 여기에 표시됩니다.
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
                  <h2 className="text-xl font-bold text-slate-900">중요 작업</h2>
                  <p className="text-xs text-slate-500">우선순위가 높거나 마감이 중요한 작업입니다.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.filter((t) => t.isVital || t.priority === 'Vital' || t.priority === 'High').map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDeleteTask={handleDeleteTask}
                    onOpenTask={handleOpenTask}
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
                  <h2 className="text-xl font-bold text-slate-900">내 작업 목록</h2>
                  <p className="text-xs text-slate-500">내게 배정된 개인 및 팀 작업입니다.</p>
                </div>
                <button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="bg-[#FF5252] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> 작업 추가
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDeleteTask={handleDeleteTask}
                    onOpenTask={handleOpenTask}
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
                      <h3 className="font-bold text-slate-900 text-lg">{categoryLabels[cat] ?? cat} 작업 ({catTasks.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {catTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={handleStatusChange}
                          onDeleteTask={handleDeleteTask}
                          onOpenTask={handleOpenTask}
                        />
                      ))}
                      {catTasks.length === 0 && (
                        <p className="text-xs text-slate-400 italic">이 카테고리에 등록된 작업이 없습니다.</p>
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
                <h2 className="text-xl font-bold text-slate-900">계정 설정</h2>
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">이름</label>
                  <input
                    type="text"
                    value={currentUserName}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#FF5252]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">이메일 주소</label>
                  <input
                    type="email"
                    value={currentUserEmail}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#FF5252]"
                  />
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">이메일 알림</span>
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
                <h2 className="text-xl font-bold text-slate-900">도움말 및 사용 가이드</h2>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-1">작업 상태는 어떻게 바꾸나요?</h4>
                  <p className="text-xs leading-relaxed">
                    작업 카드의 원형 아이콘을 클릭하면 시작 전, 진행 중, 완료 상태로 빠르게 변경할 수 있습니다. 진행률도 자동으로 업데이트됩니다.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-1">팀원은 어떻게 초대하나요?</h4>
                  <p className="text-xs leading-relaxed">
                    환영 문구 옆의 "+ 초대" 버튼을 클릭하면 초대 창을 열고 팀원과 작업을 함께 관리할 수 있습니다.
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
