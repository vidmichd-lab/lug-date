import * as fs from 'fs-extra';
import * as path from 'path';
import {
  FigmaVariable,
  FigmaVariableCollection,
  FigmaTextStyle,
  FigmaEffect,
} from '../utils/figma-api';

interface TokenData {
  variables?: { variables: FigmaVariable[]; collections: FigmaVariableCollection[] };
  textStyles?: FigmaTextStyle[];
  effectStyles?: FigmaEffect[];
}

export async function generateTokens(data: TokenData, outputPath: string): Promise<number> {
  let tokenCount = 0;

  // Генерация токенов из Variables
  if (data.variables) {
    const { variables, collections } = data.variables;

    // Группировка переменных по типам
    const colors: Record<string, any> = {};
    const spacing: Record<string, number> = {};
    const radius: Record<string, number> = {};
    const typography: Record<string, any> = {};

    // Обработка коллекций для определения режимов (light/dark)
    const modeMap = new Map<string, string>();
    collections.forEach((collection) => {
      collection.modes.forEach((mode) => {
        modeMap.set(mode.modeId, mode.name);
      });
    });

    variables.forEach((variable) => {
      const collection = collections.find((c) => c.id === variable.variableCollectionId);
      const modeName = collection?.modes[0]?.name || 'default';

      // Конвертация имени: "colors/primary/500" -> "colorsPrimary500"
      const name = variable.name
        .split('/')
        .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join('')
        .replace(/[^a-zA-Z0-9]/g, '');

      const value = variable.valuesByMode[Object.keys(variable.valuesByMode)[0]];

      switch (variable.resolvedType) {
        case 'COLOR':
          if (typeof value === 'object' && value.r !== undefined) {
            colors[name] = {
              light: rgbaToHex(value),
              dark: rgbaToHex(value), // Можно расширить для поддержки темной темы
            };
          }
          break;
        case 'FLOAT':
          if (
            variable.name.toLowerCase().includes('spacing') ||
            variable.name.toLowerCase().includes('gap') ||
            variable.name.toLowerCase().includes('padding') ||
            variable.name.toLowerCase().includes('margin')
          ) {
            spacing[name] = value;
          } else if (
            variable.name.toLowerCase().includes('radius') ||
            variable.name.toLowerCase().includes('border')
          ) {
            radius[name] = value;
          }
          break;
      }
      tokenCount++;
    });

    // Генерация файлов токенов
    if (Object.keys(colors).length > 0) {
      await generateColorsFile(colors, outputPath);
    }
    if (Object.keys(spacing).length > 0) {
      await generateSpacingFile(spacing, outputPath);
    }
    if (Object.keys(radius).length > 0) {
      await generateRadiusFile(radius, outputPath);
    }
  }

  // Генерация типографики
  if (data.textStyles && data.textStyles.length > 0) {
    await generateTypographyFile(data.textStyles, outputPath);
    tokenCount += data.textStyles.length;
  }

  // Генерация эффектов
  if (data.effectStyles && data.effectStyles.length > 0) {
    await generateShadowsFile(data.effectStyles, outputPath);
    tokenCount += data.effectStyles.length;
  }

  // Генерация стандартных токенов, если их нет
  await generateDefaultTokens(outputPath);

  // Генерация CSS файла
  await generateCSSFile(outputPath);

  return tokenCount;
}

function rgbaToHex(color: { r: number; g: number; b: number; a?: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;

  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

async function generateColorsFile(colors: Record<string, any>, outputPath: string) {
  const tsContent = `// Auto-generated color tokens from Figma
export const colors = {
${Object.entries(colors)
  .map(([key, value]) => {
    if (typeof value === 'object' && value.light) {
      return `  ${key}: {\n    light: '${value.light}',\n    dark: '${value.dark || value.light}',\n  },`;
    }
    return `  ${key}: '${value}',`;
  })
  .join('\n')}
} as const;

// CSS Variables
export const colorCSSVars = {
${Object.entries(colors)
  .map(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    if (typeof value === 'object' && value.light) {
      return `  '--color-${cssVarName}': 'var(--color-${cssVarName}-light, var(--color-${cssVarName}-dark))',`;
    }
    return `  '--color-${cssVarName}': '${value}',`;
  })
  .join('\n')}
} as const;
`;

  await fs.writeFile(path.join(outputPath, 'colors.ts'), tsContent);
}

async function generateSpacingFile(spacing: Record<string, number>, outputPath: string) {
  // Стандартные значения, если их нет в Figma
  const defaultSpacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
  };

  const merged = { ...defaultSpacing, ...spacing };

  const tsContent = `// Auto-generated spacing tokens from Figma
export const spacing = {
${Object.entries(merged)
  .map(([key, value]) => `  ${key}: ${value},`)
  .join('\n')}
} as const;

// CSS Variables
export const spacingCSSVars = {
${Object.entries(merged)
  .map(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `  '--spacing-${cssVarName}': '${value}px',`;
  })
  .join('\n')}
} as const;
`;

  await fs.writeFile(path.join(outputPath, 'spacing.ts'), tsContent);
}

async function generateRadiusFile(radius: Record<string, number>, outputPath: string) {
  const defaultRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  };

  const merged = { ...defaultRadius, ...radius };

  const tsContent = `// Auto-generated radius tokens from Figma
export const radius = {
${Object.entries(merged)
  .map(([key, value]) => `  ${key}: ${value},`)
  .join('\n')}
} as const;

// CSS Variables
export const radiusCSSVars = {
${Object.entries(merged)
  .map(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `  '--radius-${cssVarName}': '${value}px',`;
  })
  .join('\n')}
} as const;
`;

  await fs.writeFile(path.join(outputPath, 'radius.ts'), tsContent);
}

