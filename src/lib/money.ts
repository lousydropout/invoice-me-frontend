/**
 * Utility functions for handling money amounts in pennies (cents)
 * API uses pennies (e.g., 11234 = $112.34)
 * UI displays dollars (e.g., $112.34)
 */

/**
 * Convert pennies to dollars for display
 * @param pennies - Amount in pennies (e.g., 11234)
 * @returns Amount in dollars (e.g., 112.34)
 */
export function penniesToDollars(pennies: number): number {
  // Round to nearest integer penny first to handle any fractional cents
  const roundedPennies = Math.round(pennies);
  return roundedPennies / 100;
}

/**
 * Convert dollars to pennies for API
 * @param dollars - Amount in dollars (e.g., 112.34)
 * @returns Amount in pennies (e.g., 11234) - always an integer
 */
export function dollarsToPennies(dollars: number): number {
  // Round to nearest penny to ensure we always send integer cents
  return Math.round(dollars * 100);
}

/**
 * Format pennies as currency string for display
 * @param pennies - Amount in pennies (e.g., 11234)
 * @returns Formatted string (e.g., "$112.34")
 */
export function formatPenniesAsCurrency(pennies: number): string {
  // Round to nearest integer penny first
  const roundedPennies = Math.round(pennies);
  const dollars = roundedPennies / 100;
  return dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format pennies as dollar amount (without $ sign) for display
 * @param pennies - Amount in pennies (e.g., 11234)
 * @returns Formatted string (e.g., "112.34")
 */
export function formatPenniesAsDollars(pennies: number): string {
  // Round to nearest integer penny first to ensure no fractional cents
  const roundedPennies = Math.round(pennies);
  const dollars = roundedPennies / 100;
  return dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Truncate a dollar amount to 2 decimal places (no rounding)
 * @param dollars - Amount in dollars (e.g., 16.236)
 * @returns Truncated amount (e.g., 16.23)
 */
export function truncateToTwoDecimals(dollars: number): number {
  return Math.floor(dollars * 100) / 100;
}

/**
 * Format dollars with truncation to 2 decimal places (no rounding)
 * @param dollars - Amount in dollars (e.g., 16.236)
 * @returns Formatted string (e.g., "16.23")
 */
export function formatDollarsTruncated(dollars: number): string {
  const truncated = truncateToTwoDecimals(dollars);
  return truncated.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

