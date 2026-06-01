import { useState, useEffect } from 'react';
import Board from './components/Board';
import Login from './components/Auth/Login';
import Sidebar from './components/Layout/Sidebar';
import MeetingRequests from './pages/MeetingRequests';
import MeetingNotes from './pages/MeetingNotes';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import Calendar from './pages/Calendar';
import Teams from './pages/Teams';
import Analytics from './pages/Analytics';
import { INITIAL_TASKS, USERS } from './data/mockData';
import { loadFromStorage, saveToStorage } from './utils/storage';

function App() {
  const [tasks, setTasks]                     = useState(() => loadFromStorage("kanban_tasks", INITIAL_TASKS));
  const [meetingRequests, setMeetingRequests] = useState([]);
  const [showAgenda, setShowAgenda]           = useState(true);
  const [activePage, setActivePage]           = useState("board");

  const [currentUser, setCurrentUser] = useState(() => {
    const savedId = loadFromStorage("mo_current_user", null);
    return savedId ? (USERS.find(u => u.id === savedId) ?? null) : null;
  });

  useEffect(() => {
    saveToStorage("kanban_tasks", tasks);
  }, [tasks]);

  // Shared task mutations — used by Board, MyTasks, MeetingNotes
  const addTask    = (task)        => setTasks(prev => [...prev, task]);
  const saveTask   = (updated)     => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  const deleteTask = (taskId)      => setTasks(prev => prev.filter(t => t.id !== taskId));

  const handleLogin = (user) => {
    saveToStorage("mo_current_user", user.id);
    setCurrentUser(user);
    setActivePage("board");
  };

  const handleLogout = () => {
    saveToStorage("mo_current_user", null);
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard currentUser={currentUser} tasks={tasks} meetingRequests={meetingRequests} />;
      case "board":
        return (
          <Board
            tasks={tasks}
            setTasks={setTasks}
            showAgenda={showAgenda}
            setShowAgenda={setShowAgenda}
            currentUser={currentUser}
          />
        );
      case "my-tasks":
        return <MyTasks currentUser={currentUser} tasks={tasks} saveTask={saveTask} deleteTask={deleteTask} />;
      case "meeting-requests":
        return <MeetingRequests currentUser={currentUser} meetingRequests={meetingRequests} setMeetingRequests={setMeetingRequests} />;
      case "meeting-notes":
        return <MeetingNotes currentUser={currentUser} addTask={addTask} />;
      case "calendar":
        return <Calendar currentUser={currentUser} tasks={tasks} meetingRequests={meetingRequests} />;
      case "teams":
        return <Teams currentUser={currentUser} tasks={tasks} onNavigate={setActivePage} />;
      case "analytics":
        return <Analytics currentUser={currentUser} tasks={tasks} meetingRequests={meetingRequests} onNavigate={setActivePage} />;
      default:
        return (
          <div className="p-8 text-gray-500 text-sm">
            Page <span className="font-medium text-gray-700">{activePage}</span> — coming soon.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        currentUser={currentUser}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      />
      <div className="ml-56 flex-1 flex flex-col min-h-screen">
        <main className="flex-1">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
