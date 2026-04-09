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
        <nav className="topbar-nav">
          <div className="nav-links">
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
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" role="presentation">
                  <path
                    d="M20.7 14.3A8 8 0 0 1 9.7 3.3a8.5 8.5 0 1 0 11 11Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" role="presentation">
                  <circle cx="12" cy="12" r="4" fill="currentColor" />
                  <path
                    d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
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
