// Auto-generated radius tokens
export const radius = {
  "none": "0px",
  "sm": "4px",
  "md": "8px",
  "lg": "12px",
  "xl": "16px",
  "2xl": "24px",
  "full": "9999px"
};

// CSS Variables
export const radiusCSSVars = {
  ...Object.entries(radius).reduce((acc, [key, value]) => {
    acc[`--radius-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
    return acc;
  }, {} as Record<string, any>),
} as const;
