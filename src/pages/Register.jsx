import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);
  const [localError, setLocalError] = useState('');
  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);

  async function onSubmit(e) {
    e.preventDefault();
    setLocalError('');
    // Basic client-side validation
    const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
    const passOk = String(password).length >= 6;
    if (!emailOk) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!passOk) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    const success = await register({ email, password });
    setOk(success);
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card-header">Register</div>
        <div className="card-content">
          <form onSubmit={onSubmit} className="controls" style={{ flexDirection: 'column', gap: 12 }}>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button className="button primary" type="submit">Create Account</button>
            {localError && <div style={{ color: 'var(--danger)' }}>{localError}</div>}
            {ok && (
              <div style={{ color: 'var(--accent)' }}>
                Registration successful! Please check your email for a verification link.
              </div>
            )}
            {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
            <div style={{ color: 'var(--muted)' }}>
              Already registered? <Link to="/login">Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}