/**
 * Thirukkural Mobile App - Build Number Utility
 * Format: {milliseconds}{seconds}{minutes}{hours}{year}{month}{date}{appversion}
 *
 * Example:
 *   Date: 2026-10-01 08:46:34.123
 *   Version: 1.0.0
 *   Build Number: 123344608202610011.0.0
 */

export interface BuildInfo {
  version: string;
  buildNumber: string;
  updatedAt: string;
}

/**
 * Generates a formatted build number string according to:
 * {milliseconds}{seconds}{minutes}{hours}{year}{month}{date}{appversion}
 *
 * @param version - Application version string (e.g. "1.0.0")
 * @param date - Date instance to extract timestamp components from (defaults to now)
 * @returns Formatted build number
 */
export function generateBuildNumber(
  version: string = '1.1.0',
  date: Date = new Date()
): string {
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const appVersion = String(version || '1.1.0');

  return `${ms}${ss}${mm}${hh}${yyyy}${MM}${dd}${appVersion}`;
}
