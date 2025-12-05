/**
 * Script to fix import case mismatches in design-system components
 * Fixes imports to match actual file names (lowercase)
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const DESIGN_SYSTEM_PATH = join(process.cwd(), 'frontend/src/design-system/components');

interface ComponentFiles {
  tsx: string | null;
  types: string | null;
  css: string | null;
  index: string | null;
}

async function getComponentFiles(componentDir: string): Promise<ComponentFiles> {
  const files = await readdir(componentDir);
  const result: ComponentFiles = {
    tsx: null,
    types: null,
    css: null,
    index: null,
  };

  for (const file of files) {
    if (file.endsWith('.tsx') && !file.includes('index')) {
      result.tsx = file;
    } else if (file.endsWith('.types.ts')) {
      result.types = file;
    } else if (file.endsWith('.module.css')) {
      result.css = file;
    } else if (file === 'index.ts') {
      result.index = file;
    }
  }

  return result;
}

function getBaseName(file: string): string {
  return file.replace(/\.(tsx|ts|css)$/, '').replace(/\.module$/, '');
}

async function fixComponentImports(componentDir: string, componentName: string): Promise<boolean> {
  const files = await getComponentFiles(componentDir);
  let changed = false;

  // Fix index.ts
  if (files.index) {
    const indexPath = join(componentDir, files.index);
    let content = await readFile(indexPath, 'utf-8');
    const originalContent = content;

    // Get actual file names
    const actualTsxName = files.tsx ? getBaseName(files.tsx) : null;
    const actualTypesName = files.types ? getBaseName(files.types) : null;

    if (actualTsxName && actualTypesName) {
      // Replace imports with actual file names (lowercase)
      content = content.replace(/from ['"]\.\/([A-Z][a-zA-Z0-9]+)['"]/g, (match, name) => {
        const lowerName = name.toLowerCase();
        if (lowerName === actualTsxName.toLowerCase()) {
          return `from './${actualTsxName}'`;
        }
        return match;
      });

      content = content.replace(/from ['"]\.\/([A-Z][a-zA-Z0-9]+)\.types['"]/g, (match, name) => {
        const lowerName = name.toLowerCase();
        if (lowerName === actualTypesName.toLowerCase()) {
          return `from './${actualTypesName}.types'`;
        }
        return match;
      });

      if (content !== originalContent) {
        await writeFile(indexPath, content, 'utf-8');
        changed = true;
        console.log(`✅ Fixed ${componentName}/index.ts`);
      }
    }
  }

  // Fix component.tsx
  if (files.tsx) {
    const tsxPath = join(componentDir, files.tsx);
    let content = await readFile(tsxPath, 'utf-8');
    const originalContent = content;

    const actualCssName = files.css ? getBaseName(files.css) : null;
    const actualTypesName = files.types ? getBaseName(files.types) : null;

    if (actualCssName && actualTypesName) {
      // Fix CSS import
      content = content.replace(
        /from ['"]\.\/([A-Z][a-zA-Z0-9]+)\.module\.css['"]/g,
        (match, name) => {
          const lowerName = name.toLowerCase();
          if (lowerName === actualCssName.toLowerCase()) {
            return `from './${actualCssName}.module.css'`;
          }
          return match;
        }
      );

      // Fix types import
      content = content.replace(/from ['"]\.\/([A-Z][a-zA-Z0-9]+)\.types['"]/g, (match, name) => {
        const lowerName = name.toLowerCase();
        if (lowerName === actualTypesName.toLowerCase()) {
          return `from './${actualTypesName}.types'`;
        }
        return match;
      });

      if (content !== originalContent) {
        await writeFile(tsxPath, content, 'utf-8');
        changed = true;
        console.log(`✅ Fixed ${componentName}/${files.tsx}`);
      }
    }
  }

  return changed;
}

async function main() {
  console.log('🔧 Fixing import case mismatches...\n');

  const components = await readdir(DESIGN_SYSTEM_PATH);
  let totalFixed = 0;

  for (const component of components) {
    const componentPath = join(DESIGN_SYSTEM_PATH, component);
    const stat = await import('fs/promises').then((m) => m.stat(componentPath));

    if (stat.isDirectory()) {
      const changed = await fixComponentImports(componentPath, component);
      if (changed) {
        totalFixed++;
      }
    }
  }

  console.log(`\n✨ Fixed ${totalFixed} components`);
}

main().catch(console.error);

