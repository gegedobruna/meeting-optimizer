import { ROLES, NAV_ITEMS } from '../data/mockData';

export const canCreateTask = (user) =>
  user.role !== ROLES.TEAM_MEMBER;

export const canEditTask = (user, task) =>
  user.role === ROLES.ADMIN || user.role === ROLES.TEAM_LEAD || task.assignee === user.name;

export const canDeleteTask = (user, task) =>
  canEditTask(user, task);

export const canDragTask = (user, task) =>
  canEditTask(user, task);

export const canApproveMeeting = (user) =>
  user.role === ROLES.ADMIN || user.role === ROLES.TEAM_LEAD;

export const canViewAnalytics = (user) =>
  user.role === ROLES.ADMIN || user.role === ROLES.TEAM_LEAD;

export const canViewTeams = (user) =>
  user.role === ROLES.ADMIN || user.role === ROLES.TEAM_LEAD;

export const getVisibleNavItems = (user) =>
  NAV_ITEMS.filter(item => item.roles.includes(user.role));
