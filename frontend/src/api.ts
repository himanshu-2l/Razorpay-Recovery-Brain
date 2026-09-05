/**
 * Central API base URL.
 * In local dev: http://localhost:8000
 * In production: automatically handles VITE_API_BASE_URL with or without protocol prefix
 */
const rawUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
export const API_BASE = rawUrl
  ? (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`)
  : 'http://localhost:8000';
