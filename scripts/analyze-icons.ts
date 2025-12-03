/**
 * Script to analyze SVG icons from Figma and match them with icon names
 */

import * as fs from 'fs-extra';
import * as path from 'path';

const FIGMA_ASSETS_DIR = path.join(__dirname, '../frontend/src/assets/figma');
const ICON_NAMES = [
  'back',
  'tg',
  'wrong',
  'next',
  'ok',
  'add',
  'more',
  'wave',
  'bell',
  'cards',
  'users',
  'events',
  'archive',
  'settings',
  'update',
  'bookmark',
  'edit',
  'company',
  'job',
  'link',
  'linkOut',
  'eye',
  'hide',
  'report',
  'profile',
];

interface IconAnalysis {
  fileName: string;
  filePath: string;
  content: string;
  viewBox: string;
  paths: number;
  possibleMatches: string[];
}

/**
 * Analyze SVG file and try to identify which icon it represents
 */
function analyzeSvg(filePath: string): IconAnalysis {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);

  // Extract viewBox
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '';

  // Count paths
  const pathMatches = content.match(/<path[^>]*>/g);
  const paths = pathMatches ? pathMatches.length : 0;

  // Try to identify icon based on content patterns
  const possibleMatches: string[] = [];

  // Back arrow patterns
  if (
    content.includes('0.661017') ||
    content.includes('0.194127') ||
    content.includes('rotate(45deg)')
  ) {
    possibleMatches.push('back');
  }

  // Next arrow patterns
  if (content.includes('6.421') || content.includes('6.64067') || content.includes('12.827')) {
    possibleMatches.push('next');
  }

  // Eye icon patterns
  if (content.includes('7.75 8') && content.includes('10.25') && content.includes('M0 8')) {
    possibleMatches.push('eye');
  }

  // Telegram icon (usually has specific patterns)
  if (
    content.includes('telegram') ||
    content.includes('tg') ||
    (viewBox.includes('24') && paths > 3)
  ) {
    possibleMatches.push('tg');
  }

  // Profile/user icon (usually circular or person shape)
  if (content.includes('circle') && paths > 2) {
    possibleMatches.push('profile');
  }

  // Settings icon (usually gear/cog shape)
  if (content.includes('M12') && content.includes('rotate')) {
    possibleMatches.push('settings');
  }

  // Bell icon (usually bell shape)
  if (viewBox.includes('20') && paths > 3) {
    possibleMatches.push('bell');
  }

  // Add/plus icon
  if (content.includes('M12') && content.includes('M12') && paths === 2) {
    possibleMatches.push('add');
  }

  // More/dots icon
  if (content.includes('circle') && paths === 3) {
    possibleMatches.push('more');
  }

  return {
    fileName,
    filePath,
    content,
    viewBox,
    paths,
    possibleMatches,
  };
}

async function main() {
  console.log('🔍 Анализ иконок из Figma...\n');

  if (!(await fs.pathExists(FIGMA_ASSETS_DIR))) {
    console.error(`❌ Директория не найдена: ${FIGMA_ASSETS_DIR}`);
    return;
  }

  const svgFiles = (await fs.readdir(FIGMA_ASSETS_DIR))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => path.join(FIGMA_ASSETS_DIR, f));

  console.log(`📁 Найдено ${svgFiles.length} SVG файлов\n`);

  const analyses: IconAnalysis[] = [];

  for (const svgFile of svgFiles) {
    try {
      const analysis = analyzeSvg(svgFile);
      analyses.push(analysis);
    } catch (error) {
      console.error(`❌ Ошибка при анализе ${svgFile}:`, error);
    }
  }

  // Group by possible matches
  const iconMap: Record<string, IconAnalysis[]> = {};

  for (const analysis of analyses) {
    if (analysis.possibleMatches.length > 0) {
      for (const match of analysis.possibleMatches) {
        if (!iconMap[match]) {
          iconMap[match] = [];
        }
        iconMap[match].push(analysis);
      }
    }
  }

  console.log('📊 Результаты анализа:\n');

  // Show matched icons
  console.log('✅ Иконки с возможными совпадениями:');
  for (const iconName of ICON_NAMES) {
    if (iconMap[iconName]) {
      console.log(`\n  ${iconName}:`);
      for (const analysis of iconMap[iconName]) {
        console.log(
          `    - ${analysis.fileName} (viewBox: ${analysis.viewBox}, paths: ${analysis.paths})`
        );
      }
    }
  }

  // Show unmatched icons
  console.log('\n\n❓ Иконки без совпадений:');
  for (const iconName of ICON_NAMES) {
    if (!iconMap[iconName] || iconMap[iconName].length === 0) {
      console.log(`  - ${iconName}`);
    }
  }

  // Show unmatched SVG files
  const matchedFiles = new Set(
    Object.values(iconMap)
      .flat()
      .map((a) => a.fileName)
  );
  const unmatchedFiles = analyses.filter((a) => !matchedFiles.has(a.fileName));

  if (unmatchedFiles.length > 0) {
    console.log('\n\n📦 SVG файлы без совпадений:');
    for (const analysis of unmatchedFiles) {
      console.log(
        `  - ${analysis.fileName} (viewBox: ${analysis.viewBox}, paths: ${analysis.paths})`
      );
    }
  }

  // Generate mapping code
  console.log('\n\n💻 Предлагаемый маппинг для Icon.tsx:\n');
  console.log('const figmaIconMap: Partial<Record<IconName, string>> = {');

  for (const iconName of ICON_NAMES) {
    if (iconMap[iconName] && iconMap[iconName].length > 0) {
      // Use the first match
      const match = iconMap[iconName][0];
      const relativePath = `/src/assets/figma/${match.fileName}`;
      console.log(`  ${iconName}: '${relativePath}',`);
    }
  }

  console.log('};');

  console.log('\n✅ Анализ завершен!');
}

main().catch(console.error);
