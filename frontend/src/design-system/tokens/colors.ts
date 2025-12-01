// Auto-generated color tokens
export const colors = {
  "light": {
    "primary": "#FF6B6B",
    "secondary": "#4ECDC4",
    "background": "#FFFFFF",
    "backgroundSecondary": "#F8F9FA",
    "text": "#2D3436",
    "textSecondary": "#636E72",
    "border": "#DFE6E9",
    "error": "#FF3B30",
    "success": "#34C759",
    "warning": "#FF9500",
    "info": "#007AFF"
  },
  "dark": {
    "primary": "#FF8E8E",
    "secondary": "#6EDDD6",
    "background": "#1A1A1A",
    "backgroundSecondary": "#2D2D2D",
    "text": "#FFFFFF",
    "textSecondary": "#CCCCCC",
    "border": "#404040",
    "error": "#FF5C5C",
    "success": "#4CD964",
    "warning": "#FFB340",
    "info": "#5AC8FA"
  }
};

// CSS Variables helper
export const colorCSSVars = {
  ...Object.entries(colors.light).reduce((acc, [key, value]) => {
    acc[`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
    return acc;
  }, {} as Record<string, any>),
} as const;
