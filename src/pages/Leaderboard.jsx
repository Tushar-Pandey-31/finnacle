import { useEffect, useState } from 'react';
import { getLeaderboard, getLeaderboardMe } from '../services/backend';

function formatCents(cents) {
  const v = (cents ?? 0) / 100;
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [me, setMe] = useState(null);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const [list, mine] = await Promise.all([getLeaderboard({ limit, offset }), getLeaderboardMe().catch(() => null)]);
      setRows(list?.users || []);
      setMe(list?.me || mine || null);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [limit, offset]);

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">Leaderboard</div>
        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
          {loading && <div>Loading…</div>}
          {!loading && (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>Rank</th>
                      <th>Name</th>
                      <th style={{ width: 160, textAlign: 'right' }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.userId}>
                        <td>{r.rank}</td>
                        <td>{r.name}</td>
                        <td style={{ textAlign: 'right' }}>{formatCents(r.walletBalanceCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {me && (
                <div className="card" style={{ boxShadow: 'none', border: '1px dashed var(--border)' }}>
                  <div className="card-content" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>Your rank</div>
                    <div><strong>#{me.rank}</strong> · {formatCents(me.walletBalanceCents)}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Prev</button>
                <button className="button" onClick={() => setOffset(offset + limit)}>Next</button>
                <select className="input" value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} style={{ width: 100 }}>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

