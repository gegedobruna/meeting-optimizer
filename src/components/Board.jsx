import { DragDropContext } from '@hello-pangea/dnd';
import { useState } from 'react';
import Column from './Column';
import AgendaPanel from './AgendaPanel';
import TaskDetailModal from './TaskDetailModal';
import { COLUMNS } from '../data/mockData';
import { canDragTask } from '../utils/permissions';

export default function Board({ tasks, setTasks, showAgenda, setShowAgenda, currentUser }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [dragWarning, setDragWarning] = useState(null);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const taskIndex = tasks.findIndex(t => t.id === draggableId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];

    if (!canDragTask(currentUser, task)) {
      setDragWarning("You can only move your own tasks.");
      setTimeout(() => setDragWarning(null), 3000);
      return;
    }

    const updatedTask = { ...task, column: destination.droppableId };

    if (destination.droppableId === "Blocked" && source.droppableId !== "Blocked") {
      updatedTask.blockedSince = new Date().toISOString();
    } else if (destination.droppableId !== "Blocked") {
      updatedTask.blockedSince = null;
    }

    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    setTasks(newTasks);
  };

  const addTask = (task) => setTasks(prev => [...prev, task]);

  const handleMeetingRequest = (taskId, reason) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, meetingRequest: reason } : t
    ));
  };

  const deleteTask = (taskId) => setTasks(prev => prev.filter(t => t.id !== taskId));

  const handleOpenDetail = (task) => setSelectedTask(task);

  const handleSaveTask = (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  return (
    <div className="relative">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-row gap-4 overflow-x-auto p-6">
          {COLUMNS.map(columnName => (
            <Column
              key={columnName}
              columnName={columnName}
              tasks={tasks.filter(t => t.column === columnName)}
              addTask={addTask}
              onRequestMeeting={handleMeetingRequest}
              onOpenDetail={handleOpenDetail}
              onDelete={deleteTask}
              currentUser={currentUser}
            />
          ))}
        </div>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onSave={handleSaveTask}
            onDelete={(taskId) => { deleteTask(taskId); setSelectedTask(null); }}
            currentUser={currentUser}
          />
        )}
      </DragDropContext>

      {showAgenda && <AgendaPanel tasks={tasks} />}

      {dragWarning && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50 text-sm font-medium">
          {dragWarning}
        </div>
      )}
    </div>
  );
}
