import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const setError = useAuthStore.setState;
  const init = useAuthStore((s) => s.init);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => { init(); }, [init]);
  useEffect(() => { if (token) navigate('/'); }, [token, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (e) {
      const status = e?.response?.status;
      const message = e?.response?.data?.error || e.message;
      if (status === 403 && message === 'Please verify your email before logging in.') {
        setError({ error: message });
      } else {
        setError({ error: message || 'Login failed' });
      }
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card-header">Login</div>
        <div className="card-content">
          <form onSubmit={onSubmit} className="controls" style={{ flexDirection: 'column', gap: 12 }}>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button className="button primary" type="submit">Login</button>
            {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
            <div style={{ color: 'var(--muted)' }}>
              New user? <Link to="/register">Create an account</Link>
            </div>
            <div style={{ color: 'var(--muted)' }}>
              <Link to="/forgot-password">Forgot your password?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}