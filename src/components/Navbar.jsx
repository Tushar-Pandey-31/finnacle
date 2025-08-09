import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const location = useLocation();
  const current = location.pathname;
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  const isAuthPage = current === '/login' || current === '/register';

  const navLinks = (
    <>
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
    </>
  );

  return (
    <header className="header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 12, paddingBottom: 12 }}>
        <div className="brand">Finnacle</div>
        {/* Desktop nav */}
        {!isAuthPage && (
          <nav className="nav" style={{ display: 'none' }}>
            {navLinks}
          </nav>
        )}
        {/* Mobile toggle */}
        {!isAuthPage && (
          <button className="mobile-nav-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        )}
      </div>
      {open && (
        <div className="mobile-sidebar-overlay" onClick={() => setOpen(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            {navLinks}
          </div>
        </div>
      )}
    </header>
  );
}