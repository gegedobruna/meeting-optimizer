import { AGENDA_ITEMS } from '../data/mockData';
import { getUsersByIds } from '../utils/users';

export default function AgendaPanel({ tasks }) {
  const syncRequestedTasks = tasks.filter(t => t.meetingRequest !== null);
  const tasksInReviewOrDone = tasks.filter(t => t.column === 'Review' || t.column === 'Done').length;
  const allTasksInReviewOrDone = tasksInReviewOrDone === tasks.length && tasks.length > 0;

  let banner = (
    <div className="bg-gray-100 text-gray-800 p-3 rounded mb-6 text-sm font-medium">
      Active tasks in progress
    </div>
  );

  if (syncRequestedTasks.length > 0) {
    banner = (
      <div className="bg-orange-100 text-orange-700 text-xs rounded p-2 mt-3 mb-6">
        ⚠ Sync requested for blocked tasks
      </div>
    );
  } else if (allTasksInReviewOrDone) {
    banner = (
      <div className="bg-green-100 text-green-800 p-3 rounded mb-6 text-sm font-medium">
        ✓ All tasks in Review/Done — consider skipping sync
      </div>
    );
  }

  return (
    <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-xl p-5 z-10 overflow-y-auto pt-20">
      <h2 className="text-xl font-bold mb-4">Meeting Agenda</h2>
      
      {banner}

      <div className="flex flex-col gap-4">
        {AGENDA_ITEMS.map(item => (
          <div key={item.id} className="flex justify-between items-center border-b pb-2">
            <div>
              <div className="font-medium text-sm">{item.topic}</div>
              <div className="text-xs text-gray-500">{item.owner}</div>
            </div>
            <div className="text-sm text-gray-500 whitespace-nowrap ml-2">
              {item.minutes} min
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-semibold text-sm mt-4 mb-2">Sync Requests</h3>
      {syncRequestedTasks.length === 0 ? (
        <div className="text-xs text-gray-400">No sync requests</div>
      ) : (
        syncRequestedTasks.map(task => (
          <div key={task.id} className="border-l-4 border-orange-400 pl-2 py-1 mb-2">
            <div className="text-sm font-medium">{task.title}</div>
            <div className="text-xs text-gray-500">
              {getUsersByIds(task.assignedUserIds ?? []).map(u => u.name).join(', ') || 'Unassigned'}
            </div>
            <div className="text-xs text-gray-600 italic">{task.meetingRequest}</div>
          </div>
        ))
      )}
    </div>
  );
}
