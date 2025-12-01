// Auto-generated spacing tokens
export const spacing = {
  "xs": "4px",
  "sm": "8px",
  "md": "12px",
  "base": "16px",
  "lg": "20px",
  "xl": "24px",
  "2xl": "32px",
  "3xl": "40px",
  "4xl": "48px",
  "5xl": "64px"
};

// CSS Variables
export const spacingCSSVars = {
  ...Object.entries(spacing).reduce((acc, [key, value]) => {
    acc[`--spacing-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
    return acc;
  }, {} as Record<string, any>),
} as const;
