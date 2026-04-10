import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://backend-4-i03l.onrender.com';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    const response = await fetch(`${API_BASE}/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('admin', JSON.stringify(data));
      navigate('/admin-dashboard');
    } else {
      setMessage({ type: 'error', text: data.message || 'Invalid credentials.' });
    }
  };

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <div className="auth-hero">
          <span className="auth-pill">Admin access</span>
          <h1 className="page-title">Admin Login</h1>
          <p className="small-text">Sign in to review student submissions and manage the dashboard.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Admin username" required />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login as Admin</button>
        </form>
        {message && <div className={`message ${message.type}`}>{message.text}</div>}
      </div>
    </div>
  );
}

export default AdminLogin;
