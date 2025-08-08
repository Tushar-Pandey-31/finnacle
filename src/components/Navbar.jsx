import { Link, useLocation } from 'react-router-dom';

const navLinkStyle = (active) => ({
  padding: '8px 12px',
  color: active ? '#111' : '#333',
  background: active ? '#e6f0ff' : 'transparent',
  borderRadius: 6,
  textDecoration: 'none',
  fontWeight: 600,
});

export default function Navbar() {
  const location = useLocation();
  const current = location.pathname;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid #eee',
      position: 'sticky',
      top: 0,
      background: '#fff',
      zIndex: 10,
    }}>
      <div style={{ fontWeight: 800 }}>Finnacle</div>
      <nav style={{ display: 'flex', gap: 8 }}>
        <Link to="/" style={navLinkStyle(current === '/')}>Dashboard</Link>
        <Link to="/options" style={navLinkStyle(current === '/options')}>Options</Link>
        <Link to="/portfolio" style={navLinkStyle(current === '/portfolio')}>Portfolio</Link>
      </nav>
    </div>
  );
}