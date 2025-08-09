export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 12, paddingBottom: 12 }}>
        <div style={{ fontWeight: 700 }}>Finnacle</div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>© {year} Finnacle. All rights reserved.</div>
      </div>
    </footer>
  );
}