import { useState } from 'react';
import { requestPasswordReset } from '../services/backend';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await requestPasswordReset(email);
      setStatus('success');
      setMessage('If an account exists for that email, a reset link has been sent.');
    } catch (e) {
      setStatus('error');
      setMessage(e.response?.data?.error || e.message || 'Request failed');
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card-header">Forgot Password</div>
        <div className="card-content">
          <form onSubmit={onSubmit} className="controls" style={{ flexDirection: 'column', gap: 12 }}>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <button className="button primary" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send reset link'}
            </button>
            {message && <div style={{ color: status === 'error' ? 'var(--danger)' : 'var(--accent)' }}>{message}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}