import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://backend-pp8q.onrender.com';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('student', JSON.stringify(data));
      navigate('/student-dashboard');
    } else {
      setMessage({ type: 'error', text: data.message || 'Login failed.' });
    }
  };

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <div className="auth-hero">
          <span className="auth-pill">Student access</span>
          <h1 className="page-title">Student Login</h1>
          <p className="small-text">Use your registered email to access your project dashboard.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="auth-note">If you are an admin, use the Admin Login page.</p>
        {message && <div className={`message ${message.type}`}>{message.text}</div>}
      </div>
    </div>
  );
}

export default Login;
