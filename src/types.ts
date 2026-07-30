export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Moderate' | 'High' | 'Vital';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  completedAt?: string;
  imageUrl?: string;
  isVital?: boolean;
  category?: string;
}

export type NavTab = 
  | 'Dashboard' 
  | 'Vital Task' 
  | 'My Task' 
  | 'Task Categories' 
  | 'Settings' 
  | 'Help';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
