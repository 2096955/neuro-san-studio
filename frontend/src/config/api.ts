/**
 * Single source of truth for API base URL.
 * Use VITE_API_BASE_URL in .env (or .env.local) for dev and production.
 */
const BASE =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  'http://localhost:8000';

export const API_BASE_URL = BASE.replace(/\/$/, '');

/** WebSocket protocol only (e.g. "ws:" or "wss:"). Use getWebSocketUrl for full URL. */
export function getWebSocketProtocol(): string {
  try {
    const u = new URL(BASE);
    return u.protocol === 'https:' ? 'wss:' : 'ws:';
  } catch {
    return 'ws:';
  }
}

/** @deprecated Use getWebSocketProtocol() for protocol only. getWebSocketUrl() returns full WebSocket URL. */
export const getWebSocketBaseUrl = getWebSocketProtocol;

/** Full WebSocket URL for the given path (same host as API, ws/wss from http/https). */
export function getWebSocketUrl(path: string): string {
  try {
    const u = new URL(BASE);
    const protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${u.host}${path.startsWith('/') ? path : '/' + path}`;
  } catch {
    return `ws://localhost:8000${path.startsWith('/') ? path : '/' + path}`;
  }
}

export function getSSEUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}
