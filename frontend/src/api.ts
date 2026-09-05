/**
 * Central API base URL.
 * Supports local dev (http://localhost:8000) and Cloudflare Tunnel / Remote PCs.
 * On tunneled domains (*.trycloudflare.com), returns empty string '' so requests use
 * relative paths (/api/...) proxied by Vite to local backend on port 8000.
 */
const rawUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

export const API_BASE = rawUrl
  ? (rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl)
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:8000'
    : '';
