import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const location = useLocation();
  const current = location.pathname;
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const original = document.body.style.overflow;
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [open]);

  const isAuthPage = current === '/login' || current === '/register';

  const MobileNavItems = ({ onNavigate }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Link to="/" onClick={() => onNavigate?.()} className={current === '/' ? 'active' : ''}>Dashboard</Link>
      <Link to="/crypto" onClick={() => onNavigate?.()} className={current === '/crypto' ? 'active' : ''}>Crypto</Link>
      <Link to="/forex" onClick={() => onNavigate?.()} className={current === '/forex' ? 'active' : ''}>Forex</Link>
      <Link to="/derivatives" onClick={() => onNavigate?.()} className={current === '/derivatives' ? 'active' : ''}>Derivatives</Link>
      <Link to="/options" onClick={() => onNavigate?.()} className={current === '/options' ? 'active' : ''}>Options</Link>
      <Link to="/portfolio" onClick={() => onNavigate?.()} className={current === '/portfolio' ? 'active' : ''}>Portfolio</Link>
      {!token ? (
        <>
          <Link to="/login" onClick={() => onNavigate?.()} className={current === '/login' ? 'active' : ''}>Login</Link>
          <Link to="/register" onClick={() => onNavigate?.()} className={current === '/register' ? 'active' : ''}>Register</Link>
        </>
      ) : (
        <button className="button ghost" onClick={() => { logout(); onNavigate?.(); }}>Logout</button>
      )}
    </div>
  );

  return (
    <header className="header">
      <div className="container nav-inner">
        <div className="brand">Finnacle</div>
        
        {/* Desktop nav (large screens only) */}
        {!isAuthPage && (
          <nav className="desktop-nav">
            <Link to="/" className={current === '/' ? 'active' : ''}>Dashboard</Link>
            <Link to="/crypto" className={current === '/crypto' ? 'active' : ''}>Crypto</Link>
            <Link to="/forex" className={current === '/forex' ? 'active' : ''}>Forex</Link>
            <Link to="/derivatives" className={current === '/derivatives' ? 'active' : ''}>Derivatives</Link>
            <Link to="/options" className={current === '/options' ? 'active' : ''}>Options</Link>
            <Link to="/portfolio" className={current === '/portfolio' ? 'active' : ''}>Portfolio</Link>
            {!token ? (
              <>
                <Link to="/login" className={current === '/login' ? 'active' : ''}>Login</Link>
                <Link to="/register" className={current === '/register' ? 'active' : ''}>Register</Link>
              </>
            ) : (
              <button className="button ghost" onClick={logout}>Logout</button>
            )}
          </nav>
        )}
        
        {/* Mobile toggle (small screens) */}
        {!isAuthPage && (
          <button className="mobile-nav-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Mobile sidebar */}
      {open && !isAuthPage && (
        <div className="mobile-sidebar-overlay" onClick={() => setOpen(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <MobileNavItems onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}