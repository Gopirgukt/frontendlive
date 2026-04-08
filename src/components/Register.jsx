import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://backend-pp8q.onrender.com';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (response.ok) {
      setMessage({ type: 'success', text: 'Registration successful. Please login.' });
      setTimeout(() => navigate('/login'), 1200);
    } else {
      setMessage({ type: 'error', text: data.message || 'Could not register.' });
    }
  };

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <div className="auth-hero">
          <span className="auth-pill">New student</span>
          <h1 className="page-title">Register Student</h1>
          <p className="small-text">Create your account and submit your project for review.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Create account</button>
        </form>
        {message && <div className={`message ${message.type}`}>{message.text}</div>}
      </div>
    </div>
  );
}

export default Register;
