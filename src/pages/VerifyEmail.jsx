import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmailToken } from '../services/backend';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    let cancelled = false;
    async function run() {
      try {
        setStatus('loading');
        const res = await verifyEmailToken(token);
        if (cancelled) return;
        setStatus('success');
        setMessage(res?.message || 'Email verified! You can now log in.');
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setMessage(e.response?.data?.error || e.message || 'Token is invalid or has expired.');
      }
    }
    run();
    return () => { cancelled = true; };
  }, [params]);

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="card-header">Verify Email</div>
        <div className="card-content">
          {status === 'loading' && <div>Verifying...</div>}
          {status !== 'loading' && (
            <div style={{ color: status === 'error' ? 'var(--danger)' : 'var(--accent)' }}>{message}</div>
          )}
          {status === 'success' && (
            <div style={{ marginTop: 12 }}>
              <Link className="button primary" to="/login">Go to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}