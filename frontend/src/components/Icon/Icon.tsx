/**
 * Icon component
 * Unified icon component using design-system icons
 * Can also use SVG files directly from Figma
 */

import { FC } from 'react';
import {
  Nameback,
  Nametg,
  Namewrong,
  Namenext,
  Nameok,
  Nameadd,
  Namemore,
  Namewave,
  Namebell,
  Namecards,
  Nameusers,
  Nameevents,
  Namearchive,
  Namesettings,
  Nameupdate,
  Namebookmark,
  Nameedit,
  Namecompany,
  Namejob,
  Namelink,
  Namelinkout,
  Nameeye,
  Namehide,
  Namereport,
  Nameprofile,
} from '../../design-system/components';
import styles from './Icon.module.css';

// Map icon names to SVG paths from Figma
// These paths are relative to the assets/figma directory
// In Vite, we can use import.meta.url or direct paths
const figmaIconMap: Partial<Record<IconName, string>> = {
  back: new URL('../../assets/figma/96a8b8430e0aaa5a3d0de63e804c333c525b296c.svg', import.meta.url)
    .href,
  next: new URL('../../assets/figma/c1bd97c0286d56cbc63942555bbb75ef87371418.svg', import.meta.url)
    .href,
  eye: new URL('../../assets/figma/028dd3884557c93c041ee3feabc732553e0129a6.svg', import.meta.url)
    .href,
  profile: new URL(
    '../../assets/figma/953fc2dd68f30b5e1c798f917a27931eb72ce08b.svg',
    import.meta.url
  ).href,
  // TODO: Сопоставить остальные иконки с SVG файлами из Figma
  // Нужно проверить в Figma дизайн-систему для правильного сопоставления
};

export type IconName =
  | 'back'
  | 'tg'
  | 'wrong'
  | 'next'
  | 'ok'
  | 'add'
  | 'more'
  | 'wave'
  | 'bell'
  | 'cards'
  | 'users'
  | 'events'
  | 'archive'
  | 'settings'
  | 'update'
  | 'bookmark'
  | 'edit'
  | 'company'
  | 'job'
  | 'link'
  | 'linkOut'
  | 'eye'
  | 'hide'
  | 'report'
  | 'profile';

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
}

const iconMap: Record<IconName, FC<{ className?: string }>> = {
  back: Nameback,
  tg: Nametg,
  wrong: Namewrong,
  next: Namenext,
  ok: Nameok,
  add: Nameadd,
  more: Namemore,
  wave: Namewave,
  bell: Namebell,
  cards: Namecards,
  users: Nameusers,
  events: Nameevents,
  archive: Namearchive,
  settings: Namesettings,
  update: Nameupdate,
  bookmark: Namebookmark,
  edit: Nameedit,
  company: Namecompany,
  job: Namejob,
  link: Namelink,
  linkOut: Namelinkout,
  eye: Nameeye,
  hide: Namehide,
  report: Namereport,
  profile: Nameprofile,
};

export const Icon: FC<IconProps> = ({ name, size = 24, className, color }) => {
  // First try to use SVG from Figma if available
  const figmaSvgPath = figmaIconMap[name];
  if (figmaSvgPath) {
    return (
      <div
        className={`${styles.icon} ${className || ''}`}
        style={{
          width: size,
          height: size,
          color: color,
        }}
      >
        <img
          src={figmaSvgPath}
          alt=""
          className={styles.iconSvg}
          style={{
            width: size,
            height: size,
          }}
        />
      </div>
    );
  }

  // Fallback to design-system component
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <div
      className={`${styles.icon} ${className || ''}`}
      style={{
        width: size,
        height: size,
        color: color,
      }}
    >
      <IconComponent className={styles.iconSvg} />
    </div>
  );
};
