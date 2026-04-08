import { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const student = JSON.parse(localStorage.getItem('student') || 'null');
  const admin = JSON.parse(localStorage.getItem('admin') || 'null');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('student');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Student Portfolio Dashboard</div>
        <nav>
          {student ? (
            <>
              <Link to="/student-dashboard">Dashboard</Link>
              <span className="nav-user">Hi, {student.name}</span>
              <button className="secondary" onClick={handleLogout}>Logout</button>
            </>
          ) : admin ? (
            <>
              <Link to="/admin-dashboard">Admin Dashboard</Link>
              <span className="nav-user">Admin</span>
              <button className="secondary" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/admin-login">Admin</Link>
            </>
          )}
          <button
            type="button"
            className="theme-toggle secondary"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </nav>
      </header>

      <main className="page-container">
        <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/student-dashboard"
            element={student ? <StudentDashboard /> : <Navigate to="/login" replace />}
          />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin-dashboard"
            element={admin ? <AdminDashboard /> : <Navigate to="/admin-login" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
