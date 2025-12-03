/**
 * Script to extract icons from Figma designs and create icon components
 * Uses MCP Figma Desktop to get design context and extract SVG icons
 */

import * as fs from 'fs-extra';
import * as path from 'path';

const ICONS_OUTPUT_DIR = path.join(__dirname, '../frontend/src/assets/icons');
const FIGMA_ASSETS_DIR = path.join(__dirname, '../frontend/src/assets/figma');

interface IconInfo {
  name: string;
  svgPath: string;
  nodeId: string;
}

/**
 * Extract icons from Figma node
 * This function should be called with MCP get_design_context
 */
async function extractIconsFromNode(nodeId: string): Promise<IconInfo[]> {
  // This would be called via MCP in real implementation
  // For now, we'll scan existing SVG files and match them to icon names

  const icons: IconInfo[] = [];

  // Read all SVG files from figma assets
  if (await fs.pathExists(FIGMA_ASSETS_DIR)) {
    const svgFiles = await fs.readdir(FIGMA_ASSETS_DIR);
    const svgFilesList = svgFiles.filter((f) => f.endsWith('.svg'));

    // Try to identify icons by content
    for (const svgFile of svgFilesList) {
      const svgPath = path.join(FIGMA_ASSETS_DIR, svgFile);
      const content = await fs.readFile(svgPath, 'utf-8');

      // Simple heuristics to identify icon types
      let iconName: string | null = null;

      if (content.includes('Vector') && content.includes('fill-rule')) {
        // Check for back arrow pattern
        if (content.includes('0.661017') || content.includes('0.194127')) {
          iconName = 'back';
        }
        // Check for next arrow pattern
        else if (content.includes('6.421') || content.includes('6.64067')) {
          iconName = 'next';
        }
        // Check for eye icon
        else if (content.includes('7.75 8') && content.includes('10.25')) {
          iconName = 'eye';
        }
      }

      if (iconName) {
        icons.push({
          name: iconName,
          svgPath: `/src/assets/figma/${svgFile}`,
          nodeId: nodeId,
        });
      }
    }
  }

  return icons;
}

/**
 * Create React component for icon using SVG
 */
function createIconComponent(icon: IconInfo): string {
  const componentName = `Icon${icon.name.charAt(0).toUpperCase() + icon.name.slice(1)}`;

  return `/**
 * ${componentName} component
 * Extracted from Figma design
 */

import React from 'react';
import iconSvg from '${icon.svgPath}';
import styles from './Icon.module.css';

export interface ${componentName}Props {
  className?: string;
  size?: number;
  color?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  size = 24,
  color,
}) => {
  return (
    <div
      className={\`\${styles.icon} \${className || ''}\`}
      style={{
        width: size,
        height: size,
        color: color,
      }}
    >
      <img
        src={iconSvg}
        alt=""
        className={styles.iconSvg}
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
};

${componentName}.displayName = '${componentName}';
`;
}

async function main() {
  console.log('🎨 Извлечение иконок из Figma...\n');

  // Ensure output directory exists
  await fs.ensureDir(ICONS_OUTPUT_DIR);

  // For now, we'll create a mapping file that can be updated manually
  // In the future, this should use MCP to extract icons directly

  console.log('📝 Создание карты иконок...');
  console.log('⚠️  Для автоматического извлечения иконок нужно:');
  console.log('   1. Использовать MCP get_design_context для каждого узла с иконкой');
  console.log('   2. Извлечь SVG из ответа');
  console.log('   3. Сохранить в assets/icons с понятными именами');
  console.log('   4. Создать компоненты React для каждой иконки\n');

  console.log('✅ Готово!');
}

main().catch(console.error);
