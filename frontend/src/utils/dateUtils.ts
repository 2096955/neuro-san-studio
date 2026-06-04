/**
 * Date and Time Utilities
 * 
 * Centralized date/time formatting to ensure consistency across the application.
 * All timestamps use browser's local timezone in ISO format: YYYY-MM-DDTHH:MM:SS
 */

/**
 * Format a Date object to ISO timestamp string using browser's local timezone
 * 
 * @param date - Date object to format
 * @returns ISO formatted string: YYYY-MM-DDTHH:MM:SS (e.g., "2025-10-13T22:25:54")
 * 
 * @example
 * formatLocalTimestamp(new Date()) // "2025-10-13T22:25:54"
 */
export function formatLocalTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  // ISO format with 'T' separator (matches backend Python's datetime.now().isoformat())
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Calculate time range for common filter values
 * 
 * @param filterValue - Time filter (5m, 15m, 1h, 6h, 24h, 7d, 30d)
 * @returns Object with start and end timestamps in ISO format
 * 
 * @example
 * getTimeRange('5m')  // { start: "2025-10-13T22:20:54", end: "2025-10-13T22:25:54" }
 * getTimeRange('1h')  // { start: "2025-10-13T21:25:54", end: "2025-10-13T22:25:54" }
 */
export function getTimeRange(filterValue: string): { start: string; end: string } {
  const end = new Date();
  const start = new Date();

  switch (filterValue) {
    case '5m':
      start.setMinutes(end.getMinutes() - 5);
      break;
    case '15m':
      start.setMinutes(end.getMinutes() - 15);
      break;
    case '1h':
      start.setHours(end.getHours() - 1);
      break;
    case '6h':
      start.setHours(end.getHours() - 6);
      break;
    case '24h':
      start.setHours(end.getHours() - 24);
      break;
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    default:
      start.setHours(end.getHours() - 1); // Default to 1 hour
  }

  return {
    start: formatLocalTimestamp(start),
    end: formatLocalTimestamp(end)
  };
}

/**
 * Get current timestamp in ISO format using browser's local timezone
 * 
 * @returns Current timestamp: YYYY-MM-DDTHH:MM:SS
 * 
 * @example
 * getCurrentTimestamp() // "2025-10-13T22:25:54"
 */
export function getCurrentTimestamp(): string {
  return formatLocalTimestamp(new Date());
}
