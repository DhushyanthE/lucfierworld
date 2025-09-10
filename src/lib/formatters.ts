
/**
 * Format a number as currency with appropriate suffix (T, B, M)
 */
export function formatCurrencyWithSuffix(num: number | undefined): string {
  if (num === undefined) return '--';
  
  if (num >= 1000000000000) {
    return `$${(num / 1000000000000).toFixed(2)}T`;
  } else if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(2)}B`;
  } else if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  } else {
    return `$${num.toLocaleString()}`;
  }
}

/**
 * Format a percentage value with 2 decimal places
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

