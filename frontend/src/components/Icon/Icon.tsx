/**
 * Icon component
 * Unified icon component using design-system icons
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