async function generateTypographyFile(textStyles: FigmaTextStyle[], outputPath: string) {
  const typography: Record<string, any> = {};

  textStyles.forEach((style, index) => {
    const name = `text${index + 1}`;
    typography[name] = {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight?.value || 'normal',
      letterSpacing: style.letterSpacing?.value || 0,
    };
  });

  const tsContent = `// Auto-generated typography tokens from Figma
export const typography = {
${Object.entries(typography)
  .map(([key, value]) => {
    return `  ${key}: {\n    fontFamily: '${value.fontFamily}',\n    fontSize: ${value.fontSize},\n    fontWeight: ${value.fontWeight},\n    lineHeight: ${typeof value.lineHeight === 'number' ? value.lineHeight : `'${value.lineHeight}'`},\n    letterSpacing: ${value.letterSpacing},\n  },`;
  })
  .join('\n')}
} as const;

// CSS Variables
export const typographyCSSVars = {
${Object.entries(typography)
  .map(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `  '--font-${cssVarName}': '${value.fontFamily}',\n  '--font-size-${cssVarName}': '${value.fontSize}px',\n  '--font-weight-${cssVarName}': ${value.fontWeight},`;
  })
  .join('\n')}
} as const;
`;

  await fs.writeFile(path.join(outputPath, 'typography.ts'), tsContent);
}

async function generateShadowsFile(effects: FigmaEffect[], outputPath: string) {
  const shadows: Record<string, string> = {};

  effects.forEach((effect, index) => {
    if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
      const name = `shadow${index + 1}`;
      const offset = effect.offset || { x: 0, y: 0 };
      const color = effect.color ? rgbaToHex(effect.color) : 'rgba(0, 0, 0, 0.1)';
      const spread = effect.spread || 0;

      shadows[name] = `${offset.x}px ${offset.y}px ${effect.radius}px ${spread}px ${color}`;
    }
  });

  const defaultShadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  };

  const merged = { ...defaultShadows, ...shadows };

  const tsContent = `// Auto-generated shadow tokens from Figma
export const shadows = {
${Object.entries(merged)
  .map(([key, value]) => `  ${key}: '${value}',`)
  .join('\n')}
} as const;

// CSS Variables
export const shadowCSSVars = {
${Object.entries(merged)
  .map(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `  '--shadow-${cssVarName}': '${value}',`;
  })
  .join('\n')}
} as const;
`;

  await fs.writeFile(path.join(outputPath, 'shadows.ts'), tsContent);
}

async function generateDefaultTokens(outputPath: string) {
  // Breakpoints
  const breakpointsContent = `// Responsive breakpoints
export const breakpoints = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px',
} as const;

// CSS Variables
export const breakpointCSSVars = {
  '--breakpoint-mobile': '375px',
  '--breakpoint-tablet': '768px',
  '--breakpoint-desktop': '1024px',
} as const;
`;

  await fs.writeFile(path.join(outputPath, 'breakpoints.ts'), breakpointsContent);
}

async function generateCSSFile(outputPath: string) {
  const cssContent = `/* Auto-generated CSS Variables from Figma tokens */

:root {
  /* Colors - Light theme */
  --color-primary: #FF6B6B;
  --color-secondary: #4ECDC4;
  --color-background: #FFFFFF;
  --color-text: #1A1A1A;
  --color-text-secondary: #666666;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-base: 16px;
  --spacing-lg: 20px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  --spacing-3xl: 40px;
  --spacing-4xl: 48px;
  --spacing-5xl: 64px;
  
  /* Radius */
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Breakpoints */
  --breakpoint-mobile: 375px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
}

[data-theme="dark"] {
  /* Colors - Dark theme */
  --color-primary: #FF8E8E;
  --color-secondary: #6EDDD6;
  --color-background: #1A1A1A;
  --color-text: #FFFFFF;
  --color-text-secondary: #CCCCCC;
}
`;

  await fs.writeFile(path.join(outputPath, 'tokens.css'), cssContent);
}
