/**
 * IconFromFigma component
 * Uses SVG files directly from Figma assets
 */

import { FC } from 'react';
import styles from './Icon.module.css';

export interface IconFromFigmaProps {
  svgPath: string;
  size?: number;
  className?: string;
  color?: string;
}

export const IconFromFigma: FC<IconFromFigmaProps> = ({ svgPath, size = 24, className, color }) => {
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
        src={svgPath}
        alt=""
        className={styles.iconSvg}
        style={{
          width: size,
          height: size,
          filter: color
            ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="colorize"><feColorMatrix type="matrix" values="0 0 0 0 ${color} 0 0 0 0 ${color} 0 0 0 0 ${color} 0 0 0 1 0"/></filter></svg>#colorize')`
            : undefined,
        }}
      />
    </div>
  );
};

