import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://finnacle-backend.onrender.com';

export const backend = axios.create({ baseURL: BASE_URL });

export function setAuthToken(token) {
  if (token) backend.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete backend.defaults.headers.common['Authorization'];
}

export async function registerUser({ email, password }) {
  const { data } = await backend.post('/api/auth/register', { email, password });
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await backend.post('/api/auth/login', { email, password });
  return data; // expected { token, ... }
}

export async function logoutUser() {
  try {
    const { data } = await backend.post('/api/auth/logout');
    return data;
  } catch (e) {
    // swallow errors to ensure client can still clear token
    return null;
  }
}

export async function createPortfolio({ name }) {
  const { data } = await backend.post('/api/portfolio', { name });
  return data;
}

export async function addHolding({ portfolioId, symbol, quantity }) {
  const { data } = await backend.post(`/api/portfolio/${portfolioId}/add`, { symbol, quantity });
  return data;
}

export async function getHoldings({ portfolioId }) {
  const { data } = await backend.get(`/api/portfolio/${portfolioId}/holdings`);
  return data;
}

// AI analysis
export async function analyzePortfolio({ holdings }) {
  return backend
    .post('/api/ai/analyze-portfolio', { holdings }) // Only send holdings
    .then((r) => r.data);
}

// Auth - email verification
export async function verifyEmailToken(token) {
  const { data } = await backend.post('/api/auth/verify-email', { token });
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await backend.post('/api/auth/forgot-password', { email });
  return data;
}

export async function resetPassword({ token, password }) {
  const { data } = await backend.post('/api/auth/reset-password', { token, password });
  return data;
}