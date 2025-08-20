import { useEffect, useState } from 'react';
import { useQuizStore } from '../store/quizStore';

export default function Quiz() {
  const { fetchToday, submitAnswer, refreshProgress, questions, attemptedCount, correctCount, remaining, loading, error } = useQuizStore();
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => { fetchToday().then(() => refreshProgress()); }, [fetchToday, refreshProgress]);

  async function onSubmit(qid, idx) {
    if (submittingId) return;
    setSubmittingId(qid);
    try {
      await submitAnswer(qid, idx);
    } catch (e) {
      // handled in store error
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="card-header">Today's Quiz</div>
        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>Attempts: {attemptedCount}/5 · Correct: {correctCount}</div>
            {remaining === 0 && <div style={{ color: 'var(--success)' }}>You're done for today!</div>}
          </div>
          {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
          {loading && <div>Loading…</div>}
          {!loading && questions && questions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {questions.map((q) => (
                <div key={q.id} className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
                  <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontWeight: 600 }}>{q.prompt}</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {q.options?.map((opt, idx) => (
                        <button
                          key={idx}
                          className="button"
                          disabled={q.alreadyAnswered || submittingId === q.id || remaining === 0}
                          onClick={() => onSubmit(q.id, idx)}
                          style={{ justifyContent: 'flex-start' }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {q.alreadyAnswered && <div style={{ color: 'var(--muted)' }}>Answered</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

