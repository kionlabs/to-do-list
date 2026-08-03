import { NavTab, TaskPriority, TaskStatus } from '../types';

export const statusLabels: Record<TaskStatus, string> = {
  'Not Started': '시작 전',
  'In Progress': '진행 중',
  Completed: '완료',
};

export const priorityLabels: Record<TaskPriority, string> = {
  Low: '낮음',
  Moderate: '보통',
  High: '높음',
  Vital: '긴급',
};

export const navLabels: Record<NavTab, string> = {
  Dashboard: '대시보드',
  'Vital Task': '중요 작업',
  'My Task': '내 작업',
  'Task Categories': '작업 카테고리',
  Settings: '설정',
  Help: '도움말',
};

export const categoryLabels: Record<string, string> = {
  Personal: '개인',
  Design: '디자인',
  Business: '업무',
  Development: '개발',
};
