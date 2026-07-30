import { Task, TeamMember } from '../types';

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: "Attend Nischal's Birthday Party",
    description: "Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements).....",
    status: 'Not Started',
    priority: 'Moderate',
    createdAt: '20/06/2023',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400',
    category: 'Personal'
  },
  {
    id: 'task-2',
    title: 'Landing Page Design for TravelDays',
    description: 'Get the work done by EOD and discuss with client before leaving. (4 PM | Meeting Room)',
    status: 'In Progress',
    priority: 'Moderate',
    createdAt: '20/06/2023',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400',
    category: 'Design'
  },
  {
    id: 'task-3',
    title: 'Presentation on Final Product',
    description: 'Make sure everything is functioning and all the necessities are properly met. Prepare the team and get the documents ready for...',
    status: 'In Progress',
    priority: 'Vital',
    createdAt: '19/06/2023',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400',
    isVital: true,
    category: 'Business'
  },
  {
    id: 'task-4',
    title: 'Walk the dog',
    description: 'Take the dog to the park and bring treats as well.',
    status: 'Completed',
    priority: 'Low',
    createdAt: '18/06/2023',
    completedAt: 'Completed 2 days ago.',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
    category: 'Personal'
  },
  {
    id: 'task-5',
    title: 'Conduct meeting',
    description: 'Meet with the client and finalize requirements.',
    status: 'Completed',
    priority: 'High',
    createdAt: '18/06/2023',
    completedAt: 'Completed 2 days ago.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400',
    category: 'Business'
  },
  {
    id: 'task-6',
    title: 'Review System Architecture Draft',
    description: 'Analyze backend cloud architecture and database schema requirements before sprint planning.',
    status: 'Not Started',
    priority: 'Vital',
    createdAt: '21/06/2023',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
    isVital: true,
    category: 'Development'
  }
];

export const initialTeamMembers: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Anish Sharma',
    email: 'anish@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'team-2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'team-3',
    name: 'Kiran Thapa',
    email: 'kiran@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'team-4',
    name: 'Sara Chen',
    email: 'sara@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150'
  }
];
