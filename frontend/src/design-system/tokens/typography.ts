// Auto-generated typography tokens
export const typography = {
  "fontFamily": "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
  "h1": {
    "fontSize": "32px",
    "fontWeight": "700",
    "lineHeight": "40px",
    "letterSpacing": "-0.5px"
  },
  "h2": {
    "fontSize": "24px",
    "fontWeight": "600",
    "lineHeight": "32px",
    "letterSpacing": "-0.3px"
  },
  "h3": {
    "fontSize": "20px",
    "fontWeight": "600",
    "lineHeight": "28px",
    "letterSpacing": "0px"
  },
  "body": {
    "fontSize": "16px",
    "fontWeight": "400",
    "lineHeight": "24px",
    "letterSpacing": "0px"
  },
  "bodySmall": {
    "fontSize": "14px",
    "fontWeight": "400",
    "lineHeight": "20px",
    "letterSpacing": "0.1px"
  },
  "caption": {
    "fontSize": "12px",
    "fontWeight": "400",
    "lineHeight": "16px",
    "letterSpacing": "0.2px"
  }
};

// CSS Variables
export const typographyCSSVars = {
  '--font-family': typography.fontFamily,
  ...Object.entries(typography).filter(([key]) => key !== 'fontFamily').reduce((acc, [key, value]: [string, any]) => {
    if (typeof value === 'object') {
      acc[`--font-${key}-size`] = value.fontSize;
      acc[`--font-${key}-weight`] = value.fontWeight;
      acc[`--font-${key}-line-height`] = value.lineHeight;
    }
    return acc;
  }, {} as Record<string, any>),
} as const;
