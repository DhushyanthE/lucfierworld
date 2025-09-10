
/**
 * Utility functions for color manipulation
 */

/**
 * Lightens a color by the specified amount
 */
export function lightenColor(color: string, amount: number): string {
  // Convert hex to RGB if needed
  if (color.startsWith('#')) {
    color = hexToRgb(color);
  }
  
  // Extract RGB components
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (!rgbMatch) return color;
  
  const r = Math.min(255, parseInt(rgbMatch[1]) + amount);
  const g = Math.min(255, parseInt(rgbMatch[2]) + amount);
  const b = Math.min(255, parseInt(rgbMatch[3]) + amount);
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Darkens a color by the specified amount
 */
export function darkenColor(color: string, amount: number): string {
  // Convert hex to RGB if needed
  if (color.startsWith('#')) {
    color = hexToRgb(color);
  }
  
  // Extract RGB components
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (!rgbMatch) return color;
  
  const r = Math.max(0, parseInt(rgbMatch[1]) - amount);
  const g = Math.max(0, parseInt(rgbMatch[2]) - amount);
  const b = Math.max(0, parseInt(rgbMatch[3]) - amount);
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts a hex color to RGB
 */
export function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse r, g, b values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return `rgb(${r}, ${g}, ${b})`;
}
