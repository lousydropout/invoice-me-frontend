/**
 * Auth helper functions for Basic Authentication
 */

const AUTH_HEADER_KEY = 'auth.header';

/**
 * Creates a Basic Auth header value from username and password
 */
export function createBasicAuthHeader(username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

/**
 * Stores the Basic Auth header in sessionStorage
 */
export function storeAuthHeader(header: string): void {
  sessionStorage.setItem(AUTH_HEADER_KEY, header);
}

/**
 * Retrieves the Basic Auth header from sessionStorage
 */
export function getAuthHeader(): string | null {
  return sessionStorage.getItem(AUTH_HEADER_KEY);
}

/**
 * Removes the Basic Auth header from sessionStorage
 */
export function clearAuthHeader(): void {
  sessionStorage.removeItem(AUTH_HEADER_KEY);
}

/**
 * Checks if user is authenticated (has auth header in sessionStorage)
 */
export function isAuthenticated(): boolean {
  return getAuthHeader() !== null;
}

