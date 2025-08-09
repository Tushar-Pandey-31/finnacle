import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const init = useAuthStore((s) => s.init);

  useEffect(() => { init(); }, [init]);

  async function onSubmit(e) {
    e.preventDefault();
    await login({ email, password });
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
          </form>
        </div>
      </div>
    </div>
  );
}