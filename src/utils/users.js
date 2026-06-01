import { USERS } from '../data/mockData';

const ACTIVE_COLUMNS = ["To Do", "In Progress", "Blocked", "Review"];

export function getUserById(id) {
  return USERS.find(u => u.id === id) ?? null;
}

export function getUsersByIds(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.map(id => USERS.find(u => u.id === id)).filter(Boolean);
}

export function getActiveTaskCount(userId, tasks) {
  return tasks.filter(
    t => ACTIVE_COLUMNS.includes(t.column) && t.assignedUserIds?.includes(userId)
  ).length;
}
