import { Task, TeamMember } from '../types';

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: '생일 파티 참석하기',
    description: '가는 길에 선물을 사고 베이커리에서 케이크를 찾아오기. (오후 6시 | 프레시 엘리먼츠)',
    status: 'Not Started',
    priority: 'Moderate',
    createdAt: '20/06/2023',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400',
    category: 'Personal'
  },
  {
    id: 'task-2',
    title: 'TravelDays 랜딩 페이지 디자인',
    description: '퇴근 전까지 작업을 마무리하고 클라이언트와 논의하기. (오후 4시 | 회의실)',
    status: 'In Progress',
    priority: 'Moderate',
    createdAt: '20/06/2023',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400',
    category: 'Design'
  },
  {
    id: 'task-3',
    title: '최종 제품 발표 준비',
    description: '기능이 정상적으로 동작하는지 확인하고 발표 자료와 팀 준비 상태를 점검하기.',
    status: 'In Progress',
    priority: 'Vital',
    createdAt: '19/06/2023',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400',
    isVital: true,
    category: 'Business'
  },
  {
    id: 'task-4',
    title: '산책하기',
    description: '공원에 다녀오고 간식도 챙기기.',
    status: 'Completed',
    priority: 'Low',
    createdAt: '18/06/2023',
    completedAt: '2일 전에 완료됨',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
    category: 'Personal'
  },
  {
    id: 'task-5',
    title: '회의 진행',
    description: '클라이언트와 만나 요구사항을 최종 정리하기.',
    status: 'Completed',
    priority: 'High',
    createdAt: '18/06/2023',
    completedAt: '2일 전에 완료됨',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400',
    category: 'Business'
  },
  {
    id: 'task-6',
    title: '시스템 아키텍처 초안 검토',
    description: '스프린트 계획 전에 백엔드 클라우드 아키텍처와 데이터베이스 스키마 요구사항을 분석하기.',
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
    name: '김민준',
    email: 'anish@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'team-2',
    name: '이서연',
    email: 'priya@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'team-3',
    name: '박지훈',
    email: 'kiran@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'team-4',
    name: '최유진',
    email: 'sara@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150'
  }
];
