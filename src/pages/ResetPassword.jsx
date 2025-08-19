import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/backend';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const token = params.get('token') || '';

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing reset token');
    }
  }, [token]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) return setStatus('error'), setMessage('Password must be at least 8 characters.');
    if (password !== confirm) return setStatus('error'), setMessage('Passwords do not match.');
    setStatus('loading'); setMessage('');
    try {
      await resetPassword({ token, password });
      setStatus('success'); setMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (e) {
      setStatus('error'); setMessage(e.response?.data?.error || e.message || 'Reset failed');
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card-header">Reset Password</div>
        <div className="card-content">
          <form onSubmit={onSubmit} className="controls" style={{ flexDirection: 'column', gap: 12 }}>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (min 8 chars)" required />
            <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" required />
            <button className="button primary" type="submit" disabled={status === 'loading' || !token}>
              {status === 'loading' ? 'Resetting...' : 'Reset password'}
            </button>
            {message && <div style={{ color: status === 'error' ? 'var(--danger)' : 'var(--accent)' }}>{message}</div>}
            {!token && <div style={{ color: 'var(--muted)' }}>Missing token. Go to <Link to="/forgot-password">Forgot Password</Link>.</div>}
          </form>
        </div>
      </div>
    </div>
  );
}