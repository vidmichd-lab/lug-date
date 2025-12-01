// Responsive breakpoints
export const breakpoints = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px',
} as const;

export const breakpointCSSVars = {
  '--breakpoint-mobile': breakpoints.mobile,
  '--breakpoint-tablet': breakpoints.tablet,
  '--breakpoint-desktop': breakpoints.desktop,
} as const;
