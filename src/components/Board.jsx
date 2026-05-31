import { DragDropContext } from '@hello-pangea/dnd';
import { useState } from 'react';
import Column from './Column';
import AgendaPanel from './AgendaPanel';
import TaskDetailModal from './TaskDetailModal';
import { COLUMNS } from '../data/mockData';

export default function Board({ tasks, setTasks, showAgenda, setShowAgenda }) {
  const [selectedTask, setSelectedTask] = useState(null);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskIndex = tasks.findIndex(t => t.id === draggableId);
    if (taskIndex === -1) return;

    const newTasks = [...tasks];
    newTasks[taskIndex] = { ...newTasks[taskIndex], column: destination.droppableId };
    setTasks(newTasks);
  };

  const addTask = (task) => setTasks(prev => [...prev, task]);

  const handleMeetingRequest = (taskId, reason) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, meetingRequest: reason } : t
    ));
  };

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
            />
          ))}
        </div>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onSave={handleSaveTask}
          />
        )}
      </DragDropContext>
      {showAgenda && <AgendaPanel tasks={tasks} />}
    </div>
  );
}
