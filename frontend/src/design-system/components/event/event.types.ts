import { ReactNode } from 'react';

export interface EventProps {
  children?: ReactNode;
  className?: string;
  [key: string]: any;
}
