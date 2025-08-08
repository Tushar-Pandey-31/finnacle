import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const current = location.pathname;
  return (
    <header className="header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, paddingBottom: 12 }}>
        <div className="brand">Finnacle</div>
        <nav className="nav">
          <Link to="/" className={current === '/' ? 'active' : ''}>Dashboard</Link>
          <Link to="/crypto" className={current === '/crypto' ? 'active' : ''}>Crypto</Link>
          <Link to="/forex" className={current === '/forex' ? 'active' : ''}>Forex</Link>
          <Link to="/derivatives" className={current === '/derivatives' ? 'active' : ''}>Derivatives</Link>
          <Link to="/options" className={current === '/options' ? 'active' : ''}>Options</Link>
          <Link to="/portfolio" className={current === '/portfolio' ? 'active' : ''}>Portfolio</Link>
        </nav>
      </div>
    </header>
  );
}