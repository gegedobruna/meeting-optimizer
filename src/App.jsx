import { useState, useEffect } from 'react';
import Board from './components/Board';
import { INITIAL_TASKS } from './data/mockData';
import { loadFromStorage, saveToStorage } from './utils/storage';

function App() {
  const [tasks, setTasks] = useState(() => loadFromStorage("kanban_tasks", INITIAL_TASKS));
  const [showAgenda, setShowAgenda] = useState(true);

  useEffect(() => {
    saveToStorage("kanban_tasks", tasks);
  }, [tasks]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center relative z-20">
        <h1 className="text-xl font-bold">Meeting Optimizer</h1>
        <button
          onClick={() => setShowAgenda(!showAgenda)}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm font-medium"
        >
          {showAgenda ? "Hide Agenda" : "Show Agenda"}
        </button>
      </header>
      <Board 
        tasks={tasks} 
        setTasks={setTasks} 
        showAgenda={showAgenda} 
        setShowAgenda={setShowAgenda} 
      />
    </div>
  );
}

export default App;
