import { create } from 'zustand';
import { getQuizToday, answerQuiz, getQuizProgress } from '../services/backend';
import { useAuthStore } from './authStore';

export const useQuizStore = create((set, get) => ({
  assignmentId: null,
  dateUTC: null,
  questions: [],
  attemptedCount: 0,
  correctCount: 0,
  remaining: 5,
  loading: false,
  error: null,

  async fetchToday() {
    set({ loading: true, error: null });
    try {
      const data = await getQuizToday();
      const { assignmentId, dateUTC, questions, progress } = data || {};
      set({
        assignmentId,
        dateUTC,
        questions: questions || [],
        attemptedCount: progress?.attemptedCount ?? 0,
        correctCount: progress?.correctCount ?? 0,
        remaining: progress?.remaining ?? Math.max(0, 5 - (progress?.attemptedCount ?? 0)),
      });
    } catch (e) {
      set({ error: e?.response?.data?.error || e.message || 'Failed to load quiz' });
    } finally {
      set({ loading: false });
    }
  },

  async submitAnswer(questionId, selectedIndex) {
    const { assignmentId, questions } = get();
    if (!assignmentId) throw new Error('No assignment');
    const qIndex = questions.findIndex((q) => q.id === questionId);
    if (qIndex < 0) throw new Error('Question not found');
    try {
      const res = await answerQuiz({ assignmentId, questionId, selectedIndex });
      const { isCorrect, newWalletBalanceCents, attemptedCount, correctCount } = res || {};

      const updated = [...questions];
      updated[qIndex] = { ...updated[qIndex], alreadyAnswered: true };
      set({
        questions: updated,
        attemptedCount: attemptedCount ?? get().attemptedCount + 1,
        correctCount: correctCount ?? get().correctCount + (isCorrect ? 1 : 0),
        remaining: Math.max(0, 5 - (attemptedCount ?? get().attemptedCount + 1)),
      });

      if (typeof newWalletBalanceCents === 'number') {
        useAuthStore.getState().setWalletBalanceCents(newWalletBalanceCents);
      }

      return res;
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || 'Submit failed';
      set({ error: msg });
      throw e;
    }
  },

  async refreshProgress() {
    try {
      const p = await getQuizProgress();
      set({
        attemptedCount: p?.attemptedCount ?? 0,
        correctCount: p?.correctCount ?? 0,
        remaining: p?.remaining ?? Math.max(0, 5 - (p?.attemptedCount ?? 0)),
      });
      const answeredMap = new Map((p?.questions || []).map((q) => [q.id, q.alreadyAnswered]));
      set({ questions: get().questions.map((q) => ({ ...q, alreadyAnswered: answeredMap.get(q.id) ?? q.alreadyAnswered })) });
    } catch (e) {
      // ignore
    }
  },
}));

