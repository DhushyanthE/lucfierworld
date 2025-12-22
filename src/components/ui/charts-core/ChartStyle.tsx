import * as React from "react"
import { ChartConfig } from "./types"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

// Sanitize color value to prevent CSS injection
const sanitizeColor = (color: string): string | null => {
  if (!color) return null;
  
  // Only allow valid CSS color formats
  const validColorPattern = /^(#[0-9A-Fa-f]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[\d.]+\s*\)|hsl\(\s*\d{1,3}\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*\)|hsla\(\s*\d{1,3}\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+\s*\)|[a-zA-Z]+)$/;
  
  const trimmedColor = color.trim();
  
  if (validColorPattern.test(trimmedColor)) {
    return trimmedColor;
  }
  
  // Check for CSS variable references
  if (/^var\(--[a-zA-Z0-9-]+\)$/.test(trimmedColor)) {
    return trimmedColor;
  }
  
  console.warn(`Invalid color value rejected: ${color}`);
  return null;
};

export function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  // Build CSS safely with sanitized values
  const cssContent = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const cssVars = colorConfig
        .map(([key, itemConfig]) => {
          const rawColor =
            itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
            itemConfig.color;
          const color = sanitizeColor(rawColor || '');
          return color ? `  --color-${key.replace(/[^a-zA-Z0-9-]/g, '')}: ${color};` : null;
        })
        .filter(Boolean)
        .join("\n");
      
      return `${prefix} [data-chart=${id.replace(/[^a-zA-Z0-9-]/g, '')}] {\n${cssVars}\n}`;
    })
    .join("\n");

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: cssContent,
      }}
    />
  )
}
