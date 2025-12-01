import * as fs from 'fs-extra';
import * as path from 'path';
import { FigmaComponent, FigmaNode } from '../utils/figma-api';

export async function generateComponents(
  components: FigmaComponent[],
  outputPath: string,
  tokensPath: string
): Promise<number> {
  let generatedCount = 0;

  for (const component of components) {
    try {
      const componentName = sanitizeComponentName(component.name);
      const componentDir = path.join(outputPath, componentName);

      await fs.ensureDir(componentDir);

      // Генерация TypeScript компонента
      await generateComponentTS(component, componentName, componentDir, tokensPath);

      // Генерация типов
      await generateComponentTypes(component, componentName, componentDir);

      // Генерация CSS Module
      await generateComponentCSS(component, componentName, componentDir, tokensPath);

      // Генерация index.ts
      await generateComponentIndex(componentName, componentDir);

      generatedCount++;
    } catch (error) {
      console.warn(`⚠️  Пропущен компонент ${component.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return generatedCount;
}

function sanitizeComponentName(name: string): string {
  // Конвертация в PascalCase и удаление спецсимволов
  return name
    .split(/[\s\-_/]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
}

async function generateComponentTS(
  component: FigmaComponent,
  componentName: string,
  componentDir: string,
  tokensPath: string
) {
  // Определение вариантов из имени компонента
  const hasVariants = component.componentSetId !== undefined;
  const variantProps = hasVariants ? ['variant'] : [];

  const propsInterface = `I${componentName}Props`;
  const importPath = path.relative(componentDir, tokensPath).replace(/\\/g, '/');

  const tsContent = `import React from 'react';
import { ${propsInterface} } from './${componentName}.types';
import styles from './${componentName}.module.css';

/**
 * ${component.description || `${componentName} component`}
 * 
 * ${component.documentationLinks?.map(link => `Documentation: ${link.uri}`).join('\n') || ''}
 */
export const ${componentName}: React.FC<${propsInterface}> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={\`\${styles.${componentName.toLowerCase()}} \${className || ''}\`} {...props}>
      {children}
    </div>
  );
};

${componentName}.displayName = '${componentName}';
`;

  await fs.writeFile(path.join(componentDir, `${componentName}.tsx`), tsContent);
}

async function generateComponentTypes(
  component: FigmaComponent,
  componentName: string,
  componentDir: string
) {
  const hasVariants = component.componentSetId !== undefined;
  
  let variantType = '';
  if (hasVariants) {
    // Определяем варианты из имени (например, "Button/Primary" -> variant: 'primary' | 'secondary')
    const nameParts = component.name.split('/');
    if (nameParts.length > 1) {
      const variants = nameParts.slice(1).map(v => `'${v.toLowerCase()}'`).join(' | ');
      variantType = `  variant?: ${variants};\n`;
    } else {
      variantType = `  variant?: 'default' | 'primary' | 'secondary';\n`;
    }
  }

  const typesContent = `import { ReactNode } from 'react';

export interface I${componentName}Props {
  children?: ReactNode;
  className?: string;
${variantType}  [key: string]: any;
}
`;

  await fs.writeFile(path.join(componentDir, `${componentName}.types.ts`), typesContent);
}

async function generateComponentCSS(
  component: FigmaComponent,
  componentName: string,
  componentDir: string,
  tokensPath: string
) {
  const cssVarPath = path.relative(componentDir, tokensPath).replace(/\\/g, '/');
  const cssContent = `.${componentName.toLowerCase()} {
  /* Component styles using design tokens */
  padding: var(--spacing-base, 16px);
  border-radius: var(--radius-md, 8px);
  background-color: var(--color-background, #ffffff);
  color: var(--color-text, #1a1a1a);
}

/* Variants */
.${componentName.toLowerCase()}Primary {
  background-color: var(--color-primary, #ff6b6b);
  color: var(--color-text, #ffffff);
}

.${componentName.toLowerCase()}Secondary {
  background-color: var(--color-secondary, #4ecdc4);
  color: var(--color-text, #ffffff);
}
`;

  await fs.writeFile(path.join(componentDir, `${componentName}.module.css`), cssContent);
}

async function generateComponentIndex(
  componentName: string,
  componentDir: string
) {
  const indexContent = `export { ${componentName} } from './${componentName}';
export type { I${componentName}Props } from './${componentName}.types';
`;

  await fs.writeFile(path.join(componentDir, 'index.ts'), indexContent);
}

