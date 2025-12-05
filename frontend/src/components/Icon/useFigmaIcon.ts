/**
 * Hook to get icon SVG path from Figma assets
 * Maps icon names to their corresponding SVG files from Figma
 */

// This mapping should be generated automatically from Figma designs
// For now, we'll maintain it manually based on extracted SVG files
export const figmaIconMap: Record<string, string> = {
  // Back arrow icon - need to identify correct SVG
  // back: '/src/assets/figma/96a8b8430e0aaa5a3d0de63e804c333c525b296c.svg',
  // Next arrow icon - need to identify correct SVG
  // next: '/src/assets/figma/c1bd97c0286d56cbc63942555bbb75ef87371418.svg',
  // Eye icon - need to identify correct SVG
  // eye: '/src/assets/figma/028dd3884557c93c041ee3feabc732553e0129a6.svg',
};

/**
 * Get SVG path for icon from Figma assets
 */
export function getFigmaIconPath(iconName: string): string | null {
  return figmaIconMap[iconName] || null;
}

/**
 * Import SVG as React component
 * This allows us to use SVG files directly from Figma
 */
export async function importFigmaIcon(svgPath: string): Promise<string> {
  // In Vite, we can import SVG files directly
  // This will be handled at build time
  return svgPath;
}

