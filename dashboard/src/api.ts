/**
 * Central API base URL.
 * In local dev: http://localhost:8000
 * In production: set VITE_API_BASE_URL env var in Vercel dashboard
 *                to your Render backend URL (e.g. https://revenue-recovery-brain.onrender.com)
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8000';
