import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { initialTeamMembers } from './data/initialData';
import { Task, NavTab, TeamMember, TaskStatus } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskCard } from './components/TaskCard';
import { TaskDetailView } from './components/TaskDetailView';
import { TaskStatusCard } from './components/TaskStatusCard';
import { TaskCalendar } from './components/TaskCalendar';
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

type ProfileRow = {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
};

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
};

type PasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

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

const getAvatarUrl = (session: Session | null) => {
  const metadata = session?.user.user_metadata;
  return metadata?.avatar_url || metadata?.picture || DEFAULT_AVATAR;
};

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

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
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: DEFAULT_AVATAR,
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isPasswordPanelOpen, setIsPasswordPanelOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Modals
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskDueDate, setNewTaskDueDate] = useState<string | undefined>();
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
      setProfileForm({
        fullName: '',
        email: '',
        phone: '',
        avatarUrl: DEFAULT_AVATAR,
      });
      return;
    }

    let isMounted = true;

    const loadTasks = async () => {
      const fetchTasks = () =>
        supabase.from('tasks').select('*').order('created_at', { ascending: false });

      let { data, error } = await fetchTasks();

      // 브라우저에 남아 있는 만료 세션은 작업 조회에서 400 오류를 낼 수 있어, 한 번 갱신 후 재시도한다.
      if (error) {
        const { data: refreshedAuth, error: refreshError } = await supabase.auth.refreshSession();

        if (!refreshError && refreshedAuth.session) {
          setSession(refreshedAuth.session);
          ({ data, error } = await fetchTasks());
        }
      }

      if (!isMounted) return;

      if (error) {
        setTaskError('작업 정보를 불러오지 못했습니다. 잠시 후 페이지를 새로고침해주세요.');
        setTasks([]);
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

  useEffect(() => {
    if (!session) return;

    let isMounted = true;

    const baseProfile: ProfileForm = {
      fullName: getDisplayName(session),
      email: session.user.email ?? '',
      phone: session.user.user_metadata?.phone ?? '',
      avatarUrl: getAvatarUrl(session),
    };

    setProfileForm(baseProfile);

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name,last_name,username,email,phone,avatar_url')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setProfileForm(baseProfile);
        return;
      }

      const profile = data as ProfileRow | null;
      const profileName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();

      setProfileForm({
        fullName: profileName || baseProfile.fullName,
        email: profile?.email || baseProfile.email,
        phone: profile?.phone || baseProfile.phone,
        avatarUrl: profile?.avatar_url || baseProfile.avatarUrl,
      });
    };

    loadProfile();

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

  const currentUserName = useMemo(
    () => profileForm.fullName.trim() || getDisplayName(session),
    [profileForm.fullName, session],
  );
  const currentUserFirstName = useMemo(() => getFirstName(currentUserName), [currentUserName]);
  const currentUserEmail = profileForm.email || session?.user.email || '';
  const currentUserPhone = profileForm.phone;
  const currentUserAvatar = profileForm.avatarUrl || getAvatarUrl(session);

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

  const handleOpenAddTask = (dueDate?: string) => {
    setNewTaskDueDate(dueDate);
    setIsAddTaskModalOpen(true);
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

  const handleProfileFieldChange = (field: keyof ProfileForm, value: string) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
    setProfileMessage('');
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleProfileFieldChange('avatarUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!session) return;

    const fullName = profileForm.fullName.trim();
    const email = profileForm.email.trim();
    const phone = profileForm.phone.trim();

    if (!fullName || !email) {
      setProfileMessage('이름과 이메일 주소를 입력해주세요.');
      return;
    }

    const { firstName, lastName } = splitFullName(fullName);

    setIsSavingProfile(true);
    setProfileMessage('');

    const authPayload: Parameters<typeof supabase.auth.updateUser>[0] = {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        phone,
        avatar_url: profileForm.avatarUrl,
      },
    };

    if (email !== session.user.email) {
      authPayload.email = email;
    }

    const { error: authError } = await supabase.auth.updateUser(authPayload);

    if (authError) {
      setProfileMessage(authError.message);
      setIsSavingProfile(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: session.user.id,
      first_name: firstName,
      last_name: lastName,
      username: session.user.user_metadata?.username ?? null,
      email,
      phone,
      avatar_url: profileForm.avatarUrl,
    });

    if (profileError) {
      setProfileMessage(profileError.message);
      setIsSavingProfile(false);
      return;
    }

    setProfileForm((current) => ({
      ...current,
      fullName,
      email,
      phone,
    }));
    setProfileMessage(
      email !== session.user.email
        ? '프로필이 저장되었습니다. 변경한 이메일은 인증 메일 확인 후 적용됩니다.'
        : '프로필 정보가 저장되었습니다.',
    );
    setIsSavingProfile(false);
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage('새 비밀번호를 입력해주세요.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage('');

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (error) {
      setPasswordMessage(error.message);
      setIsUpdatingPassword(false);
      return;
    }

    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setPasswordMessage('비밀번호가 변경되었습니다.');
    setIsUpdatingPassword(false);
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
          avatarUrl={currentUserAvatar}
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
              avatarUrl={currentUserAvatar}
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
              <TaskCalendar
                tasks={tasks}
                onOpenTask={handleOpenTask}
                onAddTask={handleOpenAddTask}
              />

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
                      onClick={() => handleOpenAddTask()}
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
                          onEditTask={() => handleOpenAddTask(task.dueDate)}
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
                  onClick={() => handleOpenAddTask()}
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
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm max-w-3xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                <SettingsIcon className="w-6 h-6 text-[#FF5252]" />
                <h2 className="text-xl font-bold text-slate-900">계정 설정</h2>
              </div>

              <div className="space-y-6 text-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img
                    src={currentUserAvatar}
                    alt={currentUserName}
                    className="h-24 w-24 rounded-full object-cover border-4 border-red-100 shadow-sm"
                  />
                  <div>
                    <label className="inline-flex cursor-pointer items-center rounded-xl border border-[#FF5252] px-4 py-2 text-xs font-bold text-[#FF5252] transition hover:bg-[#FF5252] hover:text-white">
                      프로필 이미지 변경
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-2 text-xs text-slate-400">
                      JPG, PNG 이미지를 선택하면 미리보기에 바로 반영됩니다.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">이름</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(event) => handleProfileFieldChange('fullName', event.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#FF5252]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">이메일 주소</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => handleProfileFieldChange('email', event.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#FF5252]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">전화번호</label>
                  <input
                    type="tel"
                    value={currentUserPhone}
                    onChange={(event) => handleProfileFieldChange('phone', event.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#FF5252]"
                  />
                </div>

                {profileMessage && (
                  <p
                    className={`text-sm font-semibold ${
                      profileMessage.includes('저장') ? 'text-emerald-600' : 'text-[#FF5252]'
                    }`}
                  >
                    {profileMessage}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="rounded-xl bg-[#FF5252] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#ff3b3b] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingProfile ? '저장 중...' : '저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordPanelOpen((current) => !current);
                      setPasswordMessage('');
                    }}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#FF5252] hover:text-[#FF5252]"
                  >
                    비밀번호 수정
                  </button>
                </div>

                {isPasswordPanelOpen && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          새 비밀번호
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(event) =>
                            setPasswordForm((current) => ({
                              ...current,
                              newPassword: event.target.value,
                            }))
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#FF5252]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          비밀번호 확인
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(event) =>
                            setPasswordForm((current) => ({
                              ...current,
                              confirmPassword: event.target.value,
                            }))
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#FF5252]"
                        />
                      </div>
                    </div>
                    {passwordMessage && (
                      <p
                        className={`mt-3 text-sm font-semibold ${
                          passwordMessage.includes('변경') ? 'text-emerald-600' : 'text-[#FF5252]'
                        }`}
                      >
                        {passwordMessage}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword}
                      className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingPassword ? '변경 중...' : '비밀번호 저장'}
                    </button>
                  </div>
                )}
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
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setNewTaskDueDate(undefined);
        }}
        onAddTask={handleAddTask}
        initialDueDate={newTaskDueDate}
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
